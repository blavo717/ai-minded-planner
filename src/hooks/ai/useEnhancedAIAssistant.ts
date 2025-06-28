
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
  const { makeLLMRequest, hasActiveConfiguration, activeModel } = useLLMService();
  const { generateSmartPrompt, getContextualSystemPrompt } = useSmartPrompts();
  const { currentContext, refreshContext } = useAIContext();
  const { toast } = useToast();

  // Cargar historial solo una vez al inicializar
  useEffect(() => {
    if (user?.id && !isHistoryLoaded) {
      loadConversationHistory();
    }
  }, [user?.id, isHistoryLoaded]);

  // Establecer conexión inicial si hay configuración
  useEffect(() => {
    if (hasActiveConfiguration) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [hasActiveConfiguration]);

  const loadConversationHistory = async () => {
    if (!user?.id) return;
    
    try {
      const loadedMessages = await messageHistoryService.loadConversationHistory(user.id);
      setMessages(loadedMessages);
      setIsHistoryLoaded(true);
      console.log('📚 Historial cargado:', loadedMessages.length, 'mensajes');
    } catch (error) {
      console.error('Error cargando historial:', error);
      setIsHistoryLoaded(true);
    }
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
      activeModel: activeModel,
    });
    
    setConnectionStatus('connecting');
    setIsLoading(true);

    // Crear mensaje del usuario
    const userMessage = messageProcessingService.createUserMessage(content);

    // Actualizar estado inmediatamente sin duplicados
    setMessages(prev => {
      const filtered = messageProcessingService.removeDuplicateMessages([...prev, userMessage]);
      return filtered;
    });

    try {
      // Guardar mensaje del usuario
      await messageHistoryService.saveMessageToHistory(userMessage, user.id);

      // Refrescar contexto antes de generar respuesta
      refreshContext();

      // Generar prompt contextual inteligente
      const contextualSystemPrompt = getContextualSystemPrompt();
      
      // Crear contexto de conversación reciente (últimos 4 mensajes únicos)
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

      // Crear mensaje del asistente con metadata completa
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

      // Actualizar mensajes sin duplicados
      setMessages(prev => {
        const filtered = messageProcessingService.removeDuplicateMessages([...prev, assistantMessage]);
        return filtered;
      });

      // Guardar mensaje del asistente
      await messageHistoryService.saveMessageToHistory(assistantMessage, user.id);
      
      setConnectionStatus('connected');

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
      
      setConnectionStatus('error');
      
      toast({
        title: 'Error en el asistente',
        description: error.message || 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      // Mensaje de error
      const errorMessage = messageProcessingService.createErrorMessage(error);
      setMessages(prev => {
        const filtered = messageProcessingService.removeDuplicateMessages([...prev, errorMessage]);
        return filtered;
      });
      await messageHistoryService.saveMessageToHistory(errorMessage, user.id);
    } finally {
      setIsLoading(false);
    }
  }, [makeLLMRequest, hasActiveConfiguration, toast, currentContext, getContextualSystemPrompt, refreshContext, user?.id, messages, isLoading, activeModel]);

  const clearChat = useCallback(async () => {
    console.log('🧹 Limpiando chat (manteniendo historial en BD)');
    setMessages([]);
    setConnectionStatus(hasActiveConfiguration ? 'connected' : 'disconnected');
    
    toast({
      title: 'Chat limpiado',
      description: 'La conversación se ha limpiado pero el historial se mantiene.',
    });
  }, [toast, hasActiveConfiguration]);

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
