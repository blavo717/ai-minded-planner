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
    validatePersistence, // FASE 6: Recibir validación
    currentStrategy
  } = useAIMessagesUnified();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');

  // FASE 6: Badge system con logging detallado
  const getBadgeInfo = useMemo((): NotificationBadge => {
    const unreadMessages = messages.filter(msg => !msg.isRead && msg.type !== 'user');
    
    const badge = {
      count: unreadMessages.length,
      hasUrgent: unreadMessages.some(msg => msg.priority === 'urgent'),
      hasHigh: unreadMessages.some(msg => msg.priority === 'high')
    };
    
    console.log(`🏷️ FASE 6 - Badge info COMPUTED:`, {
      total: messages.length,
      unread: badge.count,
      urgent: badge.hasUrgent,
      high: badge.hasHigh,
      strategy: currentStrategy,
      messagesHash: messages.length + '-' + unreadMessages.length
    });
    
    return badge;
  }, [messages, currentStrategy]);

  // FASE 6: addMessage con validación realista (750ms timeout)
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> => {
    const messageId = generateValidUUID();
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };
    
    console.log(`➕ FASE 6 - Adding message:`, {
      id: newMessage.id,
      type: newMessage.type,
      contentPreview: newMessage.content.substring(0, 50) + '...',
      isRead: newMessage.isRead,
      priority: newMessage.priority,
      strategy: currentStrategy
    });
    
    try {
      await saveMessage(newMessage);
      console.log('✅ FASE 6 - Message successfully persisted and validated');
      
      // FASE 6: Timeout realista para BD real
      await new Promise(resolve => setTimeout(resolve, 750));
      
      console.log(`✅ FASE 6 - addMessage returning ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error('❌ FASE 6 - Failed to save message:', error);
      throw error;
    }
  }, [saveMessage, currentStrategy]);

  const markAsRead = useCallback(async (messageId: string) => {
    console.log(`👁️ FASE 6 - Marking message as read: ${messageId} via ${currentStrategy}`);
    
    try {
      await updateMessage(messageId, { isRead: true });
      // FASE 6: Timeout realista
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('✅ FASE 6 - Message marked as read successfully');
    } catch (error) {
      console.error('❌ FASE 6 - Failed to mark message as read:', error);
    }
  }, [updateMessage, currentStrategy]);

  const markAllAsRead = useCallback(async () => {
    const unreadCount = messages.filter(msg => !msg.isRead && msg.type !== 'user').length;
    console.log(`👁️ FASE 6 - Marking all ${unreadCount} messages as read via ${currentStrategy}`);
    
    if (unreadCount === 0) {
      console.log('✅ FASE 6 - No unread messages to mark');
      return;
    }
    
    try {
      await markAllAsReadUnified();
      // FASE 6: Timeout realista para operaciones bulk
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ FASE 6 - All messages marked as read successfully');
    } catch (error) {
      console.error('❌ FASE 6 - Failed to mark all as read:', error);
    }
  }, [messages, markAllAsReadUnified, currentStrategy]);

  const sendMessage = useCallback(async (content: string, contextData?: any) => {
    console.log(`🚀 Sending message: "${content.substring(0, 100)}..." via ${currentStrategy}`);
    
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
  }, [addMessage, makeLLMRequest, messages, currentStrategy]);

  // FASE 6: addNotification y addSuggestion con timeouts realistas
  const addNotification = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', contextData?: any): Promise<string> => {
    console.log(`🔔 FASE 6 - Adding notification: ${priority} - "${content.substring(0, 50)}..." via ${currentStrategy}`);
    const messageId = await addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
    
    // FASE 6: Timeout realista para operaciones críticas
    await new Promise(resolve => setTimeout(resolve, 750));
    
    console.log(`✅ FASE 6 - addNotification returning ID: ${messageId}`);
    return messageId;
  }, [addMessage, currentStrategy]);

  const addSuggestion = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any): Promise<string> => {
    console.log(`💡 FASE 6 - Adding suggestion: ${priority} - "${content.substring(0, 50)}..." via ${currentStrategy}`);
    const messageId = await addMessage({
      type: 'suggestion',
      content,
      isRead: false,
      priority,
      contextData
    });
    
    // FASE 6: Timeout realista para operaciones críticas
    await new Promise(resolve => setTimeout(resolve, 750));
    
    console.log(`✅ FASE 6 - addSuggestion returning ID: ${messageId}`);
    return messageId;
  }, [addMessage, currentStrategy]);

  const clearChat = useCallback(async () => {
    console.log(`🗑️ FASE 6 - Clearing chat history via ${currentStrategy}`);
    
    try {
      await clearChatUnified();
      // FASE 6: Timeout realista
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ FASE 6 - Chat cleared successfully');
    } catch (error) {
      console.error('❌ FASE 6 - Failed to clear chat:', error);
    }
  }, [clearChatUnified, currentStrategy]);

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
    
    // FASE 6: getBadgeInfo como valor directo
    getBadgeInfo,
    unreadCount: getBadgeInfo.count,
    
    // FASE 6: Exponer validación para tests
    validatePersistence,
    
    // Debug info
    currentStrategy
  };
};
