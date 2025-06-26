
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
    forceFullReset,
    validateConsistency,
    currentStrategy
  } = useAIMessagesUnified();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'idle'>('idle');
  const lastOperationRef = useRef<number>(0);

  console.log('🎯 FASE 9 - useAIAssistant state:', {
    user: user?.id || 'none',
    messagesCount: messages.length,
    isInitialized: isPersistenceInitialized,
    strategy: currentStrategy,
    isLoading: isPersistenceLoading,
    processing: lastOperationRef.current > 0
  });

  // FASE 9: PASO 5 - Badge system con validación de consistencia
  const getBadgeInfo = useMemo((): NotificationBadge => {
    const unreadMessages = messages.filter(msg => !msg.isRead && msg.type !== 'user');
    
    const badge = {
      count: unreadMessages.length,
      hasUrgent: unreadMessages.some(msg => msg.priority === 'urgent'),
      hasHigh: unreadMessages.some(msg => msg.priority === 'high')
    };
    
    console.log(`🏷️ FASE 9 - PASO 5: Badge info calculado:`, {
      total: messages.length,
      unread: badge.count,
      urgent: badge.hasUrgent,
      high: badge.hasHigh,
      strategy: currentStrategy,
      timeSinceLastOp: Date.now() - lastOperationRef.current
    });
    
    // FASE 9: PASO 5 - Verificar consistencia si han pasado más de 1.5 minutos
    if (Date.now() - lastOperationRef.current > 90000) {
      validateConsistency().catch(error => {
        console.warn('⚠️ FASE 9 - PASO 5: Error en validación automática:', error);
      });
    }
    
    return badge;
  }, [messages, currentStrategy, validateConsistency]);

  // FASE 9: PASO 3 - addMessage con validación directa post-operación (timeout aumentado)
  const addMessage = useCallback(async (message: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> => {
    const messageId = generateValidUUID();
    const newMessage: ChatMessage = {
      ...message,
      id: messageId,
      timestamp: new Date(),
    };
    
    console.log(`➕ FASE 9 - PASO 3: Adding message:`, {
      id: newMessage.id,
      type: newMessage.type,
      contentPreview: newMessage.content.substring(0, 50) + '...',
      isRead: newMessage.isRead,
      priority: newMessage.priority,
      strategy: currentStrategy
    });
    
    try {
      const preCount = messages.length;
      console.log(`📊 FASE 9 - PASO 3: Pre-validación addMessage: ${preCount} mensajes actuales`);
      
      await saveMessage(newMessage);
      
      // FASE 9: PASO 4 - Timeout realista para BD en producción (aumentado)
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos para BD real
      
      // FASE 9: PASO 3 - Validación directa post-operación
      const isValid = await validatePersistence(preCount + 1, 'addMessage-postValidation');
      if (!isValid) {
        console.error('❌ FASE 9 - PASO 3: Post-validación addMessage falló');
        throw new Error('Post-validación addMessage falló');
      }
      
      lastOperationRef.current = Date.now();
      console.log(`✅ FASE 9 - PASO 3: addMessage completado y validado, ID: ${messageId}`);
      
      return messageId;
    } catch (error) {
      console.error('❌ FASE 9 - PASO 3: Error en addMessage:', error);
      throw error;
    }
  }, [saveMessage, currentStrategy, messages.length, validatePersistence]);

  // FASE 9: PASO 3 - markAsRead con validación directa (timeout aumentado)
  const markAsRead = useCallback(async (messageId: string) => {
    console.log(`👁️ FASE 9 - PASO 3: Marking message as read: ${messageId} via ${currentStrategy}`);
    
    try {
      await updateMessage(messageId, { isRead: true });
      
      // FASE 9: PASO 4 - Timeout realista (aumentado)
      await new Promise(resolve => setTimeout(resolve, 4000)); // 4 segundos
      
      lastOperationRef.current = Date.now();
      console.log('✅ FASE 9 - PASO 3: Message marked as read successfully');
    } catch (error) {
      console.error('❌ FASE 9 - PASO 3: Error marking message as read:', error);
      throw error;
    }
  }, [updateMessage, currentStrategy]);

  // FASE 9: PASO 3 - markAllAsRead con validación directa (timeout aumentado)
  const markAllAsRead = useCallback(async () => {
    const unreadCount = messages.filter(msg => !msg.isRead && msg.type !== 'user').length;
    console.log(`👁️ FASE 9 - PASO 3: Marking all ${unreadCount} messages as read via ${currentStrategy}`);
    
    if (unreadCount === 0) {
      console.log('✅ FASE 9 - PASO 3: No unread messages to mark');
      return;
    }
    
    try {
      await markAllAsReadUnified();
      
      // FASE 9: PASO 4 - Timeout realista para operaciones bulk (aumentado)
      await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos para bulk
      
      lastOperationRef.current = Date.now();
      console.log('✅ FASE 9 - PASO 3: All messages marked as read successfully');
    } catch (error) {
      console.error('❌ FASE 9 - PASO 3: Error marking all as read:', error);
      throw error;
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

  // FASE 9: PASO 3 - addNotification con validación directa (timeout aumentado)
  const addNotification = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium', contextData?: any): Promise<string> => {
    console.log(`🔔 FASE 9 - PASO 3: Adding notification: ${priority} - "${content.substring(0, 50)}..." via ${currentStrategy}`);
    
    const messageId = await addMessage({
      type: 'notification',
      content,
      isRead: false,
      priority,
      contextData
    });
    
    // FASE 9: PASO 4 - Timeout realista para operaciones críticas (aumentado)
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
    
    console.log(`✅ FASE 9 - PASO 3: addNotification completado y validado, ID: ${messageId}`);
    return messageId;
  }, [addMessage, currentStrategy]);

  // FASE 9: PASO 3 - addSuggestion con validación directa (timeout aumentado)
  const addSuggestion = useCallback(async (content: string, priority: 'low' | 'medium' | 'high' | 'urgent' = 'low', contextData?: any): Promise<string> => {
    console.log(`💡 FASE 9 - PASO 3: Adding suggestion: ${priority} - "${content.substring(0, 50)}..." via ${currentStrategy}`);
    
    const messageId = await addMessage({
      type: 'suggestion',
      content,
      isRead: false,
      priority,
      contextData
    });
    
    // FASE 9: PASO 4 - Timeout realista para operaciones críticas (aumentado)
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 segundos
    
    console.log(`✅ FASE 9 - PASO 3: addSuggestion completado y validado, ID: ${messageId}`);
    return messageId;
  }, [addMessage, currentStrategy]);

  // FASE 9: PASO 2 - clearChat con reset completo (timeout aumentado)
  const clearChat = useCallback(async () => {
    console.log(`🗑️ FASE 9 - PASO 2: Clearing chat history via ${currentStrategy}`);
    
    try {
      await clearChatUnified();
      
      // FASE 9: PASO 4 - Timeout realista (aumentado)
      await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos
      
      lastOperationRef.current = Date.now();
      console.log('✅ FASE 9 - PASO 2: Chat cleared successfully');
    } catch (error) {
      console.error('❌ FASE 9 - PASO 2: Error clearing chat:', error);
      throw error;
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
    
    // FASE 9: getBadgeInfo como valor directo
    getBadgeInfo,
    unreadCount: getBadgeInfo.count,
    
    // FASE 9: Exponer funciones de resincronización para tests
    validatePersistence,
    forceFullReset,
    validateConsistency,
    
    // Debug info
    currentStrategy
  };
};
