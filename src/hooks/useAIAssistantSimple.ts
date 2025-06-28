
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useSmartPrompts } from '@/hooks/ai/useSmartPrompts';
import { createPromptBuilder } from '@/utils/ai/PromptBuilder';
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
  const { currentContext, getSimpleContext } = useAIContext({
    enableRealtimeUpdates: true,
    includeProductivityMetrics: true,
    includeWorkPatterns: true,
    maxRecentTasks: 5,
    maxRecentProjects: 3,
  });
  const { getContextualSystemPrompt } = useSmartPrompts();
  
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
    if (!content.trim() || isLLMLoading || !user) return;
    
    // Add user message
    addMessage({
      type: 'user',
      content: content.trim()
    });

    setIsTyping(true);
    setConnectionStatus('connecting');

    try {
      // Generar prompt contextual inteligente
      const contextualSystemPrompt = getContextualSystemPrompt();
      
      // Crear prompt builder para enriquecer el contenido
      const promptBuilder = createPromptBuilder(user.id, {
        includeTaskDetails: true,
        includeProjectContext: true,
        includeRecentActivity: true,
        maxTasksToInclude: 3,
        maxProjectsToInclude: 2,
      });

      // Construir prompt enriquecido
      const enrichedPrompt = await promptBuilder.buildEnrichedPrompt(
        content,
        getSimpleContext(),
        {
          type: 'general',
          includeData: true,
          maxDataPoints: 5,
          tone: 'friendly'
        }
      );

      console.log('🧠 Contexto del usuario:', currentContext);
      console.log('📝 Prompt enriquecido:', enrichedPrompt.content);

      const response = await makeLLMRequest({
        systemPrompt: contextualSystemPrompt,
        userPrompt: enrichedPrompt.content,
        functionName: 'smart-chat'
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
  }, [addMessage, makeLLMRequest, isLLMLoading, user, getContextualSystemPrompt, currentContext, getSimpleContext]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (user) {
      localStorage.removeItem(`ai-chat-${user.id}`);
    }
  }, [user]);

  // Función para obtener sugerencias contextualies
  const getContextualSuggestions = useCallback(() => {
    if (!currentContext) return [];

    const suggestions: string[] = [];
    const { userInfo, currentSession, recentActivity } = currentContext;

    // Sugerencias basadas en tareas pendientes
    if (userInfo.hasActiveTasks) {
      suggestions.push('¿Qué tareas debería priorizar hoy?');
      suggestions.push('Ayúdame a organizar mis tareas pendientes');
    }

    // Sugerencias basadas en proyectos activos
    if (userInfo.hasActiveProjects) {
      suggestions.push('¿Cómo va el progreso de mis proyectos?');
      suggestions.push('Dame un resumen de mis proyectos activos');
    }

    // Sugerencias basadas en el momento del día
    switch (currentSession.timeOfDay) {
      case 'morning':
        suggestions.push('Crea un plan para mi día');
        suggestions.push('¿Qué debería hacer primero hoy?');
        break;
      case 'afternoon':
        suggestions.push('¿Cómo va mi productividad hoy?');
        suggestions.push('¿Qué tareas me quedan por hacer?');
        break;
      case 'evening':
        suggestions.push('Resume mi día de trabajo');
        suggestions.push('¿Qué logré hoy?');
        break;
    }

    // Sugerencias basadas en patrones de trabajo
    switch (recentActivity.workPattern) {
      case 'productive':
        suggestions.push('¡Sigue así! ¿Cómo mantienes tu productividad?');
        break;
      case 'low':
      case 'inactive':
        suggestions.push('¿Necesitas motivación para empezar?');
        suggestions.push('¿Qué está bloqueando tu productividad?');
        break;
    }

    return suggestions.slice(0, 4); // Limitar a 4 sugerencias
  }, [currentContext]);

  return {
    isOpen,
    setIsOpen,
    messages,
    isTyping,
    isLoading: isLLMLoading,
    connectionStatus,
    sendMessage,
    clearChat,
    currentContext,
    contextualSuggestions: getContextualSuggestions(),
  };
};
