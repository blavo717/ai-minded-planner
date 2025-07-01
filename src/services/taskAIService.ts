import { useLLMService } from '@/hooks/useLLMService';
import { TaskContext } from '@/utils/taskContext';
import { IntelligentAction } from '@/types/intelligent-actions';

export interface TaskAISummary {
  statusSummary: string;
  nextSteps: string;
  alerts?: string;
  insights?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  intelligentActions?: IntelligentAction[];
}

// Helper functions for enhanced analysis
function getDaysSinceCreated(context: TaskContext): number {
  const createdDate = new Date(context.mainTask.created_at);
  const now = new Date();
  return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysSinceLastActivity(context: TaskContext): number {
  if (context.recentLogs.length === 0) {
    return getDaysSinceCreated(context);
  }
  
  const lastActivityDate = new Date(context.recentLogs[0].created_at);
  const now = new Date();
  return Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return `hace ${diffInHours}h`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `hace ${diffInDays}d`;
  }
}

export async function generateTaskStateAndSteps(
  context: TaskContext,
  makeLLMRequest: ReturnType<typeof useLLMService>['makeLLMRequest']
): Promise<TaskAISummary> {
  console.log('🤖 Iniciando generación IA con prompt expandido y acciones inteligentes:', {
    taskTitle: context.mainTask.title,
    taskStatus: context.mainTask.status,
    hasLogs: context.recentLogs.length,
    subtasksCount: context.subtasks.length,
    progress: context.completionStatus.overallProgress
  });

  const daysSinceCreated = getDaysSinceCreated(context);
  const daysSinceLastActivity = getDaysSinceLastActivity(context);

  const systemPrompt = `Eres un asistente experto en gestión de proyectos que analiza contexto completo y genera insights predictivos CON ACCIONES INTELIGENTES.

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
{
  "statusSummary": "Contexto completo: qué se ha hecho, estado actual, progreso con timeframe (máximo 35 palabras)",
  "nextSteps": "3 acciones específicas numeradas con responsables y deadlines si es posible (máximo 30 palabras)",
  "alerts": "Alertas importantes: bloqueos activos, retrasos detectados, dependencias críticas, riesgos de deadline (máximo 25 palabras, solo si hay problemas reales)",
  "insights": "Análisis predictivo: velocidad de progreso, tiempo estimado restante, comparación con promedio, recomendaciones (máximo 25 palabras)",
  "riskLevel": "low/medium/high basado en progreso, actividad reciente y proximidad a deadlines",
  "intelligentActions": [
    {
      "type": "create_subtask" | "create_reminder" | "draft_email",
      "label": "Texto botón (máx 20 chars)",
      "priority": "high" | "medium" | "low",
      "confidence": 0.0-1.0,
      "suggestedData": {
        "title": "Título sugerido",
        "content": "Descripción/contexto",
        "scheduledFor": "2024-12-XX 10:00:00",
        "estimatedDuration": 30
      },
      "basedOnPatterns": ["pattern1"]
    }
  ]
}

CRITERIOS PARA ACCIONES INTELIGENTES:
- create_subtask: Si nextSteps contiene "crear", "añadir", "desarrollar", "implementar", "hacer"
- create_reminder: Si nextSteps contiene "recordar", "seguimiento", "revisar", "controlar", "verificar"
- draft_email: Si nextSteps contiene "contactar", "enviar", "comunicar", "informar", "consultar"

GENERAR MÁXIMO 2 ACCIONES MÁS RELEVANTES.`;

  const userPrompt = `INFORMACIÓN DE LA TAREA:
- Tarea: ${context.mainTask.title}
- Estado: ${context.mainTask.status}
- Progreso: ${context.completionStatus.overallProgress}%
- Días desde creación: ${daysSinceCreated}
- Días sin actividad: ${daysSinceLastActivity}
- Subtareas completadas: ${context.completionStatus.completedSubtasks}/${context.completionStatus.totalSubtasks}
- Última actividad: ${context.recentLogs[0]?.description || 'Sin actividad reciente'}

SUBTAREAS PENDIENTES:
${context.subtasks.filter(s => s.status !== 'completed').map(s => `• ${s.title} (${s.status})`).join('\n') || 'No hay subtareas pendientes'}

LOGS RECIENTES:
${context.recentLogs.slice(0, 3).map(log => 
  `• ${log.description} (${getRelativeTime(log.created_at)})`
).join('\n') || 'Sin actividad reciente'}

Genera análisis completo CON ACCIONES INTELIGENTES en JSON:`;

  try {
    console.log('🚀 Enviando request con prompt expandido + acciones inteligentes');
    
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'enhanced_task_analysis_with_actions',
      temperature: 0.7
    });

    console.log('📥 Respuesta completa con acciones:', response);

    if (!response.content) {
      console.error('❌ Response sin contenido:', response);
      throw new Error('No content in LLM response');
    }

    console.log('📝 Contenido IA recibido:', response.content);
    
    const parsed = parseEnhancedAIResponse(response.content);
    console.log('✅ JSON expandido con acciones parseado:', parsed);
    
    return {
      statusSummary: parsed.statusSummary || "Estado analizado por IA",
      nextSteps: parsed.nextSteps || "Definir próximas acciones",
      alerts: parsed.alerts || undefined,
      insights: parsed.insights || undefined,
      riskLevel: parsed.riskLevel || 'low',
      intelligentActions: parsed.intelligentActions || []
    };

  } catch (error) {
    console.error('❌ Error en generateTaskStateAndSteps:', error);
    console.log('🔄 Usando fallback inteligente expandido');
    return generateEnhancedIntelligentFallback(context);
  }
}

