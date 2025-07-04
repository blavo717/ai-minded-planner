
import { useState, useCallback } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useConversationState } from './useConversationState';
import { useConnectionManager } from './useConnectionManager';
import { useMessageHandlers } from './useMessageHandlers';
import { useConversationHistory } from './useConversationHistory';
import { EnhancedMessage } from './types/enhancedAITypes';

export const useEnhancedAIAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const { hasActiveConfiguration, activeModel } = useLLMService();
  const { currentContext } = useAIContext();
  const { toast } = useToast();

  // Use the smaller hooks
  const {
    messages,
    conversationId,
    isHistoryLoadedRef,
    isSendingRef,
    updateMessages,
    clearMessages,
  } = useConversationState();

  const {
    connectionStatus,
    setConnecting,
    setConnected,
    setError,
    setDisconnected,
  } = useConnectionManager({ hasActiveConfiguration, isLoading });

  // Create a wrapper function that matches the expected signature
  const handleMessagesUpdate = useCallback((messages: EnhancedMessage[]) => {
    updateMessages(() => messages);
  }, [updateMessages]);

  // Load conversation history
  useConversationHistory({
    isHistoryLoadedRef,
    onMessagesUpdate: handleMessagesUpdate,
  });

  // Message handlers
  const { sendMessage } = useMessageHandlers({
    userId: user?.id,
    hasActiveConfiguration,
    activeModel,
    isLoading,
    isSendingRef,
    onMessagesUpdate: updateMessages,
    onSetLoading: setIsLoading,
    onSetConnecting: setConnecting,
    onSetConnected: setConnected,
    onSetError: setError,
  });

  const clearChat = useCallback(async () => {
    console.log('🧹 Limpiando chat completamente');
    
    try {
      // Limpiar mensajes del estado
      clearMessages();
      
      // Resetear el historial cargado para que pueda volver a cargar
      isHistoryLoadedRef.current = false;
      
      // Resetear estado de envío
      isSendingRef.current = false;
      
      // Resetear estado de carga
      setIsLoading(false);
      
      // Actualizar estado de conexión
      if (hasActiveConfiguration) {
        setConnected();
      } else {
        setDisconnected();
      }
      
      console.log('✅ Chat limpiado correctamente');
      
      toast({
        title: 'Chat limpiado',
        description: 'La conversación se ha limpiado correctamente.',
      });
    } catch (error) {
      console.error('❌ Error al limpiar chat:', error);
      toast({
        title: 'Error',
        description: 'Hubo un problema al limpiar el chat.',
        variant: 'destructive',
      });
    }
  }, [
    clearMessages, 
    isHistoryLoadedRef, 
    isSendingRef, 
    setIsLoading, 
    hasActiveConfiguration, 
    setConnected, 
    setDisconnected, 
    toast
  ]);

  const exportConversation = useCallback(() => {
    const exportData = {
      conversationId,
      timestamp: new Date().toISOString(),
      messages,
      context: currentContext,
      activeModel: activeModel,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversationId, messages, currentContext, activeModel]);

  return {
    messages,
    isLoading,
    connectionStatus,
    sendMessage,
    clearChat,
    exportConversation,
    hasConfiguration: hasActiveConfiguration,
    conversationId,
    contextAvailable: !!currentContext,
    messageCount: messages.length,
    activeModel,
  };
};
