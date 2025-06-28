
import { useState, useCallback, useEffect, useRef } from 'react';
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
  
  // CORREGIDO: useRef para evitar cargas múltiples
  const isHistoryLoadedRef = useRef(false);
  const isSendingRef = useRef(false);
  
  const { user } = useAuth();
  const { makeLLMRequest, hasActiveConfiguration, activeModel } = useLLMService();
  const { getContextualSystemPrompt } = useSmartPrompts();
  const { currentContext, refreshContext } = useAIContext();
  const { toast } = useToast();

  // CORREGIDO: Cargar historial solo una vez al inicializar
  useEffect(() => {
    if (user?.id && !isHistoryLoadedRef.current) {
      console.log('📚 Cargando historial de conversación...');
      loadConversationHistory();
    }
  }, [user?.id]); // Solo depende de user?.id

  // CORREGIDO: Establecer conexión inicial si hay configuración
  useEffect(() => {
    if (hasActiveConfiguration) {
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('disconnected');
    }
  }, [hasActiveConfiguration]);

  const loadConversationHistory = async () => {
    if (!user?.id || isHistoryLoadedRef.current) return;
    
    try {
      const loadedMessages = await messageHistoryService.loadConversationHistory(user.id);
      const uniqueMessages = messageProcessingService.removeDuplicateMessages(loadedMessages);
      setMessages(uniqueMessages);
      isHistoryLoadedRef.current = true;
      console.log('✅ Historial cargado:', uniqueMessages.length, 'mensajes únicos');
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
      isHistoryLoadedRef.current = true;
    }
  };

  // CORREGIDO: sendMessage con useCallback y dependencias optimizadas
  const sendMessage = useCallback(async (content: string) => {
    // Prevenir envíos múltiples simultáneos
    if (!hasActiveConfiguration || !content.trim() || isLoading || !user?.id || isSendingRef.current) {
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
    
    // Marcar que estamos enviando
    isSendingRef.current = true;
    setConnectionStatus('connecting');
    setIsLoading(true);

    // Crear mensaje del usuario con ID único
    const userMessage = messageProcessingService.createUserMessage(content);

    try {
      // Actualizar estado inmediatamente
      setMessages(prev => {
        const newMessages = [...prev, userMessage];
        return messageProcessingService.removeDuplicateMessages(newMessages);
      });

      // Guardar mensaje del usuario
      await messageHistoryService.saveMessageToHistory(userMessage, user.id);

      // Refrescar contexto antes de generar respuesta
      refreshContext();

      // Generar prompt contextual inteligente
      const contextualSystemPrompt = getContextualSystemPrompt();
      
      // CORREGIDO: Usar mensajes actuales en lugar de state desactualizado
      const currentMessages = await messageHistoryService.loadConversationHistory(user.id);
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

      // Actualizar mensajes
      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        return messageProcessingService.removeDuplicateMessages(newMessages);
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
        const newMessages = [...prev, errorMessage];
        return messageProcessingService.removeDuplicateMessages(newMessages);
      });
      await messageHistoryService.saveMessageToHistory(errorMessage, user.id);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false; // Liberar el lock
    }
  }, [makeLLMRequest, hasActiveConfiguration, toast, currentContext, getContextualSystemPrompt, refreshContext, user?.id, isLoading, activeModel]); // CORREGIDO: Dependencias optimizadas

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
