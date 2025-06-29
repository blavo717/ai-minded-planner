
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { messageHistoryService } from './services/messageHistoryService';
import { messageProcessingService } from './services/messageProcessingService';
import { EnhancedMessage } from './types/enhancedAITypes';

interface UseConversationHistoryProps {
  isHistoryLoadedRef: React.MutableRefObject<boolean>;
  onMessagesUpdate: (messages: EnhancedMessage[]) => void;
}

export const useConversationHistory = ({
  isHistoryLoadedRef,
  onMessagesUpdate,
}: UseConversationHistoryProps) => {
  const { user } = useAuth();

  // Load conversation history only once
  useEffect(() => {
    if (user?.id && !isHistoryLoadedRef.current) {
      console.log('📚 Cargando historial de conversación...');
      loadConversationHistory();
    }
  }, [user?.id]);

  const loadConversationHistory = async () => {
    if (!user?.id || isHistoryLoadedRef.current) return;
    
    try {
      const loadedMessages = await messageHistoryService.loadConversationHistory(user.id);
      const uniqueMessages = messageProcessingService.removeDuplicateMessages(loadedMessages);
      onMessagesUpdate(uniqueMessages);
      isHistoryLoadedRef.current = true;
      console.log('✅ Historial cargado:', uniqueMessages.length, 'mensajes únicos');
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
      isHistoryLoadedRef.current = true;
    }
  };

  return {
    loadConversationHistory,
  };
};
