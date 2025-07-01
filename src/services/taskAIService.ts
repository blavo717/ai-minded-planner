
import { TaskContext } from '@/utils/taskContext';
import { parseJsonSafely } from './ai/jsonParsingUtils';
import { validateAndCompleteResponse, createFallbackResponse } from './ai/responseValidation';
import { buildTaskAnalysisPrompt } from './ai/promptBuilder';

export interface TaskAISummary {
  statusSummary: string;
  nextSteps: string;
  alerts?: string;
  insights?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  intelligentActions?: any[];
}

export const generateTaskStateAndSteps = async (
  context: TaskContext,
  makeLLMRequest: any
): Promise<TaskAISummary> => {
  
  const { systemPrompt, userPrompt } = buildTaskAnalysisPrompt(context);

  let response: any; // ✅ Declarar fuera del try

  try {
    response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'enhanced_task_analysis',
      temperature: 0.0, // ✅ Ultra bajo para consistencia
      max_tokens: 500, // ✅ Límite para respuestas cortas
      stop: ["\n\n", "```"], // ✅ Detener en patrones problemáticos
    });

    const content = response?.content || response?.message?.content || '';
    
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    console.log('🔍 Raw LLM response preview:', content.substring(0, 150) + '...');
    
    // ✅ Usar parser robusto
    const parsed = parseJsonSafely(content);
    
    // ✅ Validar y completar respuesta
    const validated = validateAndCompleteResponse(parsed);
    
    // Convertir scheduledFor strings a Date objects
    if (validated.intelligentActions) {
      validated.intelligentActions = validated.intelligentActions.map((action: any) => ({
        ...action,
        suggestedData: {
          ...action.suggestedData,
          scheduledFor: action.suggestedData.scheduledFor ? 
            new Date(action.suggestedData.scheduledFor) : 
            undefined
        }
      }));
    }
    
    console.log('✅ Successfully generated TaskAISummary:', {
      hasStatusSummary: !!validated.statusSummary,
      hasNextSteps: !!validated.nextSteps,
      riskLevel: validated.riskLevel,
      actionsCount: validated.intelligentActions?.length || 0
    });

    return validated;

  } catch (error) {
    console.error('🚨 Error in generateTaskStateAndSteps:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      taskId: context.mainTask.id,
      taskTitle: context.mainTask.title,
      responsePreview: response?.content?.substring(0, 200) || 'No response content',
      fullError: error
    });

    // ✅ Fallback seguro
    return createFallbackResponse(context.mainTask.title);
  }
};
