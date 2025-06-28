
import { useState, useCallback, useEffect } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useSmartPrompts } from '@/hooks/ai/useSmartPrompts';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { EnhancedMessage, ConnectionStatus } from './types/enhancedAITypes';
import { messageHistoryService } from './services/messageHistoryService';
import { messageProcessingService } from './services/messageProcessingService';

export const useEnhancedAIAssistant = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [conversationId] = useState(`conv_${Date.now()}`);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  
  const { user } = useAuth();
  const { makeLLMRequest, hasActiveConfiguration } = useLLMService();
  const { generateSmartPrompt, getContextualSystemPrompt } = useSmartPrompts();
  const { currentContext, refreshContext } = useAIContext();
  const { toast } = useToast();

  // Cargar historial solo una vez al inicializar
  useEffect(() => {
    if (user?.id && !isHistoryLoaded) {
      loadConversationHistory();
    }
  }, [user?.id, isHistoryLoaded]);

  const loadConversationHistory = async () => {
    if (!user?.id) return;
    
    const loadedMessages = await messageHistoryService.loadConversationHistory(user.id);
    setMessages(loadedMessages);
    setIsHistoryLoaded(true);
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!hasActiveConfiguration) {
      toast({
        title: 'Configuración requerida',
        description: 'Ve a Configuración > IA para configurar tu API key.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim() || isLoading || !user?.id) return;

    console.log('🤖 Enviando mensaje:', { 
      content: content.substring(0, 50) + '...',
      contextAvailable: !!currentContext,
    });
    
    setConnectionStatus('connecting');
    setIsLoading(true);

    // Crear mensaje del usuario
    const userMessage = messageProcessingService.createUserMessage(content);

    // Actualizar estado inmediatamente
    setMessages(prev => messageProcessingService.removeDuplicateMessages([...prev, userMessage]));
    await messageHistoryService.saveMessageToHistory(userMessage, user.id);

    try {
      // Refrescar contexto antes de generar respuesta
      refreshContext();

      // Generar prompt contextual inteligente
      const contextualSystemPrompt = getContextualSystemPrompt();
      
      // Crear contexto de conversación reciente (últimos 4 mensajes)
      const recentMessages = messages.slice(-4);
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

      // Crear mensaje del asistente
      const assistantMessage = messageProcessingService.createAssistantMessage(
        response.content,
        {
          model_used: response.model_used,
          tokens_used: response.tokens_used,
          response_time: response.response_time,
          context_data: {
            user_tasks: currentContext?.userInfo?.pendingTasks,
            user_projects: currentContext?.userInfo?.hasActiveProjects,
            session_time: currentContext?.currentSession?.timeOfDay,
          }
        }
      );

      setMessages(prev => messageProcessingService.removeDuplicateMessages([...prev, assistantMessage]));
      await messageHistoryService.saveMessageToHistory(assistantMessage, user.id);
      
      setConnectionStatus('connected');

      console.log('✅ Respuesta recibida:', { 
        responseLength: response.content.length,
        model: response.model_used,
        tokensUsed: response.tokens_used,
      });

    } catch (error: any) {
      console.error('❌ Error en asistente:', error);
      
      setConnectionStatus('error');
      
      toast({
        title: 'Error en el asistente',
        description: error.message || 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      // Mensaje de error
      const errorMessage = messageProcessingService.createErrorMessage(error);
      setMessages(prev => messageProcessingService.removeDuplicateMessages([...prev, errorMessage]));
      await messageHistoryService.saveMessageToHistory(errorMessage, user.id);
    } finally {
      setIsLoading(false);
    }
  }, [makeLLMRequest, hasActiveConfiguration, toast, currentContext, getContextualSystemPrompt, refreshContext, user?.id, messages, isLoading]);

  const clearChat = useCallback(async () => {
    console.log('🧹 Limpiando chat (manteniendo historial en BD)');
    setMessages([]);
    setConnectionStatus('disconnected');
    
    toast({
      title: 'Chat limpiado',
      description: 'La conversación se ha limpiado pero el historial se mantiene.',
    });
  }, [toast]);

  const exportConversation = useCallback(() => {
    const exportData = {
      conversationId,
      timestamp: new Date().toISOString(),
      messages,
      context: currentContext,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversationId, messages, currentContext]);

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
  };
};
