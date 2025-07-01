
import { useQuery } from '@tanstack/react-query';
import { useLLMService } from '@/hooks/useLLMService';
import { generateEnhancedTaskAnalysis, EnhancedTaskAISummary } from '@/services/taskAIServiceEnhanced';

export function useTaskStateAndStepsEnhanced(taskId: string) {
  const { makeLLMRequest, activeModel, hasActiveConfiguration } = useLLMService();
  
  console.log('🤖 IA Planner Hook iniciado:', {
    taskId,
    hasConfiguration: hasActiveConfiguration,
    activeModel,
    isPlannerEnabled: true
  });
  
  // Generate enhanced AI analysis with IA Planner
  const { 
    data: aiAnalysis, 
    isLoading: analysisLoading, 
    error: analysisError 
  } = useQuery({
    queryKey: [
      'ia-planner-analysis', 
      taskId, 
      activeModel // Regenerate if model changes
    ],
    queryFn: () => {
      console.log('🎯 Ejecutando análisis del IA Planner');
      return generateEnhancedTaskAnalysis(taskId, makeLLMRequest);
    },
    enabled: !!taskId && hasActiveConfiguration,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  console.log('📊 IA Planner Hook state:', {
    hasAnalysis: !!aiAnalysis,
    isLoading: analysisLoading,
    error: analysisError?.message,
    methodology: aiAnalysis?.methodology,
    actionsCount: aiAnalysis?.specificActions?.length || 0,
    riskLevel: aiAnalysis?.riskLevel
  });

  return {
    // Main analysis results
    statusSummary: aiAnalysis?.statusSummary,
    nextSteps: aiAnalysis?.nextSteps,
    alerts: aiAnalysis?.alerts,
    riskLevel: aiAnalysis?.riskLevel,
    
    // Enhanced IA Planner results
    methodology: aiAnalysis?.methodology,
    specificActions: aiAnalysis?.specificActions || [],
    riskAssessment: aiAnalysis?.riskAssessment,
    
    // State information
    isLoading: analysisLoading,
    hasAnalysis: !!aiAnalysis,
    hasConfiguration: hasActiveConfiguration,
    error: analysisError,
    currentModel: activeModel,
    
    // IA Planner specific
    isPlannerActive: true,
    plannerVersion: '1.0'
  };
}
