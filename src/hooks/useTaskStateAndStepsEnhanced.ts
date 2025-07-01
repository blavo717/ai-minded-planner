
import { useQuery } from '@tanstack/react-query';
import { useLLMService } from '@/hooks/useLLMService';
import { generateEnhancedTaskAnalysis, EnhancedTaskAISummary } from '@/services/taskAIServiceEnhanced';
import { useState } from 'react';

export function useTaskStateAndStepsEnhanced(taskId: string) {
  const { makeLLMRequest, activeModel, hasActiveConfiguration } = useLLMService();
  const [manualTrigger, setManualTrigger] = useState(false);
  
  console.log('🤖 IA Planner Hook iniciado:', {
    taskId,
    hasConfiguration: hasActiveConfiguration,
    activeModel,
    isPlannerEnabled: true,
    manualTrigger
  });
  
  // Generate enhanced AI analysis with IA Planner - NOW MANUAL ONLY
  const { 
    data: aiAnalysis, 
    isLoading: analysisLoading, 
    error: analysisError,
    refetch
  } = useQuery({
    queryKey: [
      'ia-planner-analysis', 
      taskId, 
      activeModel,
      manualTrigger // Include trigger in key to force refresh
    ],
    queryFn: () => {
      console.log('🎯 Ejecutando análisis del IA Planner (MANUAL)');
      return generateEnhancedTaskAnalysis(taskId, makeLLMRequest);
    },
    enabled: !!taskId && hasActiveConfiguration && manualTrigger, // ONLY when manually triggered
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Function to manually execute the analysis
  const executeAnalysis = async () => {
    console.log('🚀 Disparando análisis manual del IA Planner');
    setManualTrigger(true);
    await refetch();
  };

  // Function to reset/clear analysis
  const clearAnalysis = () => {
    console.log('🧹 Limpiando análisis del IA Planner');
    setManualTrigger(false);
  };

  console.log('📊 IA Planner Hook state:', {
    hasAnalysis: !!aiAnalysis,
    isLoading: analysisLoading,
    error: analysisError?.message,
    methodology: aiAnalysis?.methodology,
    actionsCount: aiAnalysis?.specificActions?.length || 0,
    riskLevel: aiAnalysis?.riskLevel,
    isManualMode: true
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
    
    // IA Planner specific - NOW WITH MANUAL CONTROL
    isPlannerActive: true,
    plannerVersion: '1.0',
    isManualMode: true,
    
    // Manual control functions
    executeAnalysis,
    clearAnalysis,
    canExecute: !!taskId && hasActiveConfiguration
  };
}
