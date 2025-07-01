
import { EnhancedTaskContext, getEnhancedTaskContext } from '@/utils/taskContextEnhanced';
import { generateContextualSystemPrompt, selectOptimalMethodology, IA_PLANNER_IDENTITY } from '@/config/iaPlanner';
import { TaskAISummary } from '@/services/taskAIService';

export interface EnhancedTaskAISummary extends TaskAISummary {
  methodology: string;
  activityInsights: string;
  progressPrediction: string;
  specificActions: string[];
  riskAssessment: string;
}

export const generateEnhancedTaskAnalysis = async (
  taskId: string,
  makeLLMRequest: any
): Promise<EnhancedTaskAISummary> => {
  
  console.log('🎯 Iniciando análisis MEJORADO con IA Planner para:', taskId);
  
  try {
    // Get enhanced context with hierarchical analysis
    const context = await getEnhancedTaskContext(taskId);
    
    // Generate contextual system prompt
    const systemPrompt = generateContextualSystemPrompt(context, 'task_analysis');
    
    // Select optimal methodology
    const methodology = selectOptimalMethodology(context);
    
    // Create detailed user prompt with ALL the context
    const userPrompt = buildDetailedAnalysisPrompt(context);
    
    console.log('📤 Enviando análisis completo al IA Planner...');
    
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'ia_planner_analysis',
      temperature: 0.3, // Lower for more consistent analysis
      maxTokens: 600,
    });

    const analysis = parseEnhancedResponse(response?.content || '', context);
    
    console.log('✅ Análisis del IA Planner completado:', {
      hasStatusSummary: !!analysis.statusSummary,
      hasNextSteps: !!analysis.nextSteps,
      actionsCount: analysis.specificActions.length,
      methodology: methodology.split(':')[0],
      riskLevel: analysis.riskLevel
    });
    
    return {
      ...analysis,
      methodology: methodology.split(':')[0], // Just the name
      intelligentActions: [] // Will be populated by intelligent actions hook
    };

  } catch (error) {
    console.error('🚨 Error en análisis del IA Planner:', error);
    
    // Enhanced fallback with IA Planner identity
    return generateEnhancedFallback(taskId);
  }
};

function buildDetailedAnalysisPrompt(context: EnhancedTaskContext): string {
  const { mainTask, subtasks, microtasks, hierarchicalLogs, activitySummary, progressAnalysis } = context;
  
  let prompt = `ANÁLISIS COMPLETO REQUERIDO para: "${mainTask.title}"

DATOS ACTUALES:
- Estado: ${mainTask.status}
- Prioridad: ${mainTask.priority}
- Progreso: ${context.completionStatus.overallProgress}%
- Días desde creación: ${Math.floor((new Date().getTime() - new Date(mainTask.created_at).getTime()) / (1000 * 60 * 60 * 24))}
- Días sin actividad: ${context.daysSinceLastActivity}

JERARQUÍA COMPLETA:`;

  // Add subtask details
  if (subtasks.length > 0) {
    prompt += `\n\nSUBTAREAS (${subtasks.length}):\n`;
    subtasks.forEach((subtask, index) => {
      prompt += `${index + 1}. "${subtask.title}" - ${subtask.status} (${subtask.priority})\n`;
    });
  }

  // Add microtask details
  if (microtasks.length > 0) {
    prompt += `\n\nMICROTAREAS (${microtasks.length}):\n`;
    microtasks.slice(0, 5).forEach((micro, index) => {
      prompt += `${index + 1}. "${micro.title}" - ${micro.status}\n`;
    });
    if (microtasks.length > 5) {
      prompt += `... y ${microtasks.length - 5} más\n`;
    }
  }

  // Add activity analysis
  prompt += `\n\nACTIVIDAD RECIENTE:
- Total logs en jerarquía: ${activitySummary.totalLogs}
- Logs últimos 7 días: ${activitySummary.recentLogs}
- Velocidad de progreso: ${progressAnalysis.velocityScore}% por día
- Riesgo de estancamiento: ${progressAnalysis.stagnationRisk}`;

  // Add dependencies
  if (context.dependencies.blocking.length > 0) {
    prompt += `\n\nDEPENDENCIAS BLOQUEANTES (${context.dependencies.blocking.length}):`;
    context.dependencies.blocking.forEach(dep => {
      prompt += `\n- "${dep.title}" (${dep.status})`;
    });
  }

  prompt += `\n\nPROporciona un análisis ESPECÍFICO y DETALLADO que incluya:
1. Estado actual REAL basado en la actividad de toda la jerarquía
2. Próximos pasos CONCRETOS y ESPECÍFICOS (no genéricos)
3. Identificación de bloqueos o riesgos específicos
4. Recomendaciones priorizadas basadas en metodologías de productividad

Sé ESPECÍFICO con nombres de subtareas y acciones concretas. No uses frases genéricas.`;

  return prompt;
}

