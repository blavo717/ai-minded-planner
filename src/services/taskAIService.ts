
import { TaskContext } from '@/utils/taskContext';
import { parseJsonSafely } from './ai/jsonParsingUtils';
import { validateAndCompleteResponse, createFallbackResponse } from './ai/responseValidation';
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
 * Combina insights del LLM con análisis local específico
 */
function combineInsightsIntelligently(llmInsights: string | undefined, localInsights: any[]): string {
  let combinedInsights = '';
  
  // Usar insights del LLM si existen y son útiles
  if (llmInsights && llmInsights.length > 50 && !llmInsights.includes('análisis no disponible')) {
    combinedInsights += llmInsights;
  }
  
  // Agregar insights específicos más relevantes
  const highConfidenceInsights = localInsights.filter(insight => insight.confidence > 0.7);
  if (highConfidenceInsights.length > 0) {
    if (combinedInsights) combinedInsights += '\n\n';
    combinedInsights += 'ANÁLISIS ESPECÍFICO:\n';
    
    highConfidenceInsights.slice(0, 2).forEach(insight => {
      combinedInsights += `• ${insight.title}: ${insight.description} → ${insight.actionable}\n`;
    });
  }
  
  return combinedInsights || 'Análisis contextual en proceso';
}

/**
 * Crea fallback inteligente usando análisis local cuando LLM falla
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
    intelligentActions: actions.slice(0, 2) // Top 2 acciones más relevantes
  };
}

export const generateTaskStateAndSteps = async (
  context: TaskContext,
  makeLLMRequest: any
): Promise<TaskAISummary> => {
  
  console.log('🧠 Iniciando análisis IA inteligente contextual para:', context.mainTask.title);
  
  let response: any; // ✅ Declarar fuera del try

  try {
    // ✨ NUEVA FUNCIONALIDAD: Generar insights específicos localmente
    const specificInsights = ContextualInsightGenerator.generateSpecificInsights(context);
    console.log('🔍 Insights específicos generados:', specificInsights.length);
    
    // ✨ NUEVA FUNCIONALIDAD: Generar acciones inteligentes localmente
    const smartActions = ActionableRecommendationEngine.generateSmartActions(context);
    console.log('⚡ Acciones inteligentes generadas:', smartActions.length);
    
    // ✨ NUEVA FUNCIONALIDAD: Construir prompt contextual inteligente
    const { systemPrompt, userPrompt } = IntelligentPromptBuilder.buildContextualAnalysisPrompt(context);
    
    console.log('📤 Enviando prompt contextual inteligente al LLM...');
    
    response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'intelligent_contextual_analysis',
      temperature: 0.3, // ✅ Balanceado para creatividad contextual
      max_tokens: 800, // ✅ Más tokens para análisis detallado
      stop: ["\n\n\n", "```"], // ✅ Detener en patrones problemáticos
    });

    const content = response?.content || response?.message?.content || '';
    
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    console.log('🔍 Raw LLM response preview:', content.substring(0, 200) + '...');
    
    // ✅ Usar parser robusto existente
    const parsed = parseJsonSafely(content);
    
    // ✅ Validar y completar respuesta
    const validated = validateAndCompleteResponse(parsed);
    
    // ✨ NUEVA FUNCIONALIDAD: Enriquecer respuesta con análisis local
    const enrichedResponse = {
      ...validated,
      // Combinar insights: LLM + análisis local específico
      insights: combineInsightsIntelligently(validated.insights, specificInsights),
      // Usar acciones locales inteligentes si LLM no las generó bien
      intelligentActions: validated.intelligentActions?.length > 0 ? 
        validated.intelligentActions : 
        smartActions
    };
    
    // Convertir scheduledFor strings a Date objects
    if (enrichedResponse.intelligentActions) {
      enrichedResponse.intelligentActions = enrichedResponse.intelligentActions.map((action: any) => ({
        ...action,
        suggestedData: {
          ...action.suggestedData,
          scheduledFor: action.suggestedData?.scheduledFor ? 
            new Date(action.suggestedData.scheduledFor) : 
            undefined
        }
      }));
    }
    
    console.log('✅ Successfully generated Enhanced TaskAISummary:', {
      hasStatusSummary: !!enrichedResponse.statusSummary,
      hasNextSteps: !!enrichedResponse.nextSteps,
      hasInsights: !!enrichedResponse.insights,
      riskLevel: enrichedResponse.riskLevel,
      actionsCount: enrichedResponse.intelligentActions?.length || 0,
      localInsights: specificInsights.length,
      localActions: smartActions.length
    });

    return enrichedResponse;

  } catch (error) {
    console.error('🚨 Error in generateTaskStateAndSteps:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      taskId: context.mainTask.id,
      taskTitle: context.mainTask.title,
      responsePreview: response?.content?.substring(0, 200) || 'No response content',
      fullError: error
    });

    // ⚡ NUEVA FUNCIONALIDAD: Fallback inteligente con análisis local
    console.log('🔄 Usando fallback inteligente con análisis local...');
    
    try {
      const localInsights = ContextualInsightGenerator.generateSpecificInsights(context);
      const localActions = ActionableRecommendationEngine.generateSmartActions(context);
      
      const intelligentFallback = createIntelligentFallback(context, localInsights, localActions);
      
      console.log('✅ Fallback inteligente generado exitosamente');
      return intelligentFallback;
      
    } catch (fallbackError) {
      console.error('🚨 Error en fallback inteligente:', fallbackError);
      // ✅ Fallback seguro final
      return createFallbackResponse(context.mainTask.title);
    }
  }
};
