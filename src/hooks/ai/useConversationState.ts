
import { useState, useRef } from 'react';
import { EnhancedMessage } from './types/enhancedAITypes';

export const useConversationState = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [conversationId] = useState(`conv_${Date.now()}`);
  
  // Refs for preventing multiple operations
  const isHistoryLoadedRef = useRef(false);
  const isSendingRef = useRef(false);

  const addMessage = (message: EnhancedMessage) => {
    setMessages(prev => [...prev, message]);
  };

  const updateMessages = (updater: (prev: EnhancedMessage[]) => EnhancedMessage[]) => {
    setMessages(updater);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    conversationId,
    isHistoryLoadedRef,
    isSendingRef,
    addMessage,
    updateMessages,
    clearMessages,
  };
};
