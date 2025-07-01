
import { TaskContext } from '@/utils/taskContext';

export interface TaskAISummary {
  statusSummary: string;
  nextSteps: string;
  alerts?: string;
  insights?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  intelligentActions?: any[];
}

const validateGeneratedJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null) {
      console.error('Generated content is not a JSON object.');
      return false;
    }
    return true;
  } catch (e) {
    console.error('Invalid JSON format:', e);
    return false;
  }
};

export const generateTaskStateAndSteps = async (
  context: TaskContext,
  makeLLMRequest: any
): Promise<TaskAISummary> => {
  
  const systemPrompt = `Eres un experto analista de productividad que genera resúmenes expandidos de tareas.

Tu respuesta debe ser EXCLUSIVAMENTE un JSON válido con esta estructura:
{
  "statusSummary": "Análisis comprensivo del estado actual (máximo 150 palabras)",
  "nextSteps": "Pasos concretos y específicos a seguir (máximo 100 palabras)",
  "alerts": "OPCIONAL: Alertas críticas solo si hay riesgos reales",
  "insights": "OPCIONAL: Análisis predictivo y recomendaciones estratégicas",
  "riskLevel": "low" | "medium" | "high",
  "intelligentActions": [
    {
      "type": "create_subtask" | "create_reminder" | "draft_email",
      "label": "Texto del botón (máximo 25 caracteres)",
      "priority": "high" | "medium" | "low",
      "confidence": 0.0-1.0,
      "suggestedData": {
        "title": "Título sugerido",
        "content": "Contenido detallado",
        "scheduledFor": "2024-12-25T10:00:00.000Z",
        "language": "es" | "en",
        "estimatedDuration": 30
      }
    }
  ]
}

CRITERIOS DE RIESGO:
- high: Tareas críticas atrasadas, dependencias bloqueadas, deadlines perdidos
- medium: Retrasos menores, recursos limitados, coordinación necesaria  
- low: Progreso normal, sin impedimentos significativos

DETECCIÓN DE ACCIONES:
- create_subtask: Si nextSteps sugiere "crear", "añadir", "desarrollar", "implementar"
- create_reminder: Si nextSteps sugiere "recordar", "seguimiento", "revisar", "controlar"
- draft_email: Si nextSteps sugiere "contactar", "enviar", "comunicar", "informar"

NO incluyas explicaciones adicionales, solo el JSON.`;

  const userPrompt = `TAREA PRINCIPAL:
Título: ${context.mainTask.title}
Descripción: ${context.mainTask.description || 'Sin descripción'}
Estado: ${context.mainTask.status}
Prioridad: ${context.mainTask.priority}
Fecha límite: ${context.mainTask.due_date || 'Sin fecha límite'}

PROGRESO GENERAL:
${context.completionStatus.overallProgress}% completado
Subtareas completadas: ${context.completionStatus.completedSubtasks}/${context.completionStatus.totalSubtasks}
Microtareas completadas: ${context.completionStatus.completedMicrotasks}/${context.completionStatus.totalMicrotasks}

ACTIVIDAD RECIENTE:
${context.recentLogs.slice(0, 5).map(log => 
  `- ${log.log_type}: ${log.title} (${new Date(log.created_at).toLocaleDateString()})`
).join('\n')}

DEPENDENCIAS:
Bloqueantes: ${context.dependencies.blocking.length}
Dependientes: ${context.dependencies.dependent.length}

CONTEXTO DEL PROYECTO:
${context.projectContext?.name || 'Sin proyecto'} - Estado: ${context.projectContext?.status || 'N/A'}

Genera un análisis expandido con alertas, insights y acciones inteligentes:`;

  try {
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'enhanced_task_analysis',
      temperature: 0.7
    });

    const parsed = JSON.parse(response.content);
    
    // Convertir scheduledFor strings a Date objects
    if (parsed.intelligentActions) {
      parsed.intelligentActions = parsed.intelligentActions.map((action: any) => ({
        ...action,
        suggestedData: {
          ...action.suggestedData,
          scheduledFor: action.suggestedData.scheduledFor ? 
            new Date(action.suggestedData.scheduledFor) : 
            undefined
        }
      }));
    }

    return {
      statusSummary: parsed.statusSummary,
      nextSteps: parsed.nextSteps,
      alerts: parsed.alerts,
      insights: parsed.insights,
      riskLevel: parsed.riskLevel || 'low',
      intelligentActions: parsed.intelligentActions || []
    };
  } catch (error) {
    console.error('Error in generateTaskStateAndSteps:', error);
    throw new Error('Failed to generate enhanced task analysis');
  }
};
