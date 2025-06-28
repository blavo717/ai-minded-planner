
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
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(10); // Limitar a los últimos 10 mensajes

      if (error) {
        console.error('Error loading chat history:', error);
        setIsHistoryLoaded(true);
        return;
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

        setMessages(uniqueMessages);
        console.log(`✅ Historial cargado: ${uniqueMessages.length} mensajes únicos`);
      }
      
      setIsHistoryLoaded(true);
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setIsHistoryLoaded(true);
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
        description: 'Ve a Configuración > IA para configurar tu API key.',
        variant: 'destructive',
      });
      return;
    }

    if (!content.trim() || isLoading) return;

    console.log('🤖 Enviando mensaje:', { 
      content: content.substring(0, 50) + '...',
      contextAvailable: !!currentContext,
    });
    
    setConnectionStatus('connecting');
    setIsLoading(true);

    // Crear mensaje del usuario
    const userMessage: EnhancedMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    // Actualizar estado inmediatamente
    setMessages(prev => [...prev, userMessage]);
    await saveMessageToHistory(userMessage);

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
      const assistantMessage: EnhancedMessage = {
        id: `assistant-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          model_used: response.model_used,
          tokens_used: response.tokens_used,
          response_time: response.response_time,
          context_data: {
            user_tasks: currentContext?.userInfo?.pendingTasks,
            user_projects: currentContext?.userInfo?.hasActiveProjects,
            session_time: currentContext?.currentSession?.timeOfDay,
          }
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      await saveMessageToHistory(assistantMessage);
      
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
      const errorMessage: EnhancedMessage = {
        id: `error-${Date.now()}-${Math.random()}`,
        type: 'assistant',
        content: 'Lo siento, hubo un error procesando tu mensaje. Por favor intenta de nuevo.',
        timestamp: new Date(),
        metadata: {
          context_data: { error_occurred: true, error_message: error.message }
        }
      };

      setMessages(prev => [...prev, errorMessage]);
      await saveMessageToHistory(errorMessage);
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
