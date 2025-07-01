
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
  
  const systemPrompt = `Eres un experto analista de productividad. Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin explicaciones, sin comentarios.

FORMATO REQUERIDO (copia exactamente esta estructura):
{
  "statusSummary": "Análisis del estado actual en máximo 150 palabras",
  "nextSteps": "Pasos específicos a seguir en máximo 100 palabras",
  "alerts": "Alertas críticas solo si hay riesgos reales",
  "insights": "Análisis predictivo y recomendaciones estratégicas",
  "riskLevel": "low",
  "intelligentActions": [
    {
      "type": "create_subtask",
      "label": "Texto del botón máximo 25 chars",
      "priority": "high",
      "confidence": 0.8,
      "suggestedData": {
        "title": "Título sugerido",
        "content": "Contenido detallado",
        "scheduledFor": "2024-12-25T10:00:00.000Z",
        "language": "es",
        "estimatedDuration": 30
      }
    }
  ]
}

VALORES PERMITIDOS:
- riskLevel: "low", "medium", "high"
- type: "create_subtask", "create_reminder", "draft_email"
- priority: "high", "medium", "low"
- language: "es", "en"

RESPONDE SOLO CON EL JSON. NO AGREGUES TEXTO ANTES O DESPUÉS.`;

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

Genera análisis en JSON:`;

  try {
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'enhanced_task_analysis',
      temperature: 0.3 // Reducir temperatura para más consistencia
    });

    // Limpiar la respuesta de posible texto adicional
    let cleanResponse = response.content.trim();
    
    // Si la respuesta no empieza con {, buscar el primer {
    if (!cleanResponse.startsWith('{')) {
      const jsonStart = cleanResponse.indexOf('{');
      if (jsonStart !== -1) {
        cleanResponse = cleanResponse.substring(jsonStart);
      }
    }
    
    // Si la respuesta no termina con }, buscar el último }
    if (!cleanResponse.endsWith('}')) {
      const jsonEnd = cleanResponse.lastIndexOf('}');
      if (jsonEnd !== -1) {
        cleanResponse = cleanResponse.substring(0, jsonEnd + 1);
      }
    }

    console.log('🧹 Respuesta limpia:', cleanResponse);

    const parsed = JSON.parse(cleanResponse);
    
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
    console.error('Raw response:', response?.content);
    throw new Error('Failed to generate enhanced task analysis');
  }
};
