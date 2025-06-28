
import { useState, useCallback, useRef, useEffect } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useSmartPrompts } from '@/hooks/ai/useSmartPrompts';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    model_used?: string;
    tokens_used?: number;
    response_time?: number;
    context_data?: any;
  };
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export const useEnhancedAIAssistant = () => {
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [conversationId] = useState(`conv_${Date.now()}`);
  const conversationHistory = useRef<EnhancedMessage[]>([]);
  
  const { user } = useAuth();
  const { makeLLMRequest, hasActiveConfiguration } = useLLMService();
  const { generateSmartPrompt, getContextualSystemPrompt } = useSmartPrompts();
  const { currentContext, refreshContext } = useAIContext();
  const { toast } = useToast();

  // Cargar historial de conversación al inicializar
  useEffect(() => {
    if (user?.id) {
      loadConversationHistory();
    }
  }, [user?.id]);

  const loadConversationHistory = async () => {
    try {
      const { data: chatMessages, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }

      if (chatMessages && chatMessages.length > 0) {
        const loadedMessages: EnhancedMessage[] = chatMessages.map(msg => ({
          id: msg.id,
          type: msg.type as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          metadata: msg.context_data || {}
        }));

        setMessages(loadedMessages);
        conversationHistory.current = loadedMessages;
        
        console.log(`📚 Cargado historial: ${loadedMessages.length} mensajes`);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const saveMessageToHistory = async (message: EnhancedMessage) => {
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: user?.id,
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
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!hasActiveConfiguration) {
      toast({
        title: 'Configuración requerida',
        description: 'Ve a Configuración > LLM para configurar tu API key.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim()) return;

    console.log('🤖 Enviando mensaje enriquecido:', { 
      content: content.substring(0, 50) + '...',
      contextAvailable: !!currentContext,
      historyLength: conversationHistory.current.length
    });
    
    setConnectionStatus('connecting');
    setIsLoading(true);

    // Agregar mensaje del usuario
    const userMessage: EnhancedMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    conversationHistory.current.push(userMessage);
    await saveMessageToHistory(userMessage);

    try {
      // Refrescar contexto antes de generar respuesta
      refreshContext();

      // Generar prompt contextual inteligente
      const contextualSystemPrompt = getContextualSystemPrompt();
      
      // Crear contexto de conversación reciente
      const recentMessages = conversationHistory.current.slice(-6);
      const conversationContext = recentMessages.length > 1 
        ? `\n\nContexto de conversación reciente:\n${recentMessages.map(msg => 
            `${msg.type === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content.substring(0, 200)}`
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

      // Agregar respuesta del asistente
      const assistantMessage: EnhancedMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          model_used: response.model_used,
          tokens_used: response.tokens_used,
          response_time: response.response_time,
          context_data: {
            user_tasks: currentContext.userInfo.pendingTasks,
            user_projects: currentContext.userInfo.hasActiveProjects,
            session_time: currentContext.currentSession.timeOfDay,
          }
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      conversationHistory.current.push(assistantMessage);
      await saveMessageToHistory(assistantMessage);
      
      setConnectionStatus('connected');

      console.log('✅ Respuesta enriquecida recibida:', { 
        responseLength: response.content.length,
        model: response.model_used,
        tokensUsed: response.tokens_used,
        contextUsed: true,
      });

    } catch (error: any) {
      console.error('❌ Error en asistente enriquecido:', error);
      
      setConnectionStatus('error');
      
      toast({
        title: 'Error en el asistente',
        description: error.message || 'No se pudo procesar tu mensaje. Intenta de nuevo.',
        variant: 'destructive',
      });

      // Agregar mensaje de error
      const errorMessage: EnhancedMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. He registrado el problema y mi memoria sigue intacta. Por favor intenta de nuevo.',
        timestamp: new Date(),
        metadata: { error: error.message }
      };

      setMessages(prev => [...prev, errorMessage]);
      conversationHistory.current.push(errorMessage);
      await saveMessageToHistory(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [makeLLMRequest, hasActiveConfiguration, toast, currentContext, getContextualSystemPrompt, refreshContext, user?.id]);

  const clearChat = useCallback(async () => {
    console.log('🧹 Limpiando chat enriquecido (manteniendo historial en BD)');
    setMessages([]);
    conversationHistory.current = [];
    setConnectionStatus('disconnected');
    
    // El historial permanece en la base de datos para futuras sesiones
    toast({
      title: 'Chat limpiado',
      description: 'La conversación se ha limpiado pero el historial se mantiene.',
    });
  }, [toast]);

  const exportConversation = useCallback(() => {
    const exportData = {
      conversationId,
      timestamp: new Date().toISOString(),
      messages: conversationHistory.current,
      context: currentContext,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversationId, currentContext]);

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
