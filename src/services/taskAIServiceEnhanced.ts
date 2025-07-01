
import { EnhancedTaskContext, getEnhancedTaskContext } from '@/utils/taskContextEnhanced';
import { generateContextualSystemPrompt, selectOptimalMethodology, IA_PLANNER_IDENTITY } from '@/config/iaPlanner';
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
    const context = await getEnhancedTaskContext(taskId);
    
    // Generate contextual system prompt
    const systemPrompt = generateContextualSystemPrompt(context, 'task_analysis');
    
    // Select optimal methodology
    const methodology = selectOptimalMethodology(context);
    
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
      methodology: methodology.split(':')[0],
      riskLevel: analysis.riskLevel
    });
    
    return {
      ...analysis,
      methodology: methodology.split(':')[0],
    };

  } catch (error) {
    console.error('🚨 Error en análisis específico del IA Planner:', error);
    return generateSpecificFallback(taskId);
  }
};

function buildSimplifiedAnalysisPrompt(context: EnhancedTaskContext): string {
  const { mainTask, subtasks, daysSinceLastActivity, completionStatus } = context;
  
  return `ANÁLISIS ESPECÍFICO para: "${mainTask.title}"

DATOS CLAVE:
- Estado: ${mainTask.status} | Progreso: ${completionStatus.overallProgress}%
- Días sin actividad: ${daysSinceLastActivity}
- Subtareas: ${completionStatus.completedSubtasks}/${completionStatus.totalSubtasks}

SUBTAREAS PENDIENTES:
${subtasks.filter(s => s.status === 'pending').slice(0, 3).map((s, i) => `${i+1}. ${s.title}`).join('\n')}

Proporciona:
1. ESTADO ESPECÍFICO: Una línea sobre la situación real actual
2. PRÓXIMOS PASOS: 2-3 acciones concretas y específicas para avanzar HOY
3. RIESGO: Nivel y razón específica

Sé ESPECÍFICO con nombres de subtareas reales. NO uses frases genéricas.`;
}

function parseSimplifiedResponse(content: string, context: EnhancedTaskContext): EnhancedTaskAISummary {
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
    methodology: 'IA Planner', // Add methodology here
    insights: undefined // Eliminado - no aporta valor
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

function generateSmartStatusSummary(context: EnhancedTaskContext): string {
  const { mainTask, completionStatus, daysSinceLastActivity } = context;
  const progress = completionStatus.overallProgress;
  
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
  
  if (daysSinceLastActivity > 5) {
    status += `. ⚠️ ${daysSinceLastActivity} días sin actividad`;
  }
  
  return status;
}

function generateSmartNextSteps(context: EnhancedTaskContext): string {
  const { subtasks, dependencies } = context;
  
  // Priority 1: Unblock dependencies
  if (dependencies.blocking.length > 0) {
    const blockedTask = dependencies.blocking[0];
    return `URGENTE: Resolver "${blockedTask.title}" que bloquea el progreso`;
  }
  
  // Priority 2: Continue with pending subtasks
  const pendingSubtasks = subtasks.filter(s => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    return `Continuar con "${pendingSubtasks[0].title}" como próximo paso específico`;
  }
  
  return `Revisar estado y definir próximos pasos específicos`;
}

function generateSpecificActions(context: EnhancedTaskContext): string[] {
  const { subtasks, dependencies } = context;
  const actions: string[] = [];
  
  // Add dependency-based actions
  if (dependencies.blocking.length > 0) {
    actions.push(`Resolver "${dependencies.blocking[0].title}"`);
  }
  
  // Add subtask-specific actions
  const pendingSubtasks = subtasks.filter(s => s.status === 'pending');
  if (pendingSubtasks.length > 0) {
    actions.push(`Trabajar en "${pendingSubtasks[0].title}"`);
  }
  
  if (pendingSubtasks.length > 1) {
    actions.push(`Planificar "${pendingSubtasks[1].title}"`);
  }
  
  return actions.slice(0, 2);
}

function generateRiskAssessment(context: EnhancedTaskContext): string {
  const { daysSinceLastActivity, mainTask } = context;
  
  if (daysSinceLastActivity > 7) {
    return `Riesgo ALTO: ${daysSinceLastActivity} días sin actividad`;
  }
  
  if (mainTask.due_date && new Date(mainTask.due_date) < new Date()) {
    return `Riesgo ALTO: Tarea vencida`;
  }
  
  return `Riesgo bajo: Progreso normal`;
}

function determineRiskLevel(context: EnhancedTaskContext): 'low' | 'medium' | 'high' {
  const { daysSinceLastActivity, mainTask } = context;
  
  if (daysSinceLastActivity > 7) return 'high';
  if (mainTask.due_date && new Date(mainTask.due_date) < new Date()) return 'high';
  if (daysSinceLastActivity > 3) return 'medium';
  
  return 'low';
}

async function generateSpecificFallback(taskId: string): Promise<EnhancedTaskAISummary> {
  console.log('🔄 Generando fallback específico para:', taskId);
  
  try {
    const context = await getEnhancedTaskContext(taskId);
    
    return {
      statusSummary: generateSmartStatusSummary(context),
      nextSteps: generateSmartNextSteps(context),
      riskLevel: determineRiskLevel(context),
      methodology: 'IA Planner (Fallback)',
      specificActions: generateSpecificActions(context),
      riskAssessment: generateRiskAssessment(context)
    };
  } catch (error) {
    console.error('❌ Error en fallback específico:', error);
    
    return {
      statusSummary: 'Error en análisis - verificar conectividad',
      nextSteps: 'Verificar configuración del IA Planner',
      riskLevel: 'high',
      methodology: 'IA Planner (Error)',
      specificActions: ['Verificar acceso', 'Contactar soporte'],
      riskAssessment: 'Sistema no disponible'
    };
  }
}
