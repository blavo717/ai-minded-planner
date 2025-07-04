import { getCompleteTaskContext, CompleteTaskContext } from '@/utils/enhancedTaskContext';
import { IA_PLANNER_IDENTITY } from '@/config/iaPlanner';
import { TaskAISummary } from '@/services/taskAIService';

export interface EnhancedTaskAISummary extends TaskAISummary {
  methodology: string;
  specificActions: string[];
  riskAssessment: string;
}

export const generateEnhancedTaskAnalysis = async (
  taskId: string,
  makeLLMRequest: any
): Promise<EnhancedTaskAISummary> => {
  
  console.log('🎯 Iniciando análisis ESPECÍFICO con IA Planner para:', taskId);
  
  try {
    // Get enhanced context with hierarchical analysis
    const context = await getCompleteTaskContext(taskId);
    
    // Generate task-specific system prompt
    const systemPrompt = generateTaskSpecificSystemPrompt(context);
    
    // Select optimal methodology for task
    const methodology = selectTaskMethodology(context);
    
    // Create SIMPLIFIED user prompt focused on essentials
    const userPrompt = buildSimplifiedAnalysisPrompt(context);
    
    console.log('📤 Enviando análisis simplificado al IA Planner...');
    
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'ia_planner_analysis',
      temperature: 0.2, // Mantener creatividad controlada
      maxTokens: 800, // Aumentado para evitar truncamiento
    });

    const analysis = parseSimplifiedResponse(response?.content || '', context);
    
    console.log('✅ Análisis específico del IA Planner completado:', {
      hasStatusSummary: !!analysis.statusSummary,
      hasNextSteps: !!analysis.nextSteps,
      actionsCount: analysis.specificActions.length,
      methodology: methodology,
      riskLevel: analysis.riskLevel
    });
    
    return {
      ...analysis,
      methodology: methodology,
    };

  } catch (error) {
    console.error('🚨 Error en análisis específico del IA Planner:', error);
    return generateBasicFallback(taskId);
  }
};

function buildSimplifiedAnalysisPrompt(context: CompleteTaskContext): string {
  const { mainTask, fullHierarchy, progressAnalysis, activityData } = context;
  
  return `ANÁLISIS ESPECÍFICO para: "${mainTask.title}"

DATOS CLAVE:
- Estado: ${mainTask.status} | Progreso: ${progressAnalysis.overallProgress}%
- Días sin actividad: ${activityData.daysSinceLastActivity}
- Subtareas: ${fullHierarchy.subtasks.length} | Microtareas: ${fullHierarchy.microtasks.length}
- Progreso subtareas: ${progressAnalysis.subtaskProgress.length} analizadas
- Riesgo estancamiento: ${progressAnalysis.stagnationRisk}

Proporciona análisis ESPECÍFICO del estado y próximos pasos MÁS IMPORTANTES para avanzar.`;
}

function parseSimplifiedResponse(content: string, context: CompleteTaskContext): EnhancedTaskAISummary {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Extract status summary
  const statusSummary = extractSection(lines, ['estado', 'situación', 'actual']) || 
    generateSmartStatusSummary(context);
  
  // Extract next steps
  const nextSteps = extractSection(lines, ['próximo', 'pasos', 'acciones', 'hoy']) || 
    generateSmartNextSteps(context);
  
  // Extract specific actions
  const specificActions = extractActionsList(content) || generateSpecificActions(context);
  
  // Generate risk assessment
  const riskAssessment = extractSection(lines, ['riesgo', 'nivel']) || 
    generateRiskAssessment(context);
  
  // Determine risk level
  const riskLevel = determineRiskLevel(context);
  
  return {
    statusSummary,
    nextSteps,
    riskLevel,
    alerts: riskLevel === 'high' ? riskAssessment : undefined,
    specificActions,
    riskAssessment,
    methodology: 'IA Planner'
  };
}

function extractSection(lines: string[], keywords: string[]): string | null {
  for (const line of lines) {
    for (const keyword of keywords) {
      if (line.toLowerCase().includes(keyword)) {
        return line.replace(/^[^:]*:?\s*/, '').trim();
      }
    }
  }
  return null;
}

function extractActionsList(content: string): string[] {
  const actions: string[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.match(/^\s*[-*]\s+/) || line.match(/^\s*\d+\.\s+/)) {
      const action = line.replace(/^\s*[-*\d\.]\s*/, '').trim();
      if (action.length > 10) {
        actions.push(action);
      }
    }
  }
  
  return actions.slice(0, 3); // Limit to 3 actions
}

function generateSmartStatusSummary(context: CompleteTaskContext): string {
  const { mainTask, progressAnalysis, activityData } = context;
  const progress = progressAnalysis.overallProgress;
  
  let status = `"${mainTask.title}" `;
  
  if (progress >= 90) {
    status += `casi completada (${progress}%)`;
  } else if (progress >= 60) {
    status += `en buen avance (${progress}%)`;
  } else if (progress >= 30) {
    status += `en desarrollo (${progress}%)`;
  } else {
    status += `en etapa inicial (${progress}%)`;
  }
  
  if (activityData.daysSinceLastActivity > 5) {
    status += `. ⚠️ ${activityData.daysSinceLastActivity} días sin actividad`;
  }
  
  return status;
}

