
import { supabase } from '@/integrations/supabase/client';
import { EnhancedMessage } from '../types/enhancedAITypes';

export const messageHistoryService = {
  async loadConversationHistory(userId: string): Promise<EnhancedMessage[]> {
    try {
      console.log('📚 Cargando historial de conversación...');
      
      // Primero limpiar duplicados
      const { error: cleanError } = await supabase.rpc('clean_duplicate_ai_messages');
      if (cleanError) {
        console.warn('Advertencia al limpiar duplicados:', cleanError);
      }

      const { data: chatMessages, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(10); // Limitar a los últimos 10 mensajes

      if (error) {
        console.error('Error loading chat history:', error);
        return [];
      }

      if (chatMessages && chatMessages.length > 0) {
        const loadedMessages: EnhancedMessage[] = chatMessages.map(msg => ({
          id: msg.id,
          type: msg.type as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          metadata: typeof msg.context_data === 'object' ? msg.context_data as any : {}
        }));

        // Filtrar duplicados adicionales por contenido y tipo
        const uniqueMessages = loadedMessages.filter((message, index, array) => {
          return !array.slice(0, index).some(prevMsg => 
            prevMsg.content === message.content && 
            prevMsg.type === message.type &&
            Math.abs(prevMsg.timestamp.getTime() - message.timestamp.getTime()) < 1000 // menos de 1 segundo de diferencia
          );
        });

        console.log(`✅ Historial cargado: ${uniqueMessages.length} mensajes únicos`);
        return uniqueMessages;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  },

  async saveMessageToHistory(message: EnhancedMessage, userId: string): Promise<void> {
    try {
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
        console.error('Error saving message:', error);
      }
    } catch (error) {
      console.error('Error saving message to history:', error);
    }
  }
};
