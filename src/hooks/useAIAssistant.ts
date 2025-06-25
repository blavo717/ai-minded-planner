
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIMessagesPersistence } from '@/hooks/useAIMessagesPersistence';
import { generateValidUUID } from '@/utils/uuid';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'notification' | 'suggestion';
  content: string;
  timestamp: Date;
  isRead: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  contextData?: any;
  error?: boolean;
}

export interface NotificationBadge {
  count: number;
  hasUrgent: boolean;
  hasHigh: boolean;
}

export const useAIAssistant = () => {
  const { user } = useAuth();
  const { makeLLMRequest, isLoading: isLLMLoading } = useLLMService();
  const { 
    loadMessages, 
    saveMessage, 
    updateMessage, 
    markAllAsRead: markAllAsReadInDB, 
    clearChat: clearChatInDB,
    isLoading: isPersistenceLoading,
    isInitialized: isPersistenceInitialized,
    setIsInitialized: setPersistenceInitialized
  } = useAIMessagesPersistence();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const forceUpdateRef = useRef(0);

  // Debug: logging del estado actual
  console.log('🎯 useAIAssistant state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized,
    isPersistenceInitialized,
    connectionStatus,
    isOpen
  });

  // Forzar re-render para badge
  const forceUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
    console.log('🔄 Forcing component re-render:', forceUpdateRef.current);
  }, []);

  // Cargar mensajes al inicio con debugging robusto
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🚀 Initializing AI Assistant for user:', user.id);
      console.log('📊 Current state:', { 
        messagesCount: messages.length, 
        isPersistenceLoading,
        isPersistenceInitialized 
      });
      
      loadMessages().then(loadedMessages => {
        console.log(`✅ Successfully loaded ${loadedMessages.length} messages from persistence`);
        console.log('📝 Sample messages:', loadedMessages.slice(0, 2).map(m => ({
          id: m.id,
          type: m.type,
          isRead: m.isRead,
          contentPreview: m.content.substring(0, 50)
        })));
        
        setMessages(loadedMessages);
        setIsInitialized(true);
        setPersistenceInitialized(true);
        
        // Forzar actualización del badge
        forceUpdate();
      }).catch(error => {
        console.error('❌ Failed to load messages during initialization:', error);
        setIsInitialized(true); // Inicializar de todos modos
        setPersistenceInitialized(true);
      });
    }
  }, [user, loadMessages, isInitialized, setPersistenceInitialized, forceUpdate]);

  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    // Generar UUID válido usando la nueva utilidad
    const messageId = generateValidUUID();
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };
    
    console.log(`➕ Adding message with valid UUID:`, {
      id: newMessage.id,
      type: newMessage.type,
      contentPreview: newMessage.content.substring(0, 50) + '...',
      isRead: newMessage.isRead,
      priority: newMessage.priority
    });
    
    // Actualizar estado local inmediatamente
    setMessages(prev => {
      const updated = [...prev, newMessage];
      console.log(`📊 Messages updated: ${prev.length} -> ${updated.length}`);
      forceUpdate(); // Forzar re-render para badge
      return updated;
    });

    // Guardar en Supabase en background con manejo de errores robusto
    try {
      await saveMessage(newMessage);
      console.log('✅ Message successfully persisted to Supabase');
    } catch (error) {
      console.error('❌ CRITICAL: Failed to save message to Supabase:', error);
      console.error('❌ Message data:', newMessage);
      
      // Marcar el mensaje con error en el estado local
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, error: true }
          : msg
      ));
    }

    return messageId;
  }, [saveMessage, forceUpdate]);

  const markAsRead = useCallback(async (messageId: string) => {
    console.log(`👁️ Marking message as read: ${messageId}`);
    
    // Actualizar estado local inmediatamente
    setMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      );
      console.log('📊 Message marked as read locally');
      forceUpdate(); // Forzar re-render para badge
      return updated;
    });

    // Actualizar en Supabase en background
    try {
      await updateMessage(messageId, { isRead: true });
      console.log('✅ Message read status updated in Supabase');
    } catch (error) {
      console.error('❌ Failed to mark message as read in Supabase:', error);
      
      // Revertir cambio local si falló la persistencia
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: false } : msg
      ));
    }
  }, [updateMessage, forceUpdate]);

  const markAllAsRead = useCallback(async () => {
    const unreadCount = messages.filter(msg => !msg.isRead && msg.type !== 'user').length;
    console.log(`👁️ Marking all ${unreadCount} messages as read`);
    
    if (unreadCount === 0) {
      console.log('✅ No unread messages to mark');
      return;
    }
    
    // Actualizar estado local inmediatamente
    setMessages(prev => {
      const updated = prev.map(msg => ({ ...msg, isRead: true }));
      forceUpdate(); // Forzar re-render para badge
      return updated;
    });

    // Actualizar en Supabase en background
    try {
      await markAllAsReadInDB();
      console.log('✅ All messages marked as read in Supabase');
    } catch (error) {
      console.error('❌ Failed to mark all as read in Supabase:', error);
    }
  }, [messages, markAllAsReadInDB, forceUpdate]);

  const sendMessage = useCallback(async (content: string, contextData?: any) => {
    console.log(`🚀 Sending message: "${content.substring(0, 100)}..."`);
    console.log('📊 Context data:', contextData);
    
    // Añadir mensaje del usuario
    await addMessage({
      type: 'user',
      content,
      isRead: true,
      contextData
    });

    setIsTyping(true);
    setConnectionStatus('connecting');

    try {
      // Preparar contexto para la IA
      const systemPrompt = `Eres un asistente de productividad inteligente. Ayudas al usuario con sus tareas, proyectos y planificación.
      
Contexto disponible:
${contextData ? JSON.stringify(contextData, null, 2) : 'Sin contexto específico'}

Historial de conversación reciente:
${messages.slice(-5).map(msg => `${msg.type}: ${msg.content}`).join('\n')}

Responde de manera concisa, útil y amigable. Si el usuario pregunta sobre tareas específicas, usa el contexto proporcionado.`;

      console.log('🔄 Making LLM request with context...');
      
      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt: content,
        functionName: 'ai-assistant-chat'
      });

      console.log('✅ LLM response received:', {
        contentLength: response.content.length,
        model: response.model_used,
        usage: response.usage
      });
      
      setConnectionStatus('connected');

      // Añadir respuesta de la IA
      await addMessage({
        type: 'assistant',
        content: response.content,
        isRead: false
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      setConnectionStatus('error');
      
      let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '🔌 No se pudo conectar con el servicio de IA. Verifica tu configuración LLM en Configuración > LLM.';
        } else if (error.message.includes('No hay configuración LLM activa')) {
          errorMessage = '⚙️ No hay configuración LLM activa. Ve a Configuración > LLM para configurar tu API key.';
        } else if (error.message.includes('API key')) {
          errorMessage = '🔑 Problema con la API key. Verifica tu configuración en OpenRouter.';
        }
      }
      
      await addMessage({
        type: 'assistant',
        content: errorMessage,
        isRead: false,
        priority: 'high',
        error: true
      });
    } finally {
      setIsTyping(false);
      setTimeout(() => setConnectionStatus('idle'), 3000);
    }
  }, [addMessage, makeLLMRequest, messages]);

  const addNotification = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', contextData?: any) => {
    console.log(`🔔 Adding notification: ${priority} - "${content.substring(0, 50)}..."`);
    return await addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
  }, [addMessage]);

  const addSuggestion = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any) => {
    console.log(`💡 Adding suggestion: ${priority} - "${content.substring(0, 50)}..."`);
    return await addMessage({
      type: 'suggestion',
      content,
      isRead: false,
      priority,
      contextData
    });
  }, [addMessage]);

  const getBadgeInfo = useCallback((): NotificationBadge => {
    const unreadMessages = messages.filter(msg => !msg.isRead && msg.type !== 'user');
    
    const badge = {
      count: unreadMessages.length,
      hasUrgent: unreadMessages.some(msg => msg.priority === 'urgent'),
      hasHigh: unreadMessages.some(msg => msg.priority === 'high')
    };
    
    console.log(`🏷️ Badge info calculated:`, {
      total: messages.length,
      unread: badge.count,
      urgent: badge.hasUrgent,
      high: badge.hasHigh,
      forceUpdateRef: forceUpdateRef.current
    });
    
    return badge;
  }, [messages, forceUpdateRef.current]); // Incluir forceUpdateRef para triggear recalculos

  const clearChat = useCallback(async () => {
    console.log('🗑️ Clearing chat history - local and remote');
    
    // Limpiar estado local
    setMessages([]);
    forceUpdate();

    // Limpiar en Supabase
    try {
      await clearChatInDB();
      console.log('✅ Chat cleared in Supabase');
    } catch (error) {
      console.error('❌ Failed to clear chat in Supabase:', error);
    }
  }, [clearChatInDB, forceUpdate]);

  return {
    // Estado
    isOpen,
    messages,
    isTyping,
    isLoading: isLLMLoading || isPersistenceLoading,
    connectionStatus,
    isInitialized,
    
    // Acciones
    setIsOpen,
    sendMessage,
    addMessage,
    addNotification,
    addSuggestion,
    markAsRead,
    markAllAsRead,
    clearChat,
    
    // Utilidades
    getBadgeInfo,
    unreadCount: getBadgeInfo().count,
  };
};
