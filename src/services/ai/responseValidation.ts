
import { TaskAISummary } from '@/services/taskAIService';

/**
 * Response Validation Utilities
 * Handles validation and completion of AI responses with safe defaults
 */

/**
 * Valida y completa la respuesta parseada con valores por defecto
 */
export function validateAndCompleteResponse(parsed: any): TaskAISummary {
  const validRiskLevels = ['low', 'medium', 'high'];
  
  return {
    statusSummary: typeof parsed.statusSummary === 'string' ? parsed.statusSummary : 'Análisis no disponible temporalmente',
    nextSteps: typeof parsed.nextSteps === 'string' ? parsed.nextSteps : 'Revisar tarea manualmente',
    alerts: parsed.alerts || undefined,
    insights: parsed.insights || undefined,
    riskLevel: validRiskLevels.includes(parsed.riskLevel) ? parsed.riskLevel : 'low',
    intelligentActions: Array.isArray(parsed.intelligentActions) ? parsed.intelligentActions : []
  };
}

/**
 * Creates a safe fallback response when AI analysis fails
 */
export function createFallbackResponse(taskTitle: string): TaskAISummary {
  return {
    statusSummary: `Error al analizar la tarea "${taskTitle}". Revisar manualmente.`,
    nextSteps: 'Verificar el estado de la tarea y contactar soporte si persiste el problema.',
    riskLevel: 'medium' as const,
    intelligentActions: []
  };
}
