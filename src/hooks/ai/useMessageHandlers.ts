
import { useCallback } from 'react';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { messageHistoryService } from '@/hooks/ai/services/messageHistoryService';
import { messageProcessingService } from '@/hooks/ai/services/messageProcessingService';
import { messagePrefetcher } from '@/hooks/ai/services/messagePrefetcher';
import { EnhancedMessage } from '@/hooks/ai/types/enhancedAITypes';
import { useToast } from '@/hooks/use-toast';
import { AIContext } from '@/types/ai-context-advanced';

interface UseMessageHandlersProps {
  userId?: string;
  hasActiveConfiguration: boolean;
  activeModel?: string;
  isLoading: boolean;
  isSendingRef: React.MutableRefObject<boolean>;
  onMessagesUpdate: (updater: (prev: EnhancedMessage[]) => EnhancedMessage[]) => void;
  onSetLoading: (loading: boolean) => void;
  onSetConnecting: () => void;
  onSetConnected: () => void;
  onSetError: (error: string) => void;
}

// Función auxiliar para convertir AIContext a string
function convertContextToPrompt(context: AIContext | string | null): string {
  if (typeof context === 'string') return context;
  if (!context) return 'Eres un asistente de IA útil.';

  // Construir prompt basado en el contexto disponible
  let prompt = 'Eres un asistente de IA inteligente con acceso al contexto del usuario. ';
  
  if (context.userInfo) {
    const { pendingTasks, hasActiveProjects, currentFocusArea } = context.userInfo;
    if (pendingTasks) {
      prompt += `El usuario tiene ${pendingTasks} tareas pendientes. `;
    }
    if (hasActiveProjects) {
      prompt += `El usuario tiene proyectos activos. `;
    }
    if (currentFocusArea) {
      prompt += `Su área de enfoque actual es: ${currentFocusArea}. `;
    }
  }

  if (context.currentSession) {
    const { timeOfDay, workingHours, productivity } = context.currentSession;
    if (timeOfDay) {
      prompt += `Es ${timeOfDay === 'morning' ? 'por la mañana' : timeOfDay === 'afternoon' ? 'por la tarde' : 'por la noche'}. `;
    }
    if (workingHours !== undefined) {
      prompt += workingHours ? 'Es horario laboral. ' : 'Es fuera del horario laboral. ';
    }
    if (productivity !== undefined) {
      prompt += `El nivel de productividad actual es ${productivity * 100}%. `;
    }
  }

  if (context.insights && context.insights.length > 0) {
    prompt += `Insights disponibles: ${context.insights.map(i => i.title).join(', ')}. `;
  }

  if (context.suggestions && context.suggestions.length > 0) {
    prompt += `Tienes ${context.suggestions.length} sugerencias contextuales disponibles. `;
  }

  prompt += 'Usa esta información para proporcionar respuestas más precisas y útiles.';
  
  return prompt;
}

