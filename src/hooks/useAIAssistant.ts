
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
        } catch (error) {
          console.error('Error loading chat messages:', error);
        }
      }
    }
  }, [user]);

  // Guardar mensajes en localStorage cuando cambien
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`ai-chat-${user.id}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const markAsRead = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setMessages(prev => 
      prev.map(msg => ({ ...msg, isRead: true }))
    );
  }, []);

  const sendMessage = useCallback(async (content: string, contextData?: any) => {
    // Añadir mensaje del usuario
    addMessage({
      type: 'user',
      content,
      isRead: true,
      contextData
    });

    setIsTyping(true);

    try {
      // Preparar contexto para la IA
      const systemPrompt = `Eres un asistente de productividad inteligente. Ayudas al usuario con sus tareas, proyectos y planificación.
      
Contexto disponible:
${contextData ? JSON.stringify(contextData, null, 2) : 'Sin contexto específico'}

Historial de conversación reciente:
${messages.slice(-5).map(msg => `${msg.type}: ${msg.content}`).join('\n')}

Responde de manera concisa, útil y amigable. Si el usuario pregunta sobre tareas específicas, usa el contexto proporcionado.`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt: content,
        functionName: 'ai-assistant-chat'
      });

      // Añadir respuesta de la IA
      addMessage({
        type: 'assistant',
        content: response.content,
        isRead: false
      });

    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        isRead: false,
        priority: 'medium'
      });
    } finally {
      setIsTyping(false);
    }
  }, [addMessage, makeLLMRequest, messages]);

  const addNotification = useCallback((content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', contextData?: any) => {
    return addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
  }, [addMessage]);

  const addSuggestion = useCallback((content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any) => {
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
    
    return {
      count: unreadMessages.length,
      hasUrgent: unreadMessages.some(msg => msg.priority === 'urgent'),
      hasHigh: unreadMessages.some(msg => msg.priority === 'high')
    };
  }, [messages]);

  const clearChat = useCallback(() => {
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
