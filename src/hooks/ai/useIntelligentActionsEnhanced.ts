
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IntelligentAction, IntelligentActionContext } from '@/types/intelligent-actions';
import { useLLMService } from '@/hooks/useLLMService';
import { Task } from '@/hooks/useTasks';
import { generateContextualSystemPrompt, IA_PLANNER_IDENTITY } from '@/config/iaPlanner';
import { getEnhancedTaskContext } from '@/utils/taskContextEnhanced';

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
      console.log('🤖 IA Planner generando acciones inteligentes para:', task.title);
      
      // Get enhanced context
      const enhancedContext = await getEnhancedTaskContext(task.id);
      
      // Generate IA Planner system prompt
      const systemPrompt = generateContextualSystemPrompt(enhancedContext, 'action_generation');
      
      // Create specific prompt for action generation
      const userPrompt = `Como IA Planner, genera máximo 3 acciones inteligentes ESPECÍFICAS para "${task.title}".

CONTEXTO ACTUAL:
- Estado: ${task.status}
- Progreso: ${enhancedContext.completionStatus.overallProgress}%
- Días sin actividad: ${enhancedContext.daysSinceLastActivity}
- Subtareas: ${enhancedContext.subtasks.length} (${enhancedContext.completionStatus.completedSubtasks} completadas)
- Dependencias: ${enhancedContext.dependencies.blocking.length} bloqueantes

PRÓXIMOS PASOS IDENTIFICADOS:
${nextSteps}

Genera acciones en formato JSON:
[
  {
    "type": "create_subtask",
    "label": "Título específico de la acción",
    "priority": "high|medium|low",
    "confidence": 0.0-1.0,
    "suggestedData": {
      "title": "Título específico de la subtarea",
      "content": "Descripción detallada de qué hacer exactamente"
    },
    "basedOnPatterns": ["patron_detectado"],
    "reasoning": "Por qué es importante esta acción específica"
  }
]

REGLAS DEL IA PLANNER:
- Acciones ESPECÍFICAS, no genéricas
- Basadas en el contexto real de la tarea
- Priorizadas por impacto y urgencia
- Ejecutables inmediatamente`;

      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt,
        functionName: 'ia_planner_actions',
        temperature: 0.2, // Low for consistent planning
        maxTokens: 500
      });

      if (!response?.content) {
        console.warn('⚠️ Sin respuesta del IA Planner para acciones');
        return generateFallbackActions(enhancedContext);
      }

      console.log('📝 IA Planner acciones raw:', response.content);

      // Parse actions safely
      const actions = parsePlannerActions(response.content, task.id);
      
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

function parsePlannerActions(content: string, taskId: string): IntelligentAction[] {
  try {
    // Clean JSON response
    const cleaned = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/,(\s*[}\]])/g, '$1')
      .trim();
    
    const parsed = JSON.parse(cleaned);
    const actions = Array.isArray(parsed) ? parsed : [parsed];
    
    return actions.map((action: any, index: number) => ({
      id: `planner-action-${taskId}-${index}`,
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
    })).slice(0, 3); // Limit to 3 actions

  } catch (error) {
    console.error('❌ Error parsing IA Planner actions:', error);
    return [];
  }
}

async function generateFallbackActions(context: any): Promise<IntelligentAction[]> {
  console.log('🔄 Generando acciones fallback del IA Planner');
  
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
        scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      },
      basedOnPatterns: ['stagnation_detected'],
      reasoning: 'Tarea sin actividad requiere atención inmediata'
    });
  }
  
  // Action based on pending subtasks
  const pendingSubtasks = context.subtasks.filter((s: any) => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    actions.push({
      id: `planner-next-subtask-${context.mainTask.id}`,
      type: 'create_subtask',
      label: 'Planificar Próxima Subtarea',
      priority: 'medium',
      confidence: 0.8,
      suggestedData: {
        title: `Planificar: ${pendingSubtasks[0].title}`,
        content: `Definir plan detallado para "${pendingSubtasks[0].title}" como próximo paso.`,
      },
      basedOnPatterns: ['pending_subtasks'],
      reasoning: 'Subtarea pendiente necesita planificación específica'
    });
  }
  
  // Action based on dependencies
  if (context.dependencies.blocking.length > 0) {
    const blockedTask = context.dependencies.blocking[0];
    actions.push({
      id: `planner-resolve-dependency-${context.mainTask.id}`,
      type: 'create_subtask',
      label: 'Resolver Dependencia Crítica',
      priority: 'high',
      confidence: 0.95,
      suggestedData: {
        title: `Resolver: ${blockedTask.title}`,
        content: `Contactar responsable o encontrar alternativa para "${blockedTask.title}" que está bloqueando el progreso.`,
      },
      basedOnPatterns: ['dependency_blocking'],
      reasoning: 'Dependencia bloqueante impide el progreso'
    });
  }
  
  return actions.slice(0, 2); // Limit fallback actions
}