export const useMessageHandlers = ({
  userId,
  hasActiveConfiguration,
  activeModel,
  isLoading,
  isSendingRef,
  onMessagesUpdate,
  onSetLoading,
  onSetConnecting,
  onSetConnected,
  onSetError,
}: UseMessageHandlersProps) => {
  const { makeLLMRequest } = useLLMService();
  const { currentContext } = useAIContext();
  const { toast } = useToast();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!hasActiveConfiguration) {
        toast({
          title: 'Configuración requerida',
          description: 'Por favor, configura un modelo de LLM antes de enviar mensajes.',
          variant: 'destructive',
        });
        return;
      }

      if (!userId) {
        toast({
          title: 'Error de autenticación',
          description: 'Debes estar autenticado para enviar mensajes.',
          variant: 'destructive',
        });
        return;
      }

      if (isLoading || isSendingRef.current) {
        console.log('⏳ Mensaje en proceso, ignorando nuevo envío');
        return;
      }

      if (!content.trim()) {
        toast({
          title: 'Mensaje vacío',
          description: 'Por favor, ingresa un mensaje antes de enviar.',
          variant: 'destructive',
        });
        return;
      }

      // Lock para prevenir envíos simultáneos
      isSendingRef.current = true;
      onSetLoading(true);
      onSetConnecting();

      try {
        console.log('📤 Enviando mensaje:', content.substring(0, 50) + '...');
        
        // Crear mensaje del usuario
        const userMessage: EnhancedMessage = {
          id: messageProcessingService.generateUniqueId(),
          type: 'user',
          content: content.trim(),
          timestamp: new Date(),
          metadata: { 
            model_used: activeModel,
            contextUsed: !!currentContext,
            userId: userId 
          },
        };

        // Agregar mensaje del usuario inmediatamente
        onMessagesUpdate((prev) => {
          const processed = messageProcessingService.processNewMessage(prev, userMessage);
          return processed;
        });

        // Guardar mensaje del usuario
        await messageHistoryService.saveMessageToHistory(userMessage, userId);

        // NUEVO: Procesar mensaje para prefetch
        await messagePrefetcher.processMessageForPrefetch(userId, userMessage);

        // NUEVO: Verificar si hay datos prefetched para esta query
        const queryType = categorizarConsulta(content);
        const prefetchedData = messagePrefetcher.getPrefetchedData(userId, queryType);
        
        const startTime = Date.now();

        // Convertir currentContext usando la función auxiliar
        const systemPrompt = convertContextToPrompt(currentContext);

        // Enviar mensaje al LLM con contexto usando los parámetros correctos
        const llmResponse = await makeLLMRequest({
          systemPrompt,
          userPrompt: content,
          functionName: 'enhanced-ai-assistant',
        });
        
        const responseTime = Date.now() - startTime;

        // NUEVO: Aprender de la interacción para mejorar predicciones
        messagePrefetcher.learnFromInteraction(userId, queryType, responseTime);

        console.log('✅ Respuesta recibida del LLM:', {
          model: llmResponse.model_used,
          tokens: llmResponse.tokens_used,
          responseTime: `${responseTime}ms`,
          prefetchUsed: !!prefetchedData
        });

        if (llmResponse.content) {
          // Crear mensaje del asistente con metadata completa
          const assistantMessage: EnhancedMessage = {
            id: messageProcessingService.generateUniqueId(),
            type: 'assistant',
            content: llmResponse.content,
            timestamp: new Date(),
            metadata: {
              model_used: llmResponse.model_used || activeModel,
              tokens_used: llmResponse.tokens_used,
              response_time: responseTime,
              contextUsed: !!currentContext,
              prefetchUsed: !!prefetchedData,
              userId: userId
            },
          };

          // Agregar mensaje del asistente
          onMessagesUpdate((prev) => {
            const processed = messageProcessingService.processNewMessage(prev, assistantMessage);
            return processed;
          });

          // Guardar mensaje del asistente
          await messageHistoryService.saveMessageToHistory(assistantMessage, userId);

          // NUEVO: Procesar respuesta para análisis de patrones
          await messagePrefetcher.processMessageForPrefetch(userId, assistantMessage);

          onSetConnected();
          
          toast({
            title: 'Mensaje enviado',
            description: prefetchedData 
              ? `Respuesta optimizada con prefetch (${responseTime}ms)`
              : `Respuesta recibida (${responseTime}ms)`,
          });
        } else {
          throw new Error('No se recibió contenido en la respuesta del LLM');
        }
      } catch (error) {
        console.error('❌ Error enviando mensaje:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        onSetError(errorMessage);
        
        toast({
          title: 'Error al enviar mensaje',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        isSendingRef.current = false;
        onSetLoading(false);
      }
    },
    [
      hasActiveConfiguration,
      userId,
      isLoading,
      activeModel,
      currentContext,
      makeLLMRequest,
      toast,
      onMessagesUpdate,
      onSetLoading,
      onSetConnecting,
      onSetConnected,
      onSetError,
    ]
  );

  return { sendMessage };
};

// Función auxiliar para categorizar consultas para prefetch
function categorizarConsulta(content: string): string {
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes('tarea') || contentLower.includes('task')) return 'task_query';
  if (contentLower.includes('proyecto') || contentLower.includes('project')) return 'project_query';
  if (contentLower.includes('tiempo') || contentLower.includes('plazo')) return 'time_query';
  if (contentLower.includes('ayuda') || contentLower.includes('cómo')) return 'help_query';
  if (contentLower.includes('análisis') || contentLower.includes('reporte')) return 'analysis_query';
  if (contentLower.includes('prioridad') || contentLower.includes('urgente')) return 'priority_query';
  
  return 'general_query';
}
