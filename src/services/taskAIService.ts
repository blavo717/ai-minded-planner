
import { TaskContext } from '@/utils/taskContext';
import { StructuredTextParser, ParsedLLMResponse } from './ai/structuredTextParser';
import { ContextualInsightGenerator } from './ai/contextualInsightGenerator';
import { ActionableRecommendationEngine } from './ai/actionableRecommendationEngine';
import { IntelligentPromptBuilder } from './ai/intelligentPromptBuilder';

export interface TaskAISummary {
  statusSummary: string;
  nextSteps: string;
  alerts?: string;
  insights?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  intelligentActions?: any[];
}

/**
 * Combina análisis del LLM (texto estructurado) con análisis local específico
 */
function combineAnalysisIntelligently(
  llmAnalysis: ParsedLLMResponse | null, 
  localInsights: any[], 
  localActions: any[]
): TaskAISummary {
  
  let combinedInsights = '';
  
  // Usar análisis del LLM como base principal
  if (llmAnalysis && llmAnalysis.insights) {
    combinedInsights += llmAnalysis.insights;
  }
  
  // Enriquecer con insights específicos más relevantes del análisis local
  const highConfidenceInsights = localInsights.filter(insight => insight.confidence > 0.7);
  if (highConfidenceInsights.length > 0) {
    if (combinedInsights) combinedInsights += '\n\n';
    combinedInsights += 'ANÁLISIS ESPECÍFICO:\n';
    
    highConfidenceInsights.slice(0, 2).forEach(insight => {
      combinedInsights += `• ${insight.title}: ${insight.description} → ${insight.actionable}\n`;
    });
  }
  
  // Usar análisis del LLM como principal, análisis local como complemento
  return {
    statusSummary: llmAnalysis?.statusSummary || 'Análisis contextual en proceso',
    nextSteps: llmAnalysis?.nextSteps || 'Revisar estado actual y definir acción específica',
    alerts: llmAnalysis?.alerts || undefined,
    insights: combinedInsights || 'Análisis contextual disponible',
    riskLevel: llmAnalysis?.riskLevel || 'medium',
    intelligentActions: localActions.slice(0, 3) // Top 3 acciones más relevantes
  };
}

/**
 * Crea fallback inteligente usando análisis local cuando LLM falla completamente
 */
function createIntelligentFallback(context: TaskContext, insights: any[], actions: any[]): TaskAISummary {
  const { mainTask, completionStatus } = context;
  
  // Generar resumen específico basado en datos
  let statusSummary = `"${mainTask.title}" - ${completionStatus.overallProgress}% completado`;
  
  if (completionStatus.totalSubtasks > 0) {
    statusSummary += ` (${completionStatus.completedSubtasks}/${completionStatus.totalSubtasks} subtareas)`;
  }
  
  // Agregar insight más relevante
  const topInsight = insights.find(i => i.confidence > 0.8);
  if (topInsight) {
    statusSummary += `. ${topInsight.description}`;
  }
  
  // Generar próximos pasos específicos  
  let nextSteps = 'Próximos pasos específicos: ';
  if (actions.length > 0) {
    nextSteps += actions[0].suggestedData?.content || 'Revisar estado actual y definir acción específica';
  } else if (insights.length > 0) {
    nextSteps += insights[0].actionable || 'Continuar con el progreso actual';
  } else {
    nextSteps += 'Revisar subtareas pendientes y seleccionar la más crítica';
  }
  
  // Determinar nivel de riesgo basado en insights
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  const highUrgencyInsights = insights.filter(i => i.urgency === 'high');
  if (highUrgencyInsights.length > 0) {
    riskLevel = 'high';
  } else if (insights.filter(i => i.urgency === 'medium').length > 0) {
    riskLevel = 'medium';
  }
  
  return {
    statusSummary,
    nextSteps,
    riskLevel,
    insights: insights.length > 0 ? `Detectados ${insights.length} patrones específicos que requieren atención` : undefined,
    intelligentActions: actions.slice(0, 2)
  };
}

export const generateTaskStateAndSteps = async (
  context: TaskContext,
  makeLLMRequest: any
): Promise<TaskAISummary> => {
  
  console.log('🧠 Iniciando análisis IA con texto estructurado para:', context.mainTask.title);
  
  // ✨ Generar análisis local específico (siempre disponible)
  const specificInsights = ContextualInsightGenerator.generateSpecificInsights(context);
  console.log('🔍 Insights específicos generados:', specificInsights.length);
  
  const smartActions = ActionableRecommendationEngine.generateSmartActions(context);
  console.log('⚡ Acciones inteligentes generadas:', smartActions.length);

  let llmAnalysis: ParsedLLMResponse | null = null;

  try {
    // ✨ Construir prompt para texto estructurado
    const { systemPrompt, userPrompt } = IntelligentPromptBuilder.buildContextualAnalysisPrompt(context);
    
    console.log('📤 Enviando prompt para texto estructurado al LLM...');
    
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'structured_text_analysis',
      temperature: 0.3,
      max_tokens: 800,
      stop: ["\n\n\n", "---"], // Detener en separadores problemáticos
    });

    const rawText = response?.content || response?.message?.content || '';
    
    if (rawText && rawText.length > 50) {
      console.log('🔍 Texto LLM recibido, parseando...', rawText.substring(0, 100) + '...');
      
      // ✨ Usar el nuevo parser de texto estructurado  
      llmAnalysis = StructuredTextParser.parseStructuredText(rawText);
      
      console.log('✅ Análisis LLM parseado exitosamente:', {
        hasStatus: !!llmAnalysis.statusSummary,
        hasNextSteps: !!llmAnalysis.nextSteps,
        hasInsights: !!llmAnalysis.insights,
        riskLevel: llmAnalysis.riskLevel
      });
    } else {
      console.warn('⚠️ Respuesta LLM vacía o muy corta');
    }

  } catch (error) {
    console.error('🚨 Error al obtener análisis del LLM:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      taskId: context.mainTask.id
    });
  }

  // ✨ Combinar análisis LLM + análisis local
  const finalAnalysis = combineAnalysisIntelligently(llmAnalysis, specificInsights, smartActions);
  
  // Convertir scheduledFor strings a Date objects en acciones
  if (finalAnalysis.intelligentActions) {
    finalAnalysis.intelligentActions = finalAnalysis.intelligentActions.map((action: any) => ({
      ...action,
      suggestedData: {
        ...action.suggestedData,
        scheduledFor: action.suggestedData?.scheduledFor ? 
          new Date(action.suggestedData.scheduledFor) : 
          undefined
      }
    }));
  }
  
  console.log('✅ Análisis final combinado generado:', {
    hasLLMAnalysis: !!llmAnalysis,
    hasLocalInsights: specificInsights.length > 0,
    hasActions: finalAnalysis.intelligentActions?.length || 0,
    riskLevel: finalAnalysis.riskLevel
  });

  return finalAnalysis;
};
