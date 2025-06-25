
import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIMessagesPersistence } from '@/hooks/useAIMessagesPersistence';

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
  const { loadMessages, saveMessage, updateMessage, markAllAsRead: markAllAsReadInDB, clearChat: clearChatInDB } = useAIMessagesPersistence();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const forceUpdateRef = useRef(0);

  // Forzar re-render para badge
  const forceUpdate = useCallback(() => {
    forceUpdateRef.current += 1;
    console.log('🔄 Forcing component re-render:', forceUpdateRef.current);
  }, []);

  // Cargar mensajes al inicio
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('🚀 Initializing AI Assistant for user:', user.id);
      
      loadMessages().then(loadedMessages => {
        console.log(`✅ Loaded ${loadedMessages.length} messages from Supabase`);
        setMessages(loadedMessages);
        setIsInitialized(true);
      }).catch(error => {
        console.error('❌ Failed to load messages:', error);
        setIsInitialized(true); // Inicializar de todos modos
      });
    }
  }, [user, loadMessages, isInitialized]);

  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    console.log(`➕ Adding message: ${newMessage.type} - ${newMessage.content.substring(0, 50)}...`);
    
    // Actualizar estado local inmediatamente
    setMessages(prev => {
      const updated = [...prev, newMessage];
      forceUpdate(); // Forzar re-render para badge
      return updated;
    });

    // Guardar en Supabase en background
    try {
      await saveMessage(newMessage);
    } catch (error) {
      console.error('❌ Failed to save message to Supabase:', error);
    }

    return newMessage.id;
  }, [saveMessage, forceUpdate]);

  const markAsRead = useCallback(async (messageId: string) => {
    console.log(`👁️ Marking message as read: ${messageId}`);
    
    // Actualizar estado local inmediatamente
    setMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      );
      forceUpdate(); // Forzar re-render para badge
      return updated;
    });

    // Actualizar en Supabase en background
    try {
      await updateMessage(messageId, { isRead: true });
    } catch (error) {
      console.error('❌ Failed to mark message as read in Supabase:', error);
    }
  }, [updateMessage, forceUpdate]);

  const markAllAsRead = useCallback(async () => {
    const unreadCount = messages.filter(msg => !msg.isRead && msg.type !== 'user').length;
    console.log(`👁️ Marking all ${unreadCount} messages as read`);
    
    // Actualizar estado local inmediatamente
    setMessages(prev => {
      const updated = prev.map(msg => ({ ...msg, isRead: true }));
      forceUpdate(); // Forzar re-render para badge
      return updated;
    });

    // Actualizar en Supabase en background
    try {
      await markAllAsReadInDB();
    } catch (error) {
      console.error('❌ Failed to mark all as read in Supabase:', error);
    }
  }, [messages, markAllAsReadInDB, forceUpdate]);

  const sendMessage = useCallback(async (content: string, contextData?: any) => {
    console.log(`🚀 Sending message: ${content.substring(0, 100)}...`);
    
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

      console.log('🔄 Making LLM request...');
      
      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt: content,
        functionName: 'ai-assistant-chat'
      });

      console.log('✅ LLM response received:', response.content.substring(0, 100) + '...');
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
    console.log(`🔔 Adding notification: ${priority} - ${content.substring(0, 50)}...`);
    return await addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
  }, [addMessage]);

  const addSuggestion = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any) => {
    console.log(`💡 Adding suggestion: ${priority} - ${content.substring(0, 50)}...`);
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
    
    console.log(`🏷️ Badge info: ${badge.count} unread, urgent: ${badge.hasUrgent}, high: ${badge.hasHigh}`);
    return badge;
  }, [messages, forceUpdateRef.current]); // Incluir forceUpdateRef para triggear recalculos

  const clearChat = useCallback(async () => {
    console.log('🗑️ Clearing chat history');
    
    // Limpiar estado local
    setMessages([]);
    forceUpdate();

    // Limpiar en Supabase
    try {
      await clearChatInDB();
    } catch (error) {
      console.error('❌ Failed to clear chat in Supabase:', error);
    }
  }, [clearChatInDB, forceUpdate]);

  return {
    // Estado
    isOpen,
    messages,
    isTyping,
    isLoading: isLLMLoading,
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
