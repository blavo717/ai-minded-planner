
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIMessagesUnified } from '@/hooks/useAIMessagesUnified';
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
    messages,
    isLoading: isPersistenceLoading,
    isInitialized: isPersistenceInitialized,
    saveMessage,
    updateMessage,
    markAllAsRead: markAllAsReadUnified,
    clearChat: clearChatUnified,
    validatePersistence,
    syncWithDB,
    forceFullReset,
    currentStrategy,
    setForcedMemoryStrategy,
    clearForcedStrategy
  } = useAIMessagesUnified();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');

  console.log('🧪 FASE 14 - useAIAssistant MINIMALIST:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized: isPersistenceInitialized,
    strategy: currentStrategy,
    isLoading: isPersistenceLoading
  });

  // FASE 14: Badge system ULTRA-SIMPLE
  const getBadgeInfo = useMemo((): NotificationBadge => {
    const unreadMessages = messages.filter(msg => !msg.isRead && msg.type !== 'user');
    
    const badge = {
      count: unreadMessages.length,
      hasUrgent: unreadMessages.some(msg => msg.priority === 'urgent'),
      hasHigh: unreadMessages.some(msg => msg.priority === 'high')
    };
    
    console.log(`🧪 FASE 14: Badge ultra-simple:`, {
      total: messages.length,
      unread: badge.count,
      urgent: badge.hasUrgent,
      high: badge.hasHigh
    });
    
    return badge;
  }, [messages]);

  // FASE 14: addMessage ULTRA-SIMPLE - timeouts mínimos
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> => {
    const messageId = generateValidUUID();
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };
    
    console.log(`🧪 FASE 14: Adding message ultra-simple:`, {
      id: newMessage.id,
      type: newMessage.type,
      contentPreview: newMessage.content.substring(0, 30) + '...',
      strategy: currentStrategy
    });
    
    try {
      await saveMessage(newMessage);
      console.log(`✅ FASE 14: Message added, ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('❌ FASE 14: Error adding message:', error);
      throw error;
    }
  }, [saveMessage, currentStrategy]);

  // FASE 14: markAsRead ULTRA-SIMPLE
  const markAsRead = useCallback(async (messageId: string) => {
    console.log(`🧪 FASE 14: Marking as read ultra-simple: ${messageId}`);
    
    try {
      await updateMessage(messageId, { isRead: true });
      console.log('✅ FASE 14: Message marked as read');
    } catch (error) {
      console.error('❌ FASE 14: Error marking as read:', error);
      throw error;
    }
  }, [updateMessage]);

  // FASE 14: markAllAsRead ULTRA-SIMPLE
  const markAllAsRead = useCallback(async () => {
    const unreadCount = messages.filter(msg => !msg.isRead && msg.type !== 'user').length;
    console.log(`🧪 FASE 14: Marking all ${unreadCount} as read ultra-simple`);
    
    if (unreadCount === 0) {
      console.log('✅ FASE 14: No unread messages');
      return;
    }
    
    try {
      await markAllAsReadUnified();
      console.log('✅ FASE 14: All marked as read');
    } catch (error) {
      console.error('❌ FASE 14: Error marking all as read:', error);
      throw error;
    }
  }, [messages, markAllAsReadUnified]);

  // FASE 14: sendMessage ULTRA-SIMPLE
  const sendMessage = useCallback(async (content: string, contextData?: any) => {
    console.log(`🧪 FASE 14: Sending message ultra-simple: "${content.substring(0, 50)}..."`);
    
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
      const systemPrompt = `Eres un asistente de productividad inteligente. Ayudas al usuario con sus tareas, proyectos y planificación.
      
Contexto disponible:
${contextData ? JSON.stringify(contextData, null, 2) : 'Sin contexto específico'}

Historial de conversación reciente:
${messages.slice(-5).map(msg => `${msg.type}: ${msg.content}`).join('\n')}

Responde de manera concisa, útil y amigable. Si el usuario pregunta sobre tareas específicas, usa el contexto proporcionado.`;

      console.log('🧪 FASE 14: Making LLM request...');
      
      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt: content,
        functionName: 'ai-assistant-chat'
      });

      console.log('✅ FASE 14: LLM response received:', {
        contentLength: response.content.length,
        model: response.model_used
      });
      
      setConnectionStatus('connected');

      // Añadir respuesta de la IA
      await addMessage({
        type: 'assistant',
        content: response.content,
        isRead: false
      });

    } catch (error) {
      console.error('❌ FASE 14: Error sending message:', error);
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
      setTimeout(() => setConnectionStatus('idle'), 1000); // Timeout mínimo
    }
  }, [addMessage, makeLLMRequest, messages]);

  // FASE 14: addNotification ULTRA-SIMPLE
  const addNotification = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', contextData?: any): Promise<string> => {
    console.log(`🧪 FASE 14: Adding notification ultra-simple: ${priority} - "${content.substring(0, 30)}..."`);
    
    const messageId = await addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
    
    console.log(`✅ FASE 14: Notification added, ID: ${messageId}`);
    return messageId;
  }, [addMessage]);

  // FASE 14: addSuggestion ULTRA-SIMPLE
  const addSuggestion = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any): Promise<string> => {
    console.log(`🧪 FASE 14: Adding suggestion ultra-simple: ${priority} - "${content.substring(0, 30)}..."`);
    
    const messageId = await addMessage({
      type: 'suggestion',
      content,
      isRead: false,
      priority,
      contextData
    });
    
    console.log(`✅ FASE 14: Suggestion added, ID: ${messageId}`);
    return messageId;
  }, [addMessage]);

  // FASE 14: clearChat ULTRA-SIMPLE
  const clearChat = useCallback(async () => {
    console.log(`🧪 FASE 14: Clearing chat ultra-simple`);
    
    try {
      await clearChatUnified();
      console.log('✅ FASE 14: Chat cleared');
    } catch (error) {
      console.error('❌ FASE 14: Error clearing chat:', error);
      throw error;
    }
  }, [clearChatUnified]);

  return {
    // Estado
    isOpen,
    messages,
    isTyping,
    isLoading: isLLMLoading || isPersistenceLoading,
    connectionStatus,
    isInitialized: isPersistenceInitialized,
    
    // Acciones
    setIsOpen,
    sendMessage,
    addMessage,
    addNotification,
    addSuggestion,
    markAsRead,
    markAllAsRead,
    clearChat,
    
    // FASE 14: getBadgeInfo como valor directo
    getBadgeInfo,
    unreadCount: getBadgeInfo.count,
    
    // FASE 14: Funciones ultra-simples
    validatePersistence,
    syncWithDB,
    forceFullReset,
    
    // FASE 14: Control de estrategia para testing
    setForcedMemoryStrategy,
    clearForcedStrategy,
    
    // Debug info
    currentStrategy
  };
};
