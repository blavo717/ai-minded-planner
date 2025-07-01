
import { useQuery } from '@tanstack/react-query';
import { useLLMService } from '@/hooks/useLLMService';
import { getTaskContext } from '@/utils/taskContext';
import { generateTaskStateAndSteps, TaskAISummary } from '@/services/taskAIService';

export function useTaskStateAndSteps(taskId: string) {
  const { makeLLMRequest, activeModel, hasActiveConfiguration } = useLLMService();
  
  console.log('🔧 Hook expandido con alertas e insights:', {
    usingEnhancedStructure: true,
    activeModel,
    hasConfiguration: hasActiveConfiguration,
    taskId,
    temperature: 0.7,
    functionName: 'enhanced_task_analysis'
  });
  
  // Obtener contexto de la tarea
  const { data: context, isLoading: contextLoading, error: contextError } = useQuery({
    queryKey: ['task-context', taskId],
    queryFn: () => getTaskContext(taskId),
    enabled: !!taskId,
    staleTime: 3 * 60 * 1000, // Cache por 3 minutos
    retry: 2
  });

  // Generar análisis IA expandido
  const { 
    data: aiSummary, 
    isLoading: summaryLoading, 
    error: summaryError 
  } = useQuery({
    queryKey: [
      'enhanced-task-ai-summary', 
      taskId, 
      context?.recentLogs?.length,
      context?.completionStatus?.overallProgress,
      activeModel // Regenerar si cambia el modelo
    ],
    queryFn: () => {
      console.log('🎯 Ejecutando generateTaskStateAndSteps con análisis expandido');
      return generateTaskStateAndSteps(context!, makeLLMRequest);
    },
    enabled: !!context && hasActiveConfiguration,
    staleTime: 15 * 60 * 1000, // Cache por 15 minutos
    retry: 1,
    refetchOnWindowFocus: false
  });

  console.log('📊 Enhanced hook state:', {
    hasContext: !!context,
    hasAI: !!aiSummary,
    hasAlerts: !!aiSummary?.alerts,
    hasInsights: !!aiSummary?.insights,
    riskLevel: aiSummary?.riskLevel,
    contextLoading,
    summaryLoading,
    contextError: contextError?.message,
    summaryError: summaryError?.message,
    currentModel: activeModel
  });

  return {
    statusSummary: aiSummary?.statusSummary,
    nextSteps: aiSummary?.nextSteps,
    alerts: aiSummary?.alerts,
    insights: aiSummary?.insights,
    riskLevel: aiSummary?.riskLevel,
    isLoading: contextLoading || summaryLoading,
    hasContext: !!context,
    hasAI: !!aiSummary,
    hasConfiguration: hasActiveConfiguration,
    error: contextError || summaryError,
    currentModel: activeModel,
    context: context
  };
}
