
import { TaskContext } from '@/utils/taskContext';
import { ConciseTaskProcessor } from './ai/conciseTaskProcessor';
import { IntelligentPromptBuilder } from './ai/intelligentPromptBuilder';
import { ContextualInsightGenerator } from './ai/contextualInsightGenerator';
import { ActionableRecommendationEngine } from './ai/actionableRecommendationEngine';

export interface TaskAISummary {
  statusSummary: string;
  nextSteps: string;
  alerts?: string;
  insights?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  intelligentActions?: any[];
}

/**
 * Genera fallback súper directo sin LLM
 */
function generateConciseFallback(context: TaskContext): TaskAISummary {
  const progress = context.completionStatus.overallProgress;
  const title = context.mainTask.title;
  const daysSinceActivity = context.recentLogs.length > 0 ? 
    Math.floor((new Date().getTime() - new Date(context.recentLogs[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 
    999;
  
  console.log('🔄 Usando fallback conciso');
  
  // Estado súper directo
  let statusSummary = `"${title}" `;
  if (progress >= 80) statusSummary += `casi terminada (${progress}%)`;
  else if (progress >= 40) statusSummary += `en progreso (${progress}%)`;
  else statusSummary += `desarrollo inicial (${progress}%)`;
  
  // Pasos súper directos
  let nextSteps = 'Continuar con próxima subtarea específica';
  if (progress < 20) nextSteps = 'Definir primera subtarea concreta y empezar';
  if (progress > 80) nextSteps = 'Revisar detalles finales y completar tarea';
  
  // Riesgo súper directo
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (daysSinceActivity > 5) riskLevel = 'high';
  else if (daysSinceActivity > 2) riskLevel = 'medium';
  
  return {
    statusSummary,
    nextSteps,
    riskLevel,
    insights: daysSinceActivity > 3 ? `${daysSinceActivity} días sin actividad` : undefined
  };
}

export const generateTaskStateAndSteps = async (
  context: TaskContext,
  makeLLMRequest: any
): Promise<TaskAISummary> => {
  
  console.log('🎯 Iniciando análisis CONCISO para:', context.mainTask.title);
  
  // ✨ Generar análisis local específico (siempre disponible como backup)
  const specificInsights = ContextualInsightGenerator.generateSpecificInsights(context);
  const smartActions = ActionableRecommendationEngine.generateSmartActions(context);

  try {
    // ✨ Construir prompt ultra-conciso
    const { systemPrompt, userPrompt } = IntelligentPromptBuilder.buildContextualAnalysisPrompt(context);
    
    console.log('📤 Enviando prompt conciso al LLM...');
    
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'concise_task_analysis',
      temperature: 0.2, // Bajo para consistencia
      max_tokens: 200, // ⚡ MUY LIMITADO para forzar concisión
      stop: ["\n\n\n", "---"], // Detener en separadores problemáticos
    });

    const rawText = response?.content || response?.message?.content || '';
    
    if (rawText && rawText.length > 20) {
      console.log('🔍 Texto conciso recibido:', rawText.substring(0, 100) + '...');
      
      // ✨ Usar el nuevo procesador conciso
      const conciseAnalysis = ConciseTaskProcessor.processResponse(rawText, context);
      
      // Agregar acciones inteligentes
      if (smartActions.length > 0) {
        conciseAnalysis.intelligentActions = smartActions.slice(0, 2); // Solo las top 2
      }
      
      console.log('✅ Análisis conciso exitoso:', {
        hasStatus: !!conciseAnalysis.statusSummary,
        hasNextSteps: !!conciseAnalysis.nextSteps,
        riskLevel: conciseAnalysis.riskLevel,
        statusLength: conciseAnalysis.statusSummary.length,
        stepsLength: conciseAnalysis.nextSteps.length
      });
      
      return conciseAnalysis;
    } else {
      console.warn('⚠️ Respuesta LLM vacía o muy corta');
    }

  } catch (error) {
    console.error('🚨 Error al obtener análisis conciso del LLM:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      taskId: context.mainTask.id
    });
  }

  // ✨ Usar fallback conciso 
  const fallbackAnalysis = generateConciseFallback(context);
  
  // Agregar acciones inteligentes al fallback
  if (smartActions.length > 0) {
    fallbackAnalysis.intelligentActions = smartActions.slice(0, 2);
  }
  
  console.log('✅ Análisis fallback conciso generado');
  
  return fallbackAnalysis;
};