function parseEnhancedAIResponse(content: string): Partial<TaskAISummary> {
  console.log('🔍 Parseando respuesta expandida:', content);
  
  try {
    // Intentar JSON directo primero
    const result = JSON.parse(content.trim());
    console.log('✅ JSON expandido parseado exitosamente:', result);
    return result;
  } catch (error) {
    console.log('⚠️ JSON directo falló, intentando extracción...');
    
    // Buscar JSON en el contenido
    const jsonMatch = content.match(/\{[^}]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON extraído exitosamente:', result);
        return result;
      } catch (e) {
        console.log('❌ Extracción JSON falló');
      }
    }
    
    // Fallback expandido
    return {
      statusSummary: content.slice(0, 100) || "Respuesta IA recibida",
      nextSteps: "Continuar con siguiente tarea",
      insights: "Análisis en progreso",
      riskLevel: 'medium'
    };
  }
}

function generateEnhancedIntelligentFallback(context: TaskContext): TaskAISummary {
  const { completionStatus, mainTask, recentLogs } = context;
  const daysSinceLastActivity = getDaysSinceLastActivity(context);
  const daysSinceCreated = getDaysSinceCreated(context);
  
  let statusSummary = "";
  let nextSteps = "";
  let alerts = "";
  let insights = "";
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let intelligentActions: IntelligentAction[] = [];
  
  // Generar resumen inteligente
  if (completionStatus.overallProgress >= 90) {
    statusSummary = `Tarea casi completada (${completionStatus.overallProgress}%), en fase final tras ${daysSinceCreated} días de trabajo`;
    nextSteps = "1. Revisar detalles finales 2. Confirmar completitud 3. Marcar como terminado";
    insights = "Finalización prevista en 1-2 días, progreso excelente";
  } else if (completionStatus.overallProgress >= 50) {
    statusSummary = `Progreso significativo alcanzado (${completionStatus.overallProgress}%), desarrollo activo desde hace ${daysSinceCreated} días`;
    nextSteps = "1. Continuar subtareas pendientes 2. Mantener ritmo actual 3. Revisar próximos hitos";
    insights = "Ritmo de progreso saludable, estimado 5-7 días para completion";
  } else {
    statusSummary = `Tarea en desarrollo inicial (${completionStatus.overallProgress}%), ${daysSinceCreated} días desde inicio`;
    nextSteps = "1. Priorizar primera subtarea 2. Establecer plan detallado 3. Definir deadlines";
    insights = "Requiere aceleración para mantener timeline esperado";
    riskLevel = 'medium';
  }
  
  // Generar alertas si hay problemas
  if (daysSinceLastActivity > 3) {
    alerts = `Sin actividad desde hace ${daysSinceLastActivity} días - requiere atención urgente`;
    riskLevel = 'high';
  } else if (completionStatus.overallProgress < 20 && daysSinceCreated > 7) {
    alerts = "Progreso lento detectado - revisar bloqueos potenciales";
    riskLevel = 'medium';
  }
  
  // Generar acciones inteligentes de fallback
  if (completionStatus.overallProgress < 50) {
    intelligentActions.push({
      id: `fallback-subtask-${mainTask.id}`,
      type: 'create_subtask',
      label: 'Crear subtarea',
      priority: 'medium',
      confidence: 0.7,
      suggestedData: {
        title: `Avanzar en ${mainTask.title}`,
        content: 'Subtarea para hacer progreso',
        estimatedDuration: 60
      },
      basedOnPatterns: ['low_progress']
    });
  }
  
  if (daysSinceLastActivity > 2) {
    intelligentActions.push({
      id: `fallback-reminder-${mainTask.id}`,
      type: 'create_reminder',
      label: 'Recordatorio',
      priority: 'high',
      confidence: 0.8,
      suggestedData: {
        title: `Revisar ${mainTask.title}`,
        content: 'Hacer seguimiento de la tarea',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      basedOnPatterns: ['inactivity']
    });
  }
  
  return { 
    statusSummary, 
    nextSteps, 
    alerts: alerts || undefined,
    insights,
    riskLevel,
    intelligentActions
  };
}

// Función de testing para browser console
declare global {
  interface Window {
    testEnhancedTaskAI: (taskId: string) => Promise<any>;
  }
}

if (typeof window !== 'undefined') {
  window.testEnhancedTaskAI = async (taskId: string) => {
    console.log('🧪 Test con prompt expandido...');
    
    try {
      const { getTaskContext } = await import('@/utils/taskContext');
      const { useLLMService } = await import('@/hooks/useLLMService');
      
      const context = await getTaskContext(taskId);
      console.log('📊 Contexto obtenido:', context);
      
      const { makeLLMRequest } = useLLMService();
      const response = await generateTaskStateAndSteps(context, makeLLMRequest);
      
      console.log('🎯 Enhanced AI result:', response);
      return response;
    } catch (error) {
      console.error('❌ Enhanced test error:', error);
      return error;
    }
  };
}
