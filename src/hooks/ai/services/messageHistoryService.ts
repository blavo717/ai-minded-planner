
import { supabase } from '@/integrations/supabase/client';
import { EnhancedMessage } from '../types/enhancedAITypes';
import { messageProcessingService } from './messageProcessingService';
import { conversationCache } from './conversationCache';

// NUEVO: Cache local con TTL mejorado
interface CacheEntry {
  data: EnhancedMessage[];
  timestamp: number;
  userId: string;
}

class MessageHistoryCache {
  private cache = new Map<string, CacheEntry>();
  private TTL = 5 * 60 * 1000; // 5 minutos TTL

  get(userId: string): EnhancedMessage[] | null {
    const entry = this.cache.get(userId);
    if (!entry) return null;

    const isExpired = (Date.now() - entry.timestamp) > this.TTL;
    if (isExpired) {
      console.log('🕒 Cache expirado, eliminando entrada');
      this.cache.delete(userId);
      return null;
    }

    console.log('✅ Cache hit - datos desde cache local');
    return entry.data;
  }

  set(userId: string, data: EnhancedMessage[]): void {
    this.cache.set(userId, {
      data: [...data], // Crear copia para evitar mutaciones
      timestamp: Date.now(),
      userId
    });
    console.log(`💾 Cache actualizado para usuario ${userId} - ${data.length} mensajes`);
  }

  clear(userId?: string): void {
    if (userId) {
      this.cache.delete(userId);
      console.log(`🧹 Cache limpiado para usuario ${userId}`);
    } else {
      this.cache.clear();
      console.log('🧹 Cache completamente limpiado');
    }
  }

  // Limpiar entradas expiradas automáticamente
  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [userId, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) > this.TTL) {
        this.cache.delete(userId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Limpiadas ${cleaned} entradas de cache expiradas`);
    }
  }
}

// Instancia global del cache
const historyCache = new MessageHistoryCache();

// Limpiar cache cada 10 minutos
setInterval(() => historyCache.cleanup(), 10 * 60 * 1000);

export const messageHistoryService = {
  async loadConversationHistory(userId: string): Promise<EnhancedMessage[]> {
    try {
      console.log('📚 Intentando cargar historial de conversación...');
      
      // NUEVO: Verificar conversation cache primero
      const cachedConversation = conversationCache.get(userId);
      if (cachedConversation) {
        console.log('🚀 Conversation cache hit - retornando datos');
        return cachedConversation;
      }

      // Verificar cache de historial tradicional
      const cachedData = historyCache.get(userId);
      if (cachedData) {
        // Guardar en conversation cache también
        conversationCache.set(userId, cachedData);
        return cachedData;
      }

      console.log('🔄 Cache miss - cargando desde base de datos...');
      
      // Limpiar duplicados antes de cargar
      const { error: cleanError } = await supabase.rpc('clean_duplicate_ai_messages');
      if (cleanError) {
        console.warn('⚠️ Advertencia al limpiar duplicados:', cleanError);
      }

      // Query optimizada con paginación
      const { data: chatMessages, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(100); // Aumentado para mejor contexto

      if (error) {
        console.error('❌ Error loading chat history:', error);
        return [];
      }

      if (!chatMessages || chatMessages.length === 0) {
        console.log('📝 No hay historial previo');
        historyCache.set(userId, []); // Cachear resultado vacío
        return [];
      }

      // Convertir datos de BD a formato interno
      const loadedMessages: EnhancedMessage[] = chatMessages.map(msg => ({
        id: msg.id,
        type: msg.type as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        metadata: typeof msg.context_data === 'object' ? msg.context_data as any : {}
      }));

      // Procesar con algoritmo mejorado
      const cleanedMessages = messageProcessingService.cleanInvalidMessages(loadedMessages);
      const uniqueMessages = messageProcessingService.removeDuplicateMessages(cleanedMessages);

      // Guardar en ambos caches
      historyCache.set(userId, uniqueMessages);
      conversationCache.set(userId, uniqueMessages);

      console.log(`✅ Historial cargado: ${uniqueMessages.length} mensajes únicos desde BD`);
      return uniqueMessages;
      
    } catch (error) {
      console.error('❌ Error loading conversation history:', error);
      return [];
    }
  },

  async saveMessageToHistory(message: EnhancedMessage, userId: string): Promise<void> {
    try {
      // Validar mensaje antes de guardar
      if (!messageProcessingService.validateMessage(message)) {
        console.error('❌ Mensaje inválido, no se guardará:', message);
        return;
      }

      const { error } = await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: userId,
          type: message.type,
          content: message.content,
          context_data: message.metadata || {},
          is_read: true,
        });

      if (error) {
        console.error('❌ Error saving message:', error);
      } else {
        console.log(`💾 Mensaje guardado: ${message.type} - ${message.content.substring(0, 50)}...`);
        
        // NUEVO: Invalidar cache tradicional y actualizar conversation cache
        historyCache.clear(userId);
        conversationCache.addMessage(userId, message);
      }
    } catch (error) {
      console.error('❌ Error saving message to history:', error);
    }
  },

  // Función para limpiar caches manualmente
  clearCache(userId?: string): void {
    historyCache.clear(userId);
    if (userId) {
      conversationCache.invalidate(userId);
    } else {
      conversationCache.clear();
    }
  },

  // Función para obtener estadísticas de ambos caches
  getCacheStats(): { history: any, conversations: any } {
    const historyStats = {
      size: historyCache['cache'].size,
      users: Array.from(historyCache['cache'].keys())
    };
    
    const conversationStats = conversationCache.getStats();
    
    console.log('📊 Cache stats:', { history: historyStats, conversations: conversationStats });
    return { history: historyStats, conversations: conversationStats };
  }
};
