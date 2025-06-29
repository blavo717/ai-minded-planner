
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLLMService } from '@/hooks/useLLMService';
import { useSmartPrompts } from '@/hooks/ai/useSmartPrompts';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { EnhancedMessage } from './types/enhancedAITypes';
import { messageHistoryService } from './services/messageHistoryService';
import { messageProcessingService } from './services/messageProcessingService';

interface UseMessageHandlersProps {
  userId?: string;
  hasActiveConfiguration: boolean;
  activeModel?: string;
  isLoading: boolean;
  isSendingRef: React.MutableRefObject<boolean>;
  onMessagesUpdate: (messages: EnhancedMessage[]) => void;
  onSetLoading: (loading: boolean) => void;
  onSetConnecting: () => void;
  onSetConnected: () => void;
  onSetError: () => void;
}

export const useMessageHandlers = ({
  userId,
  hasActiveConfiguration,
  activeModel,
  isLoading,
  isSendingRef,
  onMessagesUpdate,
  onSetLoading,
  onSetConnecting,
  onSetConnected,
  onSetError,
}: UseMessageHandlersProps) => {
  const { makeLLMRequest } = useLLMService();
  const { getContextualSystemPrompt } = useSmartPrompts();
  const { currentContext, refreshContext } = useAIContext();
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    // Prevent multiple simultaneous sends
    if (!hasActiveConfiguration || !content.trim() || isLoading || !userId || isSendingRef.current) {
      if (!hasActiveConfiguration) {
        toast({
          title: 'Configuración requerida',
          description: 'Ve a Configuración > IA para configurar tu API key.',
          variant: 'destructive',
        });
      }
      return;
    }

    console.log('🤖 Enviando mensaje:', { 
      content: content.substring(0, 50) + '...',
      contextAvailable: !!currentContext,
      activeModel: activeModel,
    });
    
    // Mark that we're sending
    isSendingRef.current = true;
    onSetConnecting();
    onSetLoading(true);

    // Create user message with unique ID
    const userMessage = messageProcessingService.createUserMessage(content);

    try {
      // Update state immediately
      const currentMessages = await messageHistoryService.loadConversationHistory(userId);
      const newMessages = [...currentMessages, userMessage];
      const uniqueMessages = messageProcessingService.removeDuplicateMessages(newMessages);
      onMessagesUpdate(uniqueMessages);

      // Save user message
      await messageHistoryService.saveMessageToHistory(userMessage, userId);

      // Refresh context before generating response
      refreshContext();

      // Generate contextual system prompt
      const contextualSystemPrompt = getContextualSystemPrompt();
      
      // Load recent messages for context
      const recentMessages = currentMessages.slice(-4);
      const conversationContext = recentMessages.length > 0 
        ? `\n\nContexto de conversación reciente:\n${recentMessages.map(msg => 
            `${msg.type === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content.substring(0, 150)}`
          ).join('\n')}`
        : '';

      const fullSystemPrompt = contextualSystemPrompt + conversationContext;

      const response = await makeLLMRequest({
        systemPrompt: fullSystemPrompt,
        userPrompt: content,
        functionName: 'enhanced_assistant_chat',
        temperature: 0.7,
        maxTokens: 1500,
      });

      // Create assistant message with metadata
      const assistantMessage = messageProcessingService.createAssistantMessage(
        response.content,
        {
          model_used: response.model_used,
          tokens_used: response.tokens_used,
          prompt_tokens: response.prompt_tokens,
          completion_tokens: response.completion_tokens,
          response_time: response.response_time,
          context_data: {
            user_tasks: currentContext?.userInfo?.pendingTasks,
            user_projects: currentContext?.userInfo?.hasActiveProjects,
            session_time: currentContext?.currentSession?.timeOfDay,
            active_model: response.model_used,
          }
        }
      );

      // Update messages
      const finalMessages = [...uniqueMessages, assistantMessage];
      const finalUniqueMessages = messageProcessingService.removeDuplicateMessages(finalMessages);
      onMessagesUpdate(finalUniqueMessages);

      // Save assistant message
      await messageHistoryService.saveMessageToHistory(assistantMessage, userId);
      
      onSetConnected();

      console.log('✅ Respuesta recibida:', { 
        responseLength: response.content.length,
        model: response.model_used,
        tokensUsed: response.tokens_used,
        promptTokens: response.prompt_tokens,
        completionTokens: response.completion_tokens,
        responseTime: response.response_time,
      });

    } catch (error: any) {
      console.error('❌ Error en asistente:', error);
      
      onSetError();
      
      toast({
        title: 'Error en el asistente',
        description: error.message || 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      // Error message
      const errorMessage = messageProcessingService.createErrorMessage(error);
      const currentMessages = await messageHistoryService.loadConversationHistory(userId);
      const messagesWithError = [...currentMessages, errorMessage];
      const uniqueMessagesWithError = messageProcessingService.removeDuplicateMessages(messagesWithError);
      onMessagesUpdate(uniqueMessagesWithError);
      await messageHistoryService.saveMessageToHistory(errorMessage, userId);
    } finally {
      onSetLoading(false);
      isSendingRef.current = false;
    }
  }, [
    makeLLMRequest, 
    hasActiveConfiguration, 
    toast, 
    currentContext, 
    getContextualSystemPrompt, 
    refreshContext, 
    userId, 
    isLoading, 
    activeModel,
    onMessagesUpdate,
    onSetLoading,
    onSetConnecting,
    onSetConnected,
    onSetError,
    isSendingRef
  ]);

  return {
    sendMessage,
  };
};
