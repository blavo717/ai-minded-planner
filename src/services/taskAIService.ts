
import { useLLMService } from '@/hooks/useLLMService';
import { TaskContext } from '@/utils/taskContext';

export interface TaskAISummary {
  statusSummary: string;
  nextSteps: string;
}

export async function generateTaskStateAndSteps(
  context: TaskContext,
  makeLLMRequest: ReturnType<typeof useLLMService>['makeLLMRequest']
): Promise<TaskAISummary> {
  const systemPrompt = "Eres un asistente experto en gestión de tareas que ayuda a equipos de trabajo a entender el estado actual y definir próximos pasos.";
  
  const userPrompt = `INFORMACIÓN DE LA TAREA:
Tarea Principal: ${context.mainTask.title}
${context.mainTask.description ? `Descripción: ${context.mainTask.description}` : ''}
Estado: ${context.mainTask.status}
Prioridad: ${context.mainTask.priority}
Progreso General: ${context.completionStatus.overallProgress}%

PROGRESO DETALLADO:
- Subtareas: ${context.completionStatus.completedSubtasks}/${context.completionStatus.totalSubtasks} completadas
- Microtareas: ${context.completionStatus.completedMicrotasks}/${context.completionStatus.totalMicrotasks} completadas

SUBTAREAS ACTUALES:
${context.subtasks.map(st => `• ${st.title} (${st.status})`).join('\n') || 'No hay subtareas'}

ACTIVIDAD RECIENTE:
${context.recentLogs.slice(0, 5).map(log => 
  `• ${log.description} (${new Date(log.created_at).toLocaleDateString()})`
).join('\n') || 'Sin actividad reciente'}

INSTRUCCIONES:
Responde en formato JSON válido con exactamente esta estructura:
{
  "statusSummary": "resumen del estado actual en máximo 24 palabras",
  "nextSteps": "próximas acciones específicas a realizar en máximo 20 palabras"
}

CRITERIOS:
1. RESUMEN ESTADO: Explica qué se ha hecho recientemente, qué se está esperando, o bloqueos actuales
2. PRÓXIMOS PASOS: Acciones concretas y específicas que la persona debe hacer para avanzar

EJEMPLOS DE RESPUESTA:
{
  "statusSummary": "Email enviado al proveedor hace 3 días, esperando cotización para continuar con el proyecto de moldes",
  "nextSteps": "Hacer seguimiento telefónico al proveedor y preparar documentación alternativa como backup"
}

{
  "statusSummary": "Documentos completados y enviados al equipo, pendiente de revisión y feedback de stakeholders principales",
  "nextSteps": "Agendar reunión de revisión y consolidar comentarios para segunda versión"
}

RESPONDE ÚNICAMENTE CON EL JSON VÁLIDO:`;

  try {
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'generateTaskStateAndSteps',
      temperature: 0.7,
      maxTokens: 200
    });

    const content = response.content.trim();
    const parsed = parseAIResponse(content);
    
    return {
      statusSummary: parsed.statusSummary || "Estado en proceso de análisis por IA",
      nextSteps: parsed.nextSteps || "Revisar detalles de la tarea y definir acciones"
    };

  } catch (error) {
    console.error('Error generating AI summary:', error);
    return generateIntelligentFallback(context);
  }
}

function parseAIResponse(content: string): Partial<TaskAISummary> {
  try {
    // Intentar parsear JSON directo
    return JSON.parse(content);
  } catch {
    try {
      // Buscar JSON en markdown
      const jsonMatch = content.match(/```json\n(.*?)\n```/s) || content.match(/```\n(.*?)\n```/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Buscar JSON en el texto
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        const jsonStr = content.slice(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      }
    } catch {
      // Extraer texto como fallback
      return extractTextualData(content);
    }
  }
  
  return {};
}

function extractTextualData(content: string): Partial<TaskAISummary> {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let statusSummary = "";
  let nextSteps = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('status') || line.includes('estado') || line.includes('resumen')) {
      statusSummary = lines[i + 1] || lines[i];
    }
    if (line.includes('next') || line.includes('paso') || line.includes('acción')) {
      nextSteps = lines[i + 1] || lines[i];
    }
  }
  
  return {
    statusSummary: statusSummary.replace(/[^\w\s.,]/g, '').trim().slice(0, 150),
    nextSteps: nextSteps.replace(/[^\w\s.,]/g, '').trim().slice(0, 120)
  };
}

function generateIntelligentFallback(context: TaskContext): TaskAISummary {
  const { completionStatus, mainTask, recentLogs } = context;
  
  let statusSummary = "";
  let nextSteps = "";
  
  if (completionStatus.overallProgress >= 90) {
    statusSummary = "Tarea casi completada, en fase final de revisión y cierre del proyecto";
    nextSteps = "Revisar detalles finales y confirmar completitud antes de marcar como terminado";
  } else if (completionStatus.overallProgress >= 50) {
    statusSummary = `Progreso significativo alcanzado (${completionStatus.overallProgress}%), desarrollo en curso según planificación`;
    nextSteps = "Continuar con subtareas pendientes manteniendo el ritmo actual de trabajo";
  } else if (recentLogs.length > 0) {
    const lastLog = recentLogs[0];
    statusSummary = `Actividad reciente: ${lastLog.description.slice(0, 40)}... - trabajo en progreso`;
    nextSteps = "Revisar siguiente subtarea en la lista y definir acciones específicas";
  } else if (mainTask.status === 'in_progress') {
    statusSummary = "Tarea iniciada, requiere atención continua para mantener progreso y cumplir objetivos";
    nextSteps = "Identificar primera subtarea prioritaria y establecer plan de trabajo detallado";
  } else {
    statusSummary = "Tarea preparada para iniciar, recursos disponibles y contexto establecido correctamente";
    nextSteps = "Comenzar con primera subtarea de mayor prioridad según plan establecido";
  }
  
  return { statusSummary, nextSteps };
}
