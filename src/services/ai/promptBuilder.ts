
import { TaskContext } from '@/utils/taskContext';

/**
 * AI Prompt Builder
 * Constructs optimized prompts for consistent AI responses
 */

export function buildTaskAnalysisPrompt(context: TaskContext): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `Eres un asistente que ÚNICAMENTE responde en JSON válido sin excepción.

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

🚨 REGLAS CRÍTICAS - NO VIOLAR NUNCA:
1. Respuesta SOLO JSON, sin texto antes ni después
2. Usar ÚNICAMENTE comillas dobles (")
3. NO usar comillas simples (')
4. NO dejar strings sin terminar
5. NO poner comas después del último elemento
6. NO usar comentarios (//)
7. NO usar markdown (\`\`\`json)
8. NO añadir explicaciones
9. Cerrar todas las comillas que abras
10. Temperatura fijada en 0.0 para máxima consistencia

VALORES PERMITIDOS:
- riskLevel: "low", "medium", "high"
- type: "create_subtask", "create_reminder", "draft_email"
- priority: "high", "medium", "low"
- language: "es", "en"

✅ EJEMPLO DE RESPUESTA CORRECTA:
{"statusSummary":"Tarea en progreso con 7 subtareas","nextSteps":"Completar envíos pendientes","riskLevel":"low","intelligentActions":[]}

🚫 NUNCA HAGAS ESTO:
- Texto antes: "Aquí está el análisis: {"statusSummary":...
- Markdown: \`\`\`json {"statusSummary":...
- Comillas simples: {'statusSummary':'...
- Strings sin cerrar: {"statusSummary":"texto sin cerrar
- Comas finales: {"statusSummary":"texto", "nextSteps":"pasos",}
- Comentarios: {"statusSummary":"texto", // comentario

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

  return { systemPrompt, userPrompt };
}
