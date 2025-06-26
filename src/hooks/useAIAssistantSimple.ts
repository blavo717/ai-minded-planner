
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';
import { generateValidUUID } from '@/utils/uuid';

export interface SimpleChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useAIAssistantSimple = () => {
  const { user } = useAuth();
  const { makeLLMRequest, isLoading: isLLMLoading } = useLLMService();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<SimpleChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');

  // Load messages from localStorage on init
  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`ai-chat-${user.id}`);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          const messagesWithDates = parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (error) {
          console.error('Error loading saved messages:', error);
        }
      }
    }
  }, [user]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`ai-chat-${user.id}`, JSON.stringify(messages));
    }
  }, [user, messages]);

  const addMessage = useCallback((message: Omit<SimpleChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: SimpleChatMessage = {
      ...message,
      id: generateValidUUID(),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLLMLoading) return;
    
    // Add user message
    addMessage({
      type: 'user',
      content: content.trim()
    });

    setIsTyping(true);
    setConnectionStatus('connecting');

    try {
      const response = await makeLLMRequest({
        systemPrompt: `Eres un asistente de productividad inteligente. Ayudas al usuario con sus tareas, proyectos y planificación de manera concisa, útil y amigable.`,
        userPrompt: content,
        functionName: 'simple-chat'
      });

      setConnectionStatus('connected');

      // Add AI response
      addMessage({
        type: 'assistant',
        content: response.content
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionStatus('error');
      
      let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = '🔌 No se pudo conectar con el servicio de IA. Verifica tu configuración LLM.';
        } else if (error.message.includes('No hay configuración LLM activa')) {
          errorMessage = '⚙️ No hay configuración LLM activa. Ve a Configuración > LLM para configurar tu API key.';
        } else if (error.message.includes('API key')) {
          errorMessage = '🔑 Problema con la API key. Verifica tu configuración en OpenRouter.';
        }
      }
      
      addMessage({
        type: 'assistant',
        content: errorMessage
      });
    } finally {
      setIsTyping(false);
      setTimeout(() => setConnectionStatus('idle'), 1000);
    }
  }, [addMessage, makeLLMRequest, isLLMLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (user) {
      localStorage.removeItem(`ai-chat-${user.id}`);
    }
  }, [user]);

  return {
    isOpen,
    setIsOpen,
    messages,
    isTyping,
    isLoading: isLLMLoading,
    connectionStatus,
    sendMessage,
    clearChat
  };
};