function parseEnhancedResponse(content: string, context: EnhancedTaskContext): EnhancedTaskAISummary {
  const lines = content.split('\n').filter(line => line.trim());
  
  // Extract different sections from the response
  const statusSummary = extractSection(lines, ['estado', 'situación', 'status']) || 
    generateSmartStatusSummary(context);
  
  const nextSteps = extractSection(lines, ['próximo', 'pasos', 'acciones', 'next']) || 
    generateSmartNextSteps(context);
  
  const riskAssessment = extractSection(lines, ['riesgo', 'problema', 'alerta']) || 
    generateRiskAssessment(context);
  
  // Extract specific actions
  const specificActions = extractActionsList(content) || generateSpecificActions(context);
  
  // Generate activity insights
  const activityInsights = generateActivityInsights(context);
  
  // Generate progress prediction
  const progressPrediction = generateProgressPrediction(context);
  
  // Determine risk level
  const riskLevel = determineRiskLevel(context);
  
  return {
    statusSummary,
    nextSteps,
    riskLevel,
    alerts: riskLevel === 'high' ? riskAssessment : undefined,
    insights: activityInsights,
    methodology: 'IA Planner',
    activityInsights,
    progressPrediction,
    specificActions,
    riskAssessment
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
  
  return actions.slice(0, 4); // Limit to 4 actions
}

function generateSmartStatusSummary(context: EnhancedTaskContext): string {
  const { mainTask, completionStatus, daysSinceLastActivity, progressAnalysis } = context;
  const progress = completionStatus.overallProgress;
  
  let status = `"${mainTask.title}" `;
  
  if (progress >= 90) {
    status += `casi completada (${progress}%)`;
  } else if (progress >= 60) {
    status += `en buen avance (${progress}%)`;
  } else if (progress >= 30) {
    status += `en desarrollo activo (${progress}%)`;
  } else if (progress >= 10) {
    status += `en etapa inicial (${progress}%)`;
  } else {
    status += `apenas iniciada (${progress}%)`;
  }
  
  if (daysSinceLastActivity > 5) {
    status += `. ⚠️ ${daysSinceLastActivity} días sin actividad`;
  } else if (progressAnalysis.velocityScore > 0) {
    status += `. Velocidad: ${progressAnalysis.velocityScore}% por día`;
  }
  
  return status;
}

function generateSmartNextSteps(context: EnhancedTaskContext): string {
  const { subtasks, microtasks, dependencies, progressAnalysis } = context;
  
  // Priority 1: Unblock dependencies
  if (dependencies.blocking.length > 0) {
    const blockedTask = dependencies.blocking[0];
    return `URGENTE: Resolver dependencia "${blockedTask.title}" que está bloqueando el progreso`;
  }
  
  // Priority 2: Continue with in-progress subtasks
  const inProgressSubtasks = subtasks.filter(s => s.status === 'in_progress');
  if (inProgressSubtasks.length > 0) {
    return `Continuar con "${inProgressSubtasks[0].title}" que está en progreso`;
  }
  
  // Priority 3: Start the next pending subtask
  const pendingSubtasks = subtasks.filter(s => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    return `Iniciar próxima subtarea: "${pendingSubtasks[0].title}"`;
  }
  
  // Priority 4: Work on microtasks
  const pendingMicrotasks = microtasks.filter(m => m.status === 'pending');
  if (pendingMicrotasks.length > 0) {
    return `Completar microtarea específica: "${pendingMicrotasks[0].title}"`;
  }
  
  // Fallback
  return `Revisar estado de la tarea y definir próximos pasos específicos`;
}

function generateRiskAssessment(context: EnhancedTaskContext): string {
  const { daysSinceLastActivity, progressAnalysis, mainTask } = context;
  
  if (daysSinceLastActivity > 7) {
    return `Riesgo ALTO: ${daysSinceLastActivity} días sin actividad. Requiere atención inmediata.`;
  }
  
  if (progressAnalysis.stagnationRisk === 'high') {
    return `Riesgo de estancamiento detectado. Velocidad actual: ${progressAnalysis.velocityScore}% por día.`;
  }
  
  if (mainTask.due_date && new Date(mainTask.due_date) < new Date()) {
    return `Tarea VENCIDA. Requiere reprogramación o escalación.`;
  }
  
  return `Riesgo bajo. Progreso dentro de parámetros normales.`;
}

function generateActivityInsights(context: EnhancedTaskContext): string {
  const { activitySummary, progressAnalysis, hierarchicalLogs } = context;
  
  let insights = `Actividad: ${activitySummary.totalLogs} logs en jerarquía completa. `;
  
  if (activitySummary.recentLogs > 0) {
    insights += `${activitySummary.recentLogs} acciones en últimos 7 días. `;
  }
  
  if (progressAnalysis.velocityScore > 0) {
    insights += `Velocidad: ${progressAnalysis.velocityScore}% progreso diario. `;
  }
  
  if (progressAnalysis.predictedCompletion) {
    const daysToComplete = Math.ceil(
      (progressAnalysis.predictedCompletion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    insights += `Estimación: ${daysToComplete} días para completar.`;
  }
  
  return insights;
}

function generateProgressPrediction(context: EnhancedTaskContext): string {
  const { progressAnalysis, completionStatus } = context;
  
  if (!progressAnalysis.predictedCompletion) {
    return 'Predicción no disponible - necesita más actividad para calcular tendencia.';
  }
  
  const daysToComplete = Math.ceil(
    (progressAnalysis.predictedCompletion.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let prediction = `Completitud estimada: ${daysToComplete} días `;
  
  if (progressAnalysis.velocityScore > 5) {
    prediction += '(ritmo acelerado)';
  } else if (progressAnalysis.velocityScore > 2) {
    prediction += '(ritmo normal)';
  } else {
    prediction += '(ritmo lento)';
  }
  
  return prediction;
}

function generateSpecificActions(context: EnhancedTaskContext): string[] {
  const { subtasks, microtasks, dependencies, mainTask } = context;
  const actions: string[] = [];
  
  // Add dependency-based actions
  if (dependencies.blocking.length > 0) {
    actions.push(`Contactar responsable de "${dependencies.blocking[0].title}" para desbloquearlo`);
  }
  
  // Add subtask-specific actions
  const inProgressSubtasks = subtasks.filter(s => s.status === 'in_progress');
  if (inProgressSubtasks.length > 0) {
    actions.push(`Continuar desarrollo de "${inProgressSubtasks[0].title}"`);
  }
  
  const pendingSubtasks = subtasks.filter(s => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    actions.push(`Planificar inicio de "${pendingSubtasks[0].title}"`);
  }
  
  // Add microtask actions
  const pendingMicrotasks = microtasks.filter(m => m.status === 'pending');
  if (pendingMicrotasks.length > 0) {
    actions.push(`Ejecutar "${pendingMicrotasks[0].title}" como próximo paso`);
  }
  
  return actions.slice(0, 3); // Limit to 3 specific actions
}

function determineRiskLevel(context: EnhancedTaskContext): 'low' | 'medium' | 'high' {
  const { daysSinceLastActivity, progressAnalysis, mainTask } = context;
  
  // High risk conditions
  if (daysSinceLastActivity > 7) return 'high';
  if (mainTask.due_date && new Date(mainTask.due_date) < new Date()) return 'high';
  if (progressAnalysis.stagnationRisk === 'high') return 'high';
  
  // Medium risk conditions
  if (daysSinceLastActivity > 3) return 'medium';
  if (progressAnalysis.stagnationRisk === 'medium') return 'medium';
  if (progressAnalysis.velocityScore < 1) return 'medium';
  
  return 'low';
}

async function generateEnhancedFallback(taskId: string): Promise<EnhancedTaskAISummary> {
  console.log('🔄 Generando fallback mejorado con IA Planner para:', taskId);
  
  // Try to get basic context at least
  try {
    const context = await getEnhancedTaskContext(taskId);
    
    return {
      statusSummary: generateSmartStatusSummary(context),
      nextSteps: generateSmartNextSteps(context),
      riskLevel: determineRiskLevel(context),
      methodology: 'IA Planner (Fallback)',
      activityInsights: generateActivityInsights(context),
      progressPrediction: generateProgressPrediction(context),
      specificActions: generateSpecificActions(context),
      riskAssessment: generateRiskAssessment(context),
      insights: `Análisis generado por IA Planner en modo fallback. ${generateActivityInsights(context)}`
    };
  } catch (error) {
    console.error('❌ Error en fallback mejorado:', error);
    
    return {
      statusSummary: 'Error en análisis - no se pudo obtener contexto de la tarea',
      nextSteps: 'Verificar conectividad y permisos de la tarea',
      riskLevel: 'high',
      methodology: 'IA Planner (Error)',
      activityInsights: 'No disponible',
      progressPrediction: 'No disponible',
      specificActions: ['Verificar acceso a la tarea', 'Contactar soporte técnico'],
      riskAssessment: 'Sistema no disponible - requiere atención técnica'
    };
  }
}
