import { getCompleteTaskContext, getGlobalUserContext, CompleteTaskContext } from '@/utils/enhancedTaskContext';
import { TaskAISummary } from './taskAIService';

export interface EnhancedAISummary extends TaskAISummary {
  hierarchyAnalysis?: {
    totalTasks: number;
    completedTasks: number;
    blockedSubtasks: string[];
    nextMicrotasks: string[];
  };
  workSessionData?: {
    activeWork: boolean;
    workTime: string;
    productivity: string;
  };
  smartRecommendations?: {
    immediate: string[];
    planning: string[];
    optimization: string[];
  };
  contextQuality: number;
}

export interface GlobalUserInsights {
  workPattern: 'productive' | 'moderate' | 'struggling' | 'inactive';
  topPriorities: Array<{
    taskId: string;
    title: string;
    urgencyScore: number;
    reason: string;
  }>;
  productivityInsights: {
    todayScore: number;
    weeklyTrend: 'improving' | 'stable' | 'declining';
    blockers: string[];
    opportunities: string[];
  };
  timeManagement: {
    recommendedFocus: string;
    breakSuggestion: boolean;
    workloadAssessment: 'underloaded' | 'balanced' | 'overloaded';
  };
  projectHealth: Array<{
    projectId: string;
    name: string;
    status: 'healthy' | 'at_risk' | 'stalled';
    recommendation: string;
  }>;
}

/**
 * Genera análisis mejorado de una tarea específica usando contexto completo
 */
export const generateEnhancedTaskAnalysis = async (
  taskId: string,
  makeLLMRequest: any
): Promise<EnhancedAISummary> => {
  console.log('🚀 Iniciando análisis MEJORADO para task:', taskId);

  try {
    // Obtener contexto completo de la tarea
    const context = await getCompleteTaskContext(taskId);
    
    console.log('📊 Contexto completo obtenido:', {
      hierarchySize: context.fullHierarchy.allTasks.length,
      logsCount: context.activityData.allLogs.length,
      sessionsCount: context.workSessions.recentSessions.length,
      hasProject: !!context.projectContext
    });

    // Construir prompt enriquecido
    const enrichedPrompt = buildEnhancedTaskPrompt(context);
    
    let aiSummary: EnhancedAISummary | null = null;

    try {
      // Intentar obtener análisis de IA
      const response = await makeLLMRequest({
        systemPrompt: ENHANCED_SYSTEM_PROMPT,
        userPrompt: enrichedPrompt,
        functionName: 'enhanced_task_analysis',
        temperature: 0.3,
        maxTokens: 400
      });

      const rawResponse = response?.content || response?.message?.content || '';
      
      if (rawResponse && rawResponse.length > 50) {
        aiSummary = parseEnhancedResponse(rawResponse, context);
        console.log('✅ Análisis de IA exitoso');
      }
    } catch (error) {
      console.warn('⚠️ IA no disponible, usando análisis local:', error);
    }

    // Generar análisis local si no hay IA o como fallback
    if (!aiSummary) {
      aiSummary = generateLocalEnhancedAnalysis(context);
      console.log('🔄 Usando análisis local mejorado');
    }

    // Calcular calidad del contexto
    const contextQuality = calculateContextQuality(context);
    aiSummary.contextQuality = contextQuality;

    console.log('✅ Análisis MEJORADO completado:', {
      hasHierarchy: !!aiSummary.hierarchyAnalysis,
      hasWorkSession: !!aiSummary.workSessionData,
      recommendations: aiSummary.smartRecommendations?.immediate.length || 0,
      contextQuality
    });

    return aiSummary;

  } catch (error) {
    console.error('❌ Error en análisis mejorado:', error);
    // Fallback básico
    return {
      statusSummary: 'Error obteniendo análisis completo',
      nextSteps: 'Revisar manualmente el estado de la tarea',
      riskLevel: 'medium',
      contextQuality: 0
    };
  }
};

/**
 * Genera insights globales del usuario
 */
export const generateGlobalUserInsights = async (
  userId: string,
  makeLLMRequest: any
): Promise<GlobalUserInsights> => {
  console.log('🌍 Generando insights globales para usuario:', userId);

  try {
    const globalContext = await getGlobalUserContext(userId);
    
    // Analizar patrón de trabajo
    const workPattern = analyzeWorkPattern(globalContext);
    
    // Identificar prioridades
    const topPriorities = identifyTopPriorities(globalContext);
    
    // Análisis de productividad
    const productivityInsights = analyzeProductivity(globalContext);
    
    // Gestión del tiempo
    const timeManagement = analyzeTimeManagement(globalContext);
    
    // Salud de proyectos
    const projectHealth = analyzeProjectHealth(globalContext);

    const insights: GlobalUserInsights = {
      workPattern,
      topPriorities,
      productivityInsights,
      timeManagement,
      projectHealth
    };

    console.log('✅ Insights globales generados:', {
      workPattern,
      priorities: topPriorities.length,
      projects: projectHealth.length
    });

    return insights;

  } catch (error) {
    console.error('❌ Error generando insights globales:', error);
    throw error;
  }
};

