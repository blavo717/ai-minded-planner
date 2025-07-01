
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IntelligentAction, IntelligentActionContext } from '@/types/intelligent-actions';
import { useLLMService } from '@/hooks/useLLMService';
import { Task } from '@/hooks/useTasks';
import { generateContextualSystemPrompt, IA_PLANNER_IDENTITY } from '@/config/iaPlanner';
import { getEnhancedTaskContext } from '@/utils/taskContextEnhanced';
import { parseIntelligentActionsJSON } from '@/utils/ai/jsonParser';

export const useIntelligentActionsEnhanced = (
  task: Task | undefined, 
  nextSteps: string, 
  statusSummary: string
) => {
  const [isGeneratingActions, setIsGeneratingActions] = useState(false);
  const { makeLLMRequest, hasActiveConfiguration } = useLLMService();

  // Early return if task is undefined
  if (!task) {
    return {
      intelligentActions: [],
      isGeneratingActions: false,
      hasConfiguration: hasActiveConfiguration,
      isPlannerActive: false,
    };
  }

  // Generate IA Planner intelligent actions
  const generatePlannerActions = useCallback(async (): Promise<IntelligentAction[]> => {
    if (!hasActiveConfiguration || !task) return [];

    setIsGeneratingActions(true);
    
    try {
      console.log('🤖 IA Planner generando acciones específicas para:', task.title);
      
      // Get enhanced context
      const enhancedContext = await getEnhancedTaskContext(task.id);
      
      // Generate IA Planner system prompt
      const systemPrompt = generateContextualSystemPrompt(enhancedContext, 'action_generation');
      
      // Create SIMPLIFIED prompt focused on specific actions only
      const userPrompt = `Genera EXACTAMENTE 2 acciones específicas para "${task.title}".

CONTEXTO ACTUAL:
- Estado: ${task.status} | Progreso: ${enhancedContext.completionStatus.overallProgress}%
- Días sin actividad: ${enhancedContext.daysSinceLastActivity}
- Subtareas: ${enhancedContext.subtasks.length} total, ${enhancedContext.completionStatus.completedSubtasks} completadas

PRÓXIMOS PASOS:
${nextSteps}

Responde SOLO este JSON (sin markdown):
[
  {
    "type": "create_subtask",
    "label": "Acción específica 1",
    "priority": "high",
    "confidence": 0.8,
    "suggestedData": {
      "title": "Título específico",
      "content": "Qué hacer exactamente"
    },
    "reasoning": "Por qué es importante"
  },
  {
    "type": "create_subtask", 
    "label": "Acción específica 2",
    "priority": "medium",
    "confidence": 0.7,
    "suggestedData": {
      "title": "Título específico", 
      "content": "Qué hacer exactamente"
    },
    "reasoning": "Por qué es necesaria"
  }
]`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt,
        functionName: 'ia_planner_actions',
        temperature: 0.2, // Mantener creatividad controlada
        maxTokens: 800 // Aumentado para evitar truncamiento
      });

      if (!response?.content) {
        console.warn('⚠️ Sin respuesta del IA Planner para acciones');
        return generateFallbackActions(enhancedContext);
      }

      console.log('📝 IA Planner respuesta completa:', response.content);

      // Use robust JSON parser
      const rawActions = parseIntelligentActionsJSON(response.content, task.id);
      const actions = processActions(rawActions, task.id);
      
      console.log('✅ IA Planner acciones procesadas:', actions.length);
      return actions;

    } catch (error) {
      console.error('❌ Error en IA Planner acciones:', error);
      
      // Fallback to basic actions
      try {
        const enhancedContext = await getEnhancedTaskContext(task.id);
        return generateFallbackActions(enhancedContext);
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return [];
      }
    } finally {
      setIsGeneratingActions(false);
    }
  }, [hasActiveConfiguration, task, nextSteps, makeLLMRequest]);

  // Query for IA Planner actions
  const { data: intelligentActions, isLoading: isLoadingActions } = useQuery({
    queryKey: ['ia-planner-actions', task.id, nextSteps, statusSummary],
    queryFn: generatePlannerActions,
    enabled: !!task && !!nextSteps && hasActiveConfiguration,
    staleTime: 8 * 60 * 1000, // 8 minutes
    retry: 1,
  });

  return {
    intelligentActions: intelligentActions || [],
    isGeneratingActions: isLoadingActions || isGeneratingActions,
    hasConfiguration: hasActiveConfiguration,
    isPlannerActive: true,
    plannerCapabilities: IA_PLANNER_IDENTITY.capabilities,
    
    // Track action usage
    trackActionUsage: (actionType: string) => {
      console.log('📊 IA Planner acción utilizada:', actionType);
    },
  };
};

function processActions(rawActions: any[], taskId: string): IntelligentAction[] {
  return rawActions.map((action: any, index: number) => ({
    id: `planner-action-${taskId}-${index}-${Date.now()}`,
    type: action.type || 'create_subtask',
    label: action.label || 'Acción del IA Planner',
    priority: action.priority || 'medium',
    confidence: action.confidence || 0.8,
    suggestedData: {
      title: action.suggestedData?.title || action.label,
      content: action.suggestedData?.content || 'Acción generada por IA Planner',
      ...action.suggestedData
    },
    basedOnPatterns: action.basedOnPatterns || ['ia_planner_analysis'],
    reasoning: action.reasoning || 'Recomendación del IA Planner'
  })).slice(0, 2); // Limit to 2 actions
}

async function generateFallbackActions(context: any): Promise<IntelligentAction[]> {
  console.log('🔄 Generando acciones fallback específicas del IA Planner');
  
  const actions: IntelligentAction[] = [];
  
  // Action based on stagnation
  if (context.daysSinceLastActivity > 3) {
    actions.push({
      id: `planner-reactivate-${context.mainTask.id}`,
      type: 'create_reminder',
      label: 'Reactivar Tarea Estancada',
      priority: 'high',
      confidence: 0.9,
      suggestedData: {
        title: `Reactivar: ${context.mainTask.title}`,
        content: `${context.daysSinceLastActivity} días sin actividad. Revisar estado y definir próximo paso específico.`,
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
      basedOnPatterns: ['stagnation_detected'],
      reasoning: 'Tarea sin actividad requiere atención inmediata'
    });
  }
  
  // Action based on subtasks
  const pendingSubtasks = context.subtasks.filter((s: any) => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    actions.push({
      id: `planner-next-subtask-${context.mainTask.id}`,
      type: 'create_subtask',
      label: 'Continuar Próxima Subtarea',
      priority: 'medium',
      confidence: 0.8,
      suggestedData: {
        title: `Trabajar en: ${pendingSubtasks[0].title}`,
        content: `Continuar con "${pendingSubtasks[0].title}" como próximo paso específico.`,
      },
      basedOnPatterns: ['pending_subtasks'],
      reasoning: 'Subtarea pendiente lista para continuar'
    });
  }
  
  return actions.slice(0, 2); // Limit fallback actions
}
