
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
  console.log('🤖 Iniciando generación IA con estructura correcta:', {
    taskTitle: context.mainTask.title,
    taskStatus: context.mainTask.status,
    hasLogs: context.recentLogs.length,
    subtasksCount: context.subtasks.length,
    progress: context.completionStatus.overallProgress
  });

  const systemPrompt = `Eres un asistente experto en gestión de tareas que genera resúmenes contextuales.

Responde ÚNICAMENTE en formato JSON válido con esta estructura exacta:
{"statusSummary":"descripción del estado actual en máximo 24 palabras","nextSteps":"próximas acciones específicas en máximo 20 palabras"}

EJEMPLOS:
{"statusSummary":"Proyecto moldes CS1-CS6 en progreso, 7 subtareas completadas (29%), pendiente asignación forwarder","nextSteps":"Asignar forwarder para transporte y completar envío plantillas pendientes"}

{"statusSummary":"Documentos completados y enviados al equipo, esperando feedback de stakeholders principales","nextSteps":"Agendar reunión de revisión y consolidar comentarios para segunda versión"}`;

  const userPrompt = `INFORMACIÓN DE LA TAREA:
Tarea Principal: ${context.mainTask.title}
${context.mainTask.description ? `Descripción: ${context.mainTask.description}` : ''}
Estado: ${context.mainTask.status}
Prioridad: ${context.mainTask.priority || 'No definida'}
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

Genera resumen del estado actual y próximos pasos específicos en JSON:`;

  try {
    console.log('🚀 Enviando request con estructura de useAIAssistantSimple');
    
    // ✅ USAR EXACTAMENTE LA MISMA ESTRUCTURA QUE FUNCIONA - SIN maxTokens
    const response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'task_summary_generation',
      temperature: 0.7
    });

    console.log('📥 Respuesta completa:', response);

    if (!response.content) {
      console.error('❌ Response sin contenido:', response);
      throw new Error('No content in LLM response');
    }

    console.log('📝 Contenido IA recibido:', response.content);
    
    const parsed = parseAIResponse(response.content);
    console.log('✅ JSON parseado:', parsed);
    
    return {
      statusSummary: parsed.statusSummary || "Estado analizado por IA",
      nextSteps: parsed.nextSteps || "Definir próximas acciones"
    };

  } catch (error) {
    console.error('❌ Error en generateTaskStateAndSteps:', error);
    console.log('🔄 Usando fallback inteligente');
    return generateIntelligentFallback(context);
  }
}

function parseAIResponse(content: string): Partial<TaskAISummary> {
  console.log('🔍 Parseando respuesta:', content);
  
  try {
    // Intentar JSON directo primero
    const result = JSON.parse(content.trim());
    console.log('✅ JSON parseado exitosamente:', result);
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
    
    // Fallback simple
    return {
      statusSummary: content.slice(0, 100) || "Respuesta IA recibida",
      nextSteps: "Continuar con siguiente tarea"
    };
  }
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

// Función de testing para browser console
declare global {
  interface Window {
    testTaskAIWithCorrectStructure: (taskId: string) => Promise<any>;
  }
}

if (typeof window !== 'undefined') {
  window.testTaskAIWithCorrectStructure = async (taskId: string) => {
    console.log('🧪 Test con estructura correcta...');
    
    try {
      const { getTaskContext } = await import('@/utils/taskContext');
      const { useLLMService } = await import('@/hooks/useLLLService');
      
      const context = await getTaskContext(taskId);
      console.log('📊 Contexto obtenido:', context);
      
      // Usar exactamente la misma estructura que useAIAssistantSimple
      const systemPrompt = "Eres un asistente que responde solo en JSON: {\"test\":\"respuesta exitosa\"}";
      const userPrompt = "Responde con JSON de test confirmando que la estructura funciona";
      
      const { makeLLMRequest } = useLLMService();
      const response = await makeLLMRequest({
        systemPrompt,
        userPrompt,
        functionName: 'test_task_ai',
        temperature: 0.7
      });
      
      console.log('🎯 Test result:', response);
      return response;
    } catch (error) {
      console.error('❌ Test error:', error);
      return error;
    }
  };
}