// === FUNCIONES DE ANÁLISIS LOCAL ===

function generateLocalEnhancedAnalysis(context: CompleteTaskContext): EnhancedAISummary {
  const { mainTask, fullHierarchy, activityData, progressAnalysis, workSessions } = context;
  
  const progress = progressAnalysis.overallProgress;
  const daysSinceActivity = activityData.daysSinceLastActivity;
  
  // Análisis de estado
  let statusSummary = `"${mainTask.title}" `;
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  
  if (progress >= 90) {
    statusSummary += `casi terminada (${progress}%)`;
  } else if (progress >= 60) {
    statusSummary += `en buen progreso (${progress}%)`;
  } else if (progress >= 30) {
    statusSummary += `avanzando (${progress}%)`;
  } else {
    statusSummary += `en desarrollo inicial (${progress}%)`;
  }

  // Evaluar riesgo
  if (daysSinceActivity > 7) {
    riskLevel = 'high';
    statusSummary += ' - REQUIERE ATENCIÓN URGENTE';
  } else if (daysSinceActivity > 3) {
    riskLevel = 'medium';
  }

  // Próximos pasos
  let nextSteps = '';
  const pendingSubtasks = fullHierarchy.subtasks.filter(s => s.status !== 'completed');
  const pendingMicrotasks = fullHierarchy.microtasks.filter(m => m.status !== 'completed');

  if (pendingMicrotasks.length > 0) {
    nextSteps = `Completar microtarea: "${pendingMicrotasks[0].title}"`;
  } else if (pendingSubtasks.length > 0) {
    nextSteps = `Trabajar en subtarea: "${pendingSubtasks[0].title}"`;
  } else if (progress < 100) {
    nextSteps = 'Revisar y finalizar detalles pendientes';
  } else {
    nextSteps = 'Marcar como completada';
  }

  // Análisis de jerarquía
  const blockedSubtasks = pendingSubtasks.filter(s => s.needs_followup).map(s => s.title);
  const nextMicrotasks = pendingMicrotasks.slice(0, 3).map(m => m.title);

  // Datos de sesión de trabajo
  const activeWork = workSessions.activeSessions.length > 0;
  const workTime = `${Math.round(workSessions.todayWorkTime)} min hoy`;
  
  let productivity = 'normal';
  if (workSessions.todayWorkTime > 240) productivity = 'alta';
  else if (workSessions.todayWorkTime < 60) productivity = 'baja';

  // Recomendaciones inteligentes
  const immediate: string[] = [];
  const planning: string[] = [];
  const optimization: string[] = [];

  if (daysSinceActivity > 1) {
    immediate.push('Retomar trabajo en esta tarea');
  }
  
  if (pendingMicrotasks.length > 3) {
    planning.push('Priorizar las 3 microtareas más importantes');
  }
  
  if (context.userContext.isProductiveTime && !activeWork) {
    immediate.push('Momento productivo ideal para trabajar');
  }

  if (progressAnalysis.stagnationRisk === 'high') {
    optimization.push('Revisar y simplificar enfoque de la tarea');
  }

  return {
    statusSummary,
    nextSteps,
    riskLevel,
    hierarchyAnalysis: {
      totalTasks: fullHierarchy.allTasks.length,
      completedTasks: fullHierarchy.allTasks.filter(t => t.status === 'completed').length,
      blockedSubtasks,
      nextMicrotasks
    },
    workSessionData: {
      activeWork,
      workTime,
      productivity
    },
    smartRecommendations: {
      immediate,
      planning,
      optimization
    },
    contextQuality: 0 // Se asignará después
  };
}

function calculateContextQuality(context: CompleteTaskContext): number {
  let quality = 0;
  
  // Datos básicos (25%)
  if (context.mainTask.id) quality += 25;
  
  // Jerarquía (25%)
  if (context.fullHierarchy.allTasks.length > 1) quality += 15;
  if (context.fullHierarchy.subtasks.length > 0) quality += 10;
  
  // Actividad (25%)
  if (context.activityData.allLogs.length > 0) quality += 15;
  if (context.activityData.daysSinceLastActivity < 7) quality += 10;
  
  // Trabajo (25%)
  if (context.workSessions.recentSessions.length > 0) quality += 15;
  if (context.userContext.completedToday > 0) quality += 10;
  
  return Math.min(quality, 100);
}

function analyzeWorkPattern(globalContext: any): 'productive' | 'moderate' | 'struggling' | 'inactive' {
  const { tasks } = globalContext;
  const completedToday = tasks.completedToday.length;
  const activeTasks = tasks.active.length;
  
  if (completedToday >= 3 && activeTasks <= 5) return 'productive';
  if (completedToday >= 1 || activeTasks >= 3) return 'moderate';
  if (activeTasks > 0) return 'struggling';
  return 'inactive';
}

