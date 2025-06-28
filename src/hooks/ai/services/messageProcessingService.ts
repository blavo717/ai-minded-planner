
import { EnhancedMessage } from '../types/enhancedAITypes';

export const messageProcessingService = {
  createUserMessage(content: string): EnhancedMessage {
    return {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
  },

  createAssistantMessage(content: string, metadata?: any): EnhancedMessage {
    return {
      id: `assistant-${Date.now()}-${Math.random()}`,
      type: 'assistant',
      content,
      timestamp: new Date(),
      metadata
    };
  },

  createErrorMessage(error: any): EnhancedMessage {
    return {
      id: `error-${Date.now()}-${Math.random()}`,
      type: 'assistant',
      content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
      timestamp: new Date(),
      metadata: {
        context_data: { error_occurred: true, error_message: error.message }
      }
    };
  },

  removeDuplicateMessages(messages: EnhancedMessage[]): EnhancedMessage[] {
    const seen = new Set<string>();
    return messages.filter(message => {
      const key = `${message.type}-${message.content}-${Math.floor(message.timestamp.getTime() / 1000)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
};
