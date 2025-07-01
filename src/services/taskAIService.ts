
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

// Helper functions for enhanced analysis - VERSIÓN CORREGIDA
function getDaysSinceCreated(context: TaskContext): number {
  try {
    const createdDate = new Date(context.mainTask.created_at);
    const now = new Date();
    
    // Validar fecha
    if (isNaN(createdDate.getTime())) {
      console.warn('⚠️ Fecha de creación inválida:', context.mainTask.created_at);
      return 0;
    }
    
    const diffMs = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Validar resultado
    if (diffDays < 0 || diffDays > 3650) { // Máximo 10 años
      console.warn('⚠️ Diferencia de días inválida:', diffDays);
      return 0;
    }
    
    return diffDays;
  } catch (error) {
    console.error('❌ Error calculando días desde creación:', error);
    return 0;
  }
}

function getDaysSinceLastActivity(context: TaskContext): number {
  try {
    // Si no hay logs, usar fecha de creación
    if (!context.recentLogs || context.recentLogs.length === 0) {
      console.log('📝 No hay logs recientes, usando fecha de creación');
      return getDaysSinceCreated(context);
    }
    
    const lastLog = context.recentLogs[0];
    if (!lastLog || !lastLog.created_at) {
      console.warn('⚠️ Log sin fecha válida');
      return getDaysSinceCreated(context);
    }
    
    const lastActivityDate = new Date(lastLog.created_at);
    const now = new Date();
    
    // Validar fecha
    if (isNaN(lastActivityDate.getTime())) {
      console.warn('⚠️ Fecha de actividad inválida:', lastLog.created_at);
      return getDaysSinceCreated(context);
    }
    
    const diffMs = now.getTime() - lastActivityDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Validar resultado
    if (diffDays < 0 || diffDays > 3650) { // Máximo 10 años
      console.warn('⚠️ Diferencia de días inválida:', diffDays);
      return getDaysSinceCreated(context);
    }
    
    console.log('📅 Días sin actividad calculados:', diffDays);
    return diffDays;
  } catch (error) {
    console.error('❌ Error calculando días sin actividad:', error);
    return getDaysSinceCreated(context);
  }
}

function getRelativeTime(dateString: string): string {
  try {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffInHours < 0) return 'Fecha futura';
    if (diffInHours < 1) return 'hace menos de 1h';
    if (diffInHours < 24) return `hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays > 365) return 'hace más de 1 año';
    
    return `hace ${diffInDays}d`;
  } catch (error) {
    console.error('❌ Error calculando tiempo relativo:', error);
    return 'Sin fecha';
  }
}

/**
 * Valida el contexto de la tarea antes del análisis
 */
function validateTaskContext(context: TaskContext): boolean {
  console.log('🔍 Validando contexto de tarea');
  
  // Validar tarea principal
  if (!context.mainTask || !context.mainTask.id) {
    console.error('❌ Tarea principal inválida');
    return false;
  }
  
  // Validar fechas críticas
  if (!context.mainTask.created_at) {
    console.error('❌ Fecha de creación faltante');
    return false;
  }
  
  const createdDate = new Date(context.mainTask.created_at);
  if (isNaN(createdDate.getTime())) {
    console.error('❌ Fecha de creación inválida:', context.mainTask.created_at);
    return false;
  }
  
  // Validar logs si existen
  if (context.recentLogs && context.recentLogs.length > 0) {
    const firstLog = context.recentLogs[0];
    if (firstLog.created_at) {
      const logDate = new Date(firstLog.created_at);
      if (isNaN(logDate.getTime())) {
        console.warn('⚠️ Fecha de log inválida:', firstLog.created_at);
        // No es crítico, continuar sin logs
        context.recentLogs = [];
      }
    }
  }
  
  console.log('✅ Contexto validado correctamente');
  return true;
}

/**
 * Procesa JSON de forma segura evitando errores de parsing
 */
function processJsonSafely(content: string, context: TaskContext): TaskAISummary {
  try {
    // Limpiar contenido
    const cleaned = content
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/[\r\n]+/g, ' ')
      .trim();
    
    // Intentar parsear JSON
    const parsed = JSON.parse(cleaned);
    
    const taskTitle = context.mainTask.title;
    const progress = Math.round(context.completionStatus.overallProgress);
    
    return {
      statusSummary: parsed.estado || `"${taskTitle}" en análisis (${progress}%)`,
      nextSteps: parsed.pasos || 'Continuar con próximas subtareas',
      riskLevel: parsed.riesgo === 'alto' ? 'high' : 
                 parsed.riesgo === 'medio' ? 'medium' : 'low',
      insights: `Análisis basado en ${progress}% progreso`
    };
    
  } catch (error) {
    console.error('❌ Error parseando JSON:', error);
    return generateSafeFallback(context);
  }
}

/**
 * Genera fallback seguro basado en datos reales
 */
function generateSafeFallback(context: TaskContext): TaskAISummary {
  const taskTitle = context.mainTask.title;
  const progress = Math.round(context.completionStatus.overallProgress);
  const daysSinceActivity = getDaysSinceLastActivity(context);
  
  console.log('🔄 Generando fallback seguro');
  
  let statusSummary = `"${taskTitle}" `;
  let nextSteps = '';
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  // Estado por progreso
  if (progress >= 80) {
    statusSummary += `casi terminada (${progress}%)`;
    nextSteps = 'Revisar detalles finales y completar';
  } else if (progress >= 40) {
    statusSummary += `en buen progreso (${progress}%)`;
    nextSteps = 'Continuar con subtareas pendientes';
  } else {
    statusSummary += `en desarrollo (${progress}%)`;
    nextSteps = 'Definir próxima subtarea específica';
  }
  
  // Riesgo por inactividad
  if (daysSinceActivity > 7) {
    riskLevel = 'high';
    nextSteps = 'URGENTE: Retomar trabajo inmediatamente';
  } else if (daysSinceActivity > 3) {
    riskLevel = 'medium';
  }
  
  return {
    statusSummary,
    nextSteps,
    riskLevel,
    insights: daysSinceActivity > 2 ? `${daysSinceActivity} días sin actividad` : undefined
  };
}

export const generateTaskStateAndSteps = async (
  context: TaskContext,
  makeLLMRequest: any
): Promise<TaskAISummary> => {
  
  console.log('🎯 Iniciando análisis CONCISO para:', context.mainTask.title);
  
  // ✅ VALIDAR CONTEXTO PRIMERO
  if (!validateTaskContext(context)) {
    console.error('❌ Contexto inválido, usando fallback');
    return generateSafeFallback(context);
  }
  
  const daysSinceCreated = getDaysSinceCreated(context);
  const daysSinceActivity = getDaysSinceLastActivity(context);
  
  // ✅ LOGGING PARA DEBUG
  console.log('📊 Datos calculados:', {
    taskTitle: context.mainTask.title,
    progress: context.completionStatus.overallProgress,
    daysSinceCreated,
    daysSinceActivity,
    hasLogs: context.recentLogs.length > 0
  });
  
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
      maxTokens: 200, // ⚡ MUY LIMITADO para forzar concisión
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
  const fallbackAnalysis = generateSafeFallback(context);
  
  // Agregar acciones inteligentes al fallback
  if (smartActions.length > 0) {
    fallbackAnalysis.intelligentActions = smartActions.slice(0, 2);
  }
  
  console.log('✅ Análisis fallback conciso generado');
  
  return fallbackAnalysis;
};