function identifyTopPriorities(globalContext: any) {
  const { tasks } = globalContext;
  const urgent = tasks.urgent.slice(0, 3);
  
  return urgent.map((task: any, index: number) => ({
    taskId: task.id,
    title: task.title,
    urgencyScore: 100 - index * 10,
    reason: 'Tarea marcada como urgente'
  }));
}

function analyzeProductivity(globalContext: any) {
  const { tasks } = globalContext;
  const completedToday = tasks.completedToday.length;
  
  const todayScore = Math.min(100, completedToday * 20);
  const weeklyTrend = 'stable' as const; // Simplificado
  
  const blockers: string[] = [];
  if (tasks.active.length > 10) {
    blockers.push('Demasiadas tareas activas simultáneamente');
  }
  
  const opportunities: string[] = [];
  if (completedToday === 0) {
    opportunities.push('Comenzar con una tarea pequeña para generar momentum');
  }
  
  return {
    todayScore,
    weeklyTrend,
    blockers,
    opportunities
  };
}

function analyzeTimeManagement(globalContext: any) {
  const { tasks, activity } = globalContext;
  const todayWorkTime = activity.todayWorkTime;
  
  let recommendedFocus = 'Tareas de alta prioridad';
  if (tasks.urgent.length > 0) {
    recommendedFocus = `Urgente: ${tasks.urgent[0].title}`;
  }
  
  const breakSuggestion = todayWorkTime > 240; // Más de 4 horas
  
  let workloadAssessment: 'underloaded' | 'balanced' | 'overloaded' = 'balanced';
  if (tasks.active.length > 15) workloadAssessment = 'overloaded';
  else if (tasks.active.length < 3) workloadAssessment = 'underloaded';
  
  return {
    recommendedFocus,
    breakSuggestion,
    workloadAssessment
  };
}

function analyzeProjectHealth(globalContext: any) {
  const { projects } = globalContext;
  
  return projects.active.slice(0, 5).map((project: any) => ({
    projectId: project.id,
    name: project.name,
    status: 'healthy' as const, // Simplificado
    recommendation: 'Continuar con el progreso actual'
  }));
}

function buildEnhancedTaskPrompt(context: CompleteTaskContext): { systemPrompt: string; userPrompt: string } {
  const { mainTask, fullHierarchy, activityData, progressAnalysis } = context;
  
  const userPrompt = `Analiza esta tarea con su contexto completo:

TAREA: "${mainTask.title}"
PROGRESO: ${progressAnalysis.overallProgress}% (${fullHierarchy.allTasks.filter(t => t.status === 'completed').length}/${fullHierarchy.allTasks.length} tareas)

JERARQUÍA:
- Subtareas: ${fullHierarchy.subtasks.length}
- Microtareas: ${fullHierarchy.microtasks.length}
- Actividad: ${activityData.daysSinceLastActivity} días sin logs

CONTEXTO:
- Sesiones: ${context.workSessions.recentSessions.length} recientes
- Riesgo: ${progressAnalysis.stagnationRisk}
- Bloqueos: ${context.dependencies.isBlocked ? 'SÍ' : 'NO'}

Proporciona análisis CONCISO del estado actual y próximos pasos específicos.`;

  return {
    systemPrompt: ENHANCED_SYSTEM_PROMPT,
    userPrompt
  };
}

function parseEnhancedResponse(rawResponse: string, context: CompleteTaskContext): EnhancedAISummary {
  // Intenta parsear JSON o extraer texto estructurado
  try {
    // Limpiar respuesta
    const cleaned = rawResponse.replace(/```json|```/g, '').trim();
    
    let parsed: any = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Si no es JSON, crear estructura básica
      parsed = {
        estado: rawResponse.substring(0, 100),
        pasos: 'Continuar con próximas subtareas'
      };
    }
    
    return {
      statusSummary: parsed.estado || parsed.status || 'Estado analizado por IA',
      nextSteps: parsed.pasos || parsed.steps || 'Próximos pasos sugeridos',
      riskLevel: parsed.riesgo === 'alto' ? 'high' : parsed.riesgo === 'medio' ? 'medium' : 'low',
      insights: parsed.insights || 'Análisis inteligente completado',
      contextQuality: 0 // Se asigna después
    };
  } catch (error) {
    console.error('Error parseando respuesta de IA:', error);
    return generateLocalEnhancedAnalysis(context);
  }
}

const ENHANCED_SYSTEM_PROMPT = `Eres un asistente IA experto en análisis de productividad y gestión de tareas.

Tu trabajo es analizar el contexto completo de una tarea (incluyendo jerarquía, actividad, sesiones de trabajo) y proporcionar:

1. ESTADO ACTUAL: Resumen conciso del progreso y situación
2. PRÓXIMOS PASOS: Acción específica más importante a realizar
3. NIVEL DE RIESGO: low/medium/high basado en inactividad y bloqueos

Responde en español, de forma concisa y accionable. Máximo 150 palabras total.`;