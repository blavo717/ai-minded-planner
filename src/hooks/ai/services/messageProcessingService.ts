
import { EnhancedMessage } from '../types/enhancedAITypes';

export const messageProcessingService = {
  generateUniqueId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    return `msg-${timestamp}-${random}`;
  },

  processNewMessage(existingMessages: EnhancedMessage[], newMessage: EnhancedMessage): EnhancedMessage[] {
    const updatedMessages = [...existingMessages, newMessage];
    return this.removeDuplicateMessages(updatedMessages);
  },

  createUserMessage(content: string): EnhancedMessage {
    // Generar ID más robusto con timestamp preciso y mayor aleatoriedad
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    const id = `user-${timestamp}-${random}`;
    
    return {
      id,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
  },

  createAssistantMessage(content: string, metadata?: any): EnhancedMessage {
    // Generar ID más robusto con timestamp preciso y mayor aleatoriedad
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    const id = `assistant-${timestamp}-${random}`;
    
    return {
      id,
      type: 'assistant',
      content,
      timestamp: new Date(),
      metadata: {
        model_used: metadata?.model_used,
        tokens_used: metadata?.tokens_used || 0,
        prompt_tokens: metadata?.prompt_tokens || 0,
        completion_tokens: metadata?.completion_tokens || 0,
        response_time: metadata?.response_time,
        context_data: metadata?.context_data,
        ...metadata
      }
    };
  },

  createErrorMessage(error: any): EnhancedMessage {
    // Generar ID más robusto con timestamp preciso y mayor aleatoriedad
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    const id = `error-${timestamp}-${random}`;
    
    return {
      id,
      type: 'assistant',
      content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
      timestamp: new Date(),
      metadata: {
        context_data: { 
          error_occurred: true, 
          error_message: error.message || 'Error desconocido'
        }
      }
    };
  },

  // CORREGIDO: Algoritmo mejorado de detección de duplicados
  removeDuplicateMessages(messages: EnhancedMessage[]): EnhancedMessage[] {
    const seen = new Map<string, EnhancedMessage>();
    const uniqueMessages: EnhancedMessage[] = [];
    
    console.log(`🔍 Procesando ${messages.length} mensajes para eliminar duplicados...`);
    
    // Procesar mensajes del más reciente al más antiguo
    const sortedMessages = [...messages].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    for (const message of sortedMessages) {
      // Crear clave única más robusta
      const contentHash = this.createContentHash(message.content);
      const timeWindow = Math.floor(message.timestamp.getTime() / 10000) * 10000; // Ventana de 10 segundos
      const key = `${message.type}-${contentHash}-${timeWindow}`;
      
      if (!seen.has(key)) {
        seen.set(key, message);
        uniqueMessages.unshift(message); // Agregar al inicio para mantener orden cronológico
      } else {
        console.log(`🗑️ Duplicado eliminado: ${message.content.substring(0, 50)}...`);
      }
    }
    
    const duplicatesRemoved = messages.length - uniqueMessages.length;
    if (duplicatesRemoved > 0) {
      console.log(`✅ Eliminados ${duplicatesRemoved} duplicados de ${messages.length} mensajes`);
    }
    
    return uniqueMessages;
  },

  // NUEVO: Función para crear hash de contenido
  createContentHash(content: string): string {
    // Normalizar contenido: eliminar espacios extra, convertir a minúsculas
    const normalized = content.trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Crear hash simple pero efectivo
    let hash = 0;
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32bit
    }
    
    return Math.abs(hash).toString(36);
  },

  // NUEVO: Función para filtrar por ventana temporal
  filterByTimeWindow(messages: EnhancedMessage[], windowMs: number = 5000): EnhancedMessage[] {
    const now = Date.now();
    const filtered = messages.filter(msg => 
      (now - msg.timestamp.getTime()) <= windowMs
    );
    
    if (filtered.length !== messages.length) {
      console.log(`⏰ Filtrados ${messages.length - filtered.length} mensajes fuera de ventana temporal`);
    }
    
    return filtered;
  },

  // NUEVO: Validar integridad del mensaje
  validateMessage(message: EnhancedMessage): boolean {
    return !!(
      message.id && 
      message.type && 
      message.content && 
      message.timestamp &&
      ['user', 'assistant', 'system'].includes(message.type)
    );
  },

  // NUEVO: Limpiar mensajes inválidos
  cleanInvalidMessages(messages: EnhancedMessage[]): EnhancedMessage[] {
    const validMessages = messages.filter(msg => this.validateMessage(msg));
    const invalidCount = messages.length - validMessages.length;
    
    if (invalidCount > 0) {
      console.log(`🧹 Eliminados ${invalidCount} mensajes inválidos`);
    }
    
    return validMessages;
  }
};
