
import { EnhancedMessage } from '../types/enhancedAITypes';

// Configuración del cache
interface CacheConfig {
  maxConversations: number;
  conversationTTL: number; // TTL por conversación
  globalTTL: number; // TTL global del cache
  maxMessagesPerConversation: number;
  enableCompression: boolean;
}

// Entrada del cache
interface ConversationCacheEntry {
  messages: EnhancedMessage[];
  lastAccessed: number;
  lastModified: number;
  conversationId: string;
  userId: string;
  messageCount: number;
  sizeBytes: number;
  hitCount: number;
}

// Estadísticas del cache
interface CacheStats {
  totalEntries: number;
  totalMessages: number;
  hitRate: number;
  missRate: number;
  memoryUsage: number; // en KB
  avgConversationSize: number;
  oldestEntry: number; // timestamp
  newestEntry: number; // timestamp
}

// Clase principal del cache de conversaciones
class ConversationCache {
  private cache = new Map<string, ConversationCacheEntry>();
  private hitCount = 0;
  private missCount = 0;
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxConversations: 50,
      conversationTTL: 30 * 60 * 1000, // 30 minutos
      globalTTL: 2 * 60 * 60 * 1000, // 2 horas
      maxMessagesPerConversation: 200,
      enableCompression: true,
      ...config,
    };

    this.startCleanupTimer();
    console.log('🚀 ConversationCache inicializado:', this.config);
  }

  // Generar clave del cache
  private generateCacheKey(userId: string, conversationId: string = 'default'): string {
    return `${userId}:${conversationId}`;
  }

  // Calcular tamaño aproximado en bytes
  private calculateSize(messages: EnhancedMessage[]): number {
    return JSON.stringify(messages).length;
  }

  // Comprimir mensajes (opcional)
  private compressMessages(messages: EnhancedMessage[]): EnhancedMessage[] {
    if (!this.config.enableCompression) return messages;
    
    // Comprimir contenido de mensajes muy largos
    return messages.map(msg => ({
      ...msg,
      content: msg.content.length > 1000 ? 
        msg.content.substring(0, 1000) + '...[comprimido]' : 
        msg.content
    }));
  }

  // Obtener conversación del cache
  get(userId: string, conversationId: string = 'default'): EnhancedMessage[] | null {
    const key = this.generateCacheKey(userId, conversationId);
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      console.log('❌ Cache miss:', key);
      return null;
    }

    const now = Date.now();
    
    // Verificar TTL
    if (now - entry.lastModified > this.config.conversationTTL) {
      console.log('⏰ Entrada expirada, eliminando:', key);
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Actualizar estadísticas de acceso
    entry.lastAccessed = now;
    entry.hitCount++;
    this.hitCount++;

    console.log('✅ Cache hit:', key, `(${entry.messageCount} mensajes, ${entry.hitCount} hits)`);
    return [...entry.messages]; // Retornar copia
  }

  // Almacenar conversación en cache
  set(userId: string, messages: EnhancedMessage[], conversationId: string = 'default'): void {
    const key = this.generateCacheKey(userId, conversationId);
    const now = Date.now();
    
    // Limitar número de mensajes
    const limitedMessages = messages.slice(-this.config.maxMessagesPerConversation);
    const compressedMessages = this.compressMessages(limitedMessages);
    
    const entry: ConversationCacheEntry = {
      messages: compressedMessages,
      lastAccessed: now,
      lastModified: now,
      conversationId,
      userId,
      messageCount: compressedMessages.length,
      sizeBytes: this.calculateSize(compressedMessages),
      hitCount: 0,
    };

    // Verificar límite de conversaciones
    if (this.cache.size >= this.config.maxConversations && !this.cache.has(key)) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, entry);
    console.log('💾 Conversación cacheada:', key, `(${entry.messageCount} mensajes, ${Math.round(entry.sizeBytes/1024)}KB)`);
  }

  // Agregar mensaje a conversación existente
  addMessage(userId: string, message: EnhancedMessage, conversationId: string = 'default'): void {
    const key = this.generateCacheKey(userId, conversationId);
    const entry = this.cache.get(key);

    if (entry) {
      entry.messages.push(message);
      entry.messageCount++;
      entry.lastModified = Date.now();
      entry.sizeBytes = this.calculateSize(entry.messages);
      
      // Limitar número de mensajes
      if (entry.messages.length > this.config.maxMessagesPerConversation) {
        entry.messages = entry.messages.slice(-this.config.maxMessagesPerConversation);
        entry.messageCount = entry.messages.length;
      }
      
      console.log('➕ Mensaje añadido al cache:', key, `(${entry.messageCount} mensajes total)`);
    } else {
      // Si no existe, crear nueva entrada
      this.set(userId, [message], conversationId);
    }
  }

  // Verificar si existe en cache
  has(userId: string, conversationId: string = 'default'): boolean {
    const key = this.generateCacheKey(userId, conversationId);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Verificar TTL
    const now = Date.now();
    if (now - entry.lastModified > this.config.conversationTTL) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Invalidar cache de usuario
  invalidate(userId: string, conversationId?: string): void {
    if (conversationId) {
      const key = this.generateCacheKey(userId, conversationId);
      this.cache.delete(key);
      console.log('🗑️ Cache invalidado:', key);
    } else {
      // Invalidar todas las conversaciones del usuario
      const keysToDelete: string[] = [];
      for (const [key, entry] of this.cache.entries()) {
        if (entry.userId === userId) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log('🗑️ Cache invalidado para usuario:', userId, `(${keysToDelete.length} conversaciones)`);
    }
  }

  // Limpiar cache completo
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
    console.log('🧹 Cache completamente limpiado');
  }

  // Obtener estadísticas del cache
  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.hitCount + this.missCount;
    const now = Date.now();
    
    const totalMessages = entries.reduce((sum, entry) => sum + entry.messageCount, 0);
    const memoryUsage = entries.reduce((sum, entry) => sum + entry.sizeBytes, 0);
    
    const timestamps = entries.map(entry => entry.lastModified);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : now;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : now;

    return {
      totalEntries: this.cache.size,
      totalMessages,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.missCount / totalRequests) * 100 : 0,
      memoryUsage: Math.round(memoryUsage / 1024), // KB
      avgConversationSize: entries.length > 0 ? totalMessages / entries.length : 0,
      oldestEntry,
      newestEntry,
    };
  }

  // Obtener conversaciones más populares
  getPopularConversations(limit: number = 5): Array<{
    key: string;
    userId: string;
    messageCount: number;
    hitCount: number;
    lastAccessed: number;
  }> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        userId: entry.userId,
        messageCount: entry.messageCount,
        hitCount: entry.hitCount,
        lastAccessed: entry.lastAccessed,
      }))
      .sort((a, b) => b.hitCount - a.hitCount)
      .slice(0, limit);
  }

  // Limpiar entradas expiradas
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.lastModified > this.config.conversationTTL) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 ConversationCache: Limpiadas ${keysToDelete.length} conversaciones expiradas`);
    }
  }

  // Remover conversación menos usada (LRU)
  private evictLeastRecentlyUsed(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      console.log('🗑️ ConversationCache: Eliminada conversación LRU:', lruKey);
    }
  }

  // Iniciar timer de limpieza
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  // Destruir cache
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Instancia singleton del cache
export const conversationCache = new ConversationCache({
  maxConversations: 30,
  conversationTTL: 30 * 60 * 1000, // 30 minutos
  globalTTL: 2 * 60 * 60 * 1000, // 2 horas
  maxMessagesPerConversation: 150,
  enableCompression: true,
});

export default ConversationCache;
