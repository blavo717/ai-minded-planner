
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';

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
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');

  // Cargar mensajes del localStorage al inicio
  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`ai-chat-${user.id}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
          console.log(`✅ Loaded ${parsed.length} messages from localStorage for user ${user.id}`);
        } catch (error) {
          console.error('❌ Error loading chat messages:', error);
          // Limpiar localStorage corrompido
          localStorage.removeItem(`ai-chat-${user.id}`);
        }
      }
    }
  }, [user]);

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    if (user && messages.length > 0) {
      try {
        localStorage.setItem(`ai-chat-${user.id}`, JSON.stringify(messages));
        console.log(`💾 Saved ${messages.length} messages to localStorage for user ${user.id}`);
      } catch (error) {
        console.error('❌ Error saving messages to localStorage:', error);
      }
    }
  }, [messages, user]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    console.log(`➕ Adding message: ${newMessage.type} - ${newMessage.content.substring(0, 50)}...`);
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    console.log(`👁️ Marking message as read: ${messageId}`);
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const unreadCount = messages.filter(msg => !msg.isRead && msg.type !== 'user').length;
    console.log(`👁️ Marking all ${unreadCount} messages as read`);
    setMessages(prev => 
      prev.map(msg => ({ ...msg, isRead: true }))
    );
  }, [messages]);

  const sendMessage = useCallback(async (content: string, contextData?: any) => {
    console.log(`🚀 Sending message: ${content.substring(0, 100)}...`);
    
    // Añadir mensaje del usuario
    const userMessageId = addMessage({
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
      addMessage({
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
        } else if (error.message.includes('No active LLM configuration')) {
          errorMessage = '⚙️ No hay configuración LLM activa. Ve a Configuración > LLM para configurar tu API key.';
        } else if (error.message.includes('API key')) {
          errorMessage = '🔑 Problema con la API key. Verifica tu configuración en OpenRouter.';
        }
      }
      
      addMessage({
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

  const addNotification = useCallback((content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', contextData?: any) => {
    console.log(`🔔 Adding notification: ${priority} - ${content.substring(0, 50)}...`);
    return addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
  }, [addMessage]);

  const addSuggestion = useCallback((content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any) => {
    console.log(`💡 Adding suggestion: ${priority} - ${content.substring(0, 50)}...`);
    return addMessage({
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
  }, [messages]);

  const clearChat = useCallback(() => {
    console.log('🗑️ Clearing chat history');
    setMessages([]);
    if (user) {
      localStorage.removeItem(`ai-chat-${user.id}`);
    }
  }, [user]);

  return {
    // Estado
    isOpen,
    messages,
    isTyping,
    isLoading: isLLMLoading,
    connectionStatus,
    
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
