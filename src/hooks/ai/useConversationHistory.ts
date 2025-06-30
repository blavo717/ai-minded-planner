
import { useEffect } from 'react';
import { messageHistoryService } from './services/messageHistoryService';
import { EnhancedMessage } from './types/enhancedAITypes';
import { useAuth } from '@/hooks/useAuth';

interface UseConversationHistoryProps {
  isHistoryLoadedRef: React.MutableRefObject<boolean>;
  onMessagesUpdate: (messages: EnhancedMessage[]) => void;
}

export const useConversationHistory = ({
  isHistoryLoadedRef,
  onMessagesUpdate,
}: UseConversationHistoryProps) => {
  const { user } = useAuth();

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.id || isHistoryLoadedRef.current) return;
      
      console.log('🔄 Cargando historial de conversación...');
      
      try {
        const history = await messageHistoryService.loadConversationHistory(user.id);
        
        if (history.length > 0) {
          console.log(`📚 Historial cargado: ${history.length} mensajes`);
          onMessagesUpdate(history);
        } else {
          console.log('📭 No hay historial previo');
        }
        
        isHistoryLoadedRef.current = true;
      } catch (error) {
        console.error('❌ Error cargando historial:', error);
        isHistoryLoadedRef.current = true;
      }
    };

    loadHistory();
  }, [user?.id, isHistoryLoadedRef, onMessagesUpdate]);
};
