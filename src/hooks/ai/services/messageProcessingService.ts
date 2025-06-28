
import { EnhancedMessage } from '../types/enhancedAITypes';

export const messageProcessingService = {
  createUserMessage(content: string): EnhancedMessage {
    return {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
  },

  createAssistantMessage(content: string, metadata?: any): EnhancedMessage {
    return {
      id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    return {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  removeDuplicateMessages(messages: EnhancedMessage[]): EnhancedMessage[] {
    const seen = new Set<string>();
    const uniqueMessages: EnhancedMessage[] = [];
    
    // Procesar en orden inverso para mantener los mensajes más recientes
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      // Crear una clave única basada en contenido, tipo y tiempo aproximado
      const timeWindow = Math.floor(message.timestamp.getTime() / 5000) * 5000; // Ventana de 5 segundos
      const key = `${message.type}-${message.content.substring(0, 100)}-${timeWindow}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.unshift(message); // Agregar al inicio para mantener el orden
      }
    }
    
    return uniqueMessages;
  }
};