function generateSmartNextSteps(context: CompleteTaskContext): string {
  const { fullHierarchy, dependencies } = context;
  
  // Priority 1: Unblock dependencies
  if (dependencies.blocking.length > 0) {
    const blockedTask = dependencies.blocking[0];
    return `URGENTE: Resolver "${blockedTask.title}" que bloquea el progreso`;
  }
  
  // Priority 2: Continue with pending subtasks
  const pendingSubtasks = fullHierarchy.subtasks.filter(s => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    return `Continuar con "${pendingSubtasks[0].title}" como próximo paso específico`;
  }
  
  return `Revisar estado y definir próximos pasos específicos`;
}

function generateSpecificActions(context: CompleteTaskContext): string[] {
  const { fullHierarchy, dependencies } = context;
  const actions: string[] = [];
  
  // Add dependency-based actions
  if (dependencies.blocking.length > 0) {
    actions.push(`Resolver "${dependencies.blocking[0].title}"`);
  }
  
  // Add subtask-specific actions
  const pendingSubtasks = fullHierarchy.subtasks.filter(s => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    actions.push(`Trabajar en "${pendingSubtasks[0].title}"`);
  }
  
  if (pendingSubtasks.length > 1) {
    actions.push(`Planificar "${pendingSubtasks[1].title}"`);
  }
  
  return actions.slice(0, 2);
}

function generateRiskAssessment(context: CompleteTaskContext): string {
  const { activityData, mainTask } = context;
  
  if (activityData.daysSinceLastActivity > 7) {
    return `Riesgo ALTO: ${activityData.daysSinceLastActivity} días sin actividad`;
  }
  
  if (mainTask.due_date && new Date(mainTask.due_date) < new Date()) {
    return `Riesgo ALTO: Tarea vencida`;
  }
  
  return `Riesgo bajo: Progreso normal`;
}

function determineRiskLevel(context: CompleteTaskContext): 'low' | 'medium' | 'high' {
  const { activityData, mainTask } = context;
  
  if (activityData.daysSinceLastActivity > 7) return 'high';
  if (mainTask.due_date && new Date(mainTask.due_date) < new Date()) return 'high';
  if (activityData.daysSinceLastActivity > 3) return 'medium';
  
  return 'low';
}

function generateSpecificFallback(context: CompleteTaskContext): EnhancedTaskAISummary {
  const { mainTask, progressAnalysis, activityData } = context;
  
  return {
    statusSummary: `"${mainTask.title}" en progreso (${progressAnalysis.overallProgress}%)`,
    nextSteps: 'Revisar subtareas pendientes y continuar con el trabajo',
    riskLevel: activityData.daysSinceLastActivity > 7 ? 'high' : 'medium',
    methodology: 'task_analysis',
    specificActions: [
      'Revisar estado de subtareas',
      'Identificar próxima acción específica',
      'Actualizar progreso'
    ],
    riskAssessment: `Riesgo de estancamiento: ${progressAnalysis.stagnationRisk}`
  };
}

function generateBasicFallback(taskId: string): EnhancedTaskAISummary {
  return {
    statusSummary: 'Error al analizar la tarea específica',
    nextSteps: 'Revisar manualmente el estado de la tarea',
    riskLevel: 'medium',
    methodology: 'fallback',
    specificActions: [
      'Revisar estado actual',
      'Identificar próximos pasos',
      'Continuar con el trabajo'
    ],
    riskAssessment: 'Análisis detallado no disponible'
  };
}

function generateTaskSpecificSystemPrompt(context: CompleteTaskContext): string {
  const { mainTask, progressAnalysis, activityData } = context;
  
  return `${IA_PLANNER_IDENTITY.systemPrompt}

CONTEXTO ESPECÍFICO DE LA TAREA:
- Tarea: "${mainTask.title}"
- Progreso: ${progressAnalysis.overallProgress}%
- Última actividad: hace ${activityData.daysSinceLastActivity} días
- Riesgo de estancamiento: ${progressAnalysis.stagnationRisk}
- Jerarquía: ${context.fullHierarchy.allTasks.length} tareas totales

ENFOQUE ESPECÍFICO:
- Analiza el estado actual de esta tarea específica
- Identifica bloqueos concretos en la jerarquía
- Proporciona próximos pasos específicos y accionables
- Considera dependencias y contexto de proyecto`;
}

function selectTaskMethodology(context: CompleteTaskContext): string {
  const { progressAnalysis, activityData } = context;
  
  if (activityData.daysSinceLastActivity > 7) {
    return 'crisis_management';
  }
  
  if (progressAnalysis.stagnationRisk === 'high') {
    return 'dependency_analysis';
  }
  
  if (progressAnalysis.overallProgress < 30) {
    return 'gtd';
  }
  
  return 'task_analysis';
}