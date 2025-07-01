
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

/**
 * Limpia respuesta del LLM para extraer JSON válido
 */
function cleanJsonResponse(rawContent: string): string {
  if (!rawContent) return '{}';
  
  let cleaned = rawContent.trim();
  
  // Estrategia 1: Encontrar primer { y último }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  // Estrategia 2: Remover texto común antes/después del JSON
  cleaned = cleaned.replace(/^.*?(?=\{)/s, ''); // Remover todo antes del primer {
  cleaned = cleaned.replace(/\}.*$/s, '}'); // Remover todo después del último }
  
  // Estrategia 3: Limpiar caracteres problemáticos
  cleaned = cleaned.replace(/```json/g, ''); // Remover markdown
  cleaned = cleaned.replace(/```/g, ''); // Remover markdown
  cleaned = cleaned.replace(/\/\/.*$/gm, ''); // Remover comentarios de línea
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, ''); // Remover comentarios de bloque
  
  return cleaned.trim();
}

/**
 * Parser JSON robusto con múltiples estrategias de fallback
 */
function parseJsonSafely(rawContent: string): any {
  const strategies = [
    // Estrategia 1: Parsing directo
    () => JSON.parse(rawContent),
    
    // Estrategia 2: Limpieza básica
    () => JSON.parse(cleanJsonResponse(rawContent)),
    
    // Estrategia 3: Limpieza agresiva
    () => {
      const cleaned = cleanJsonResponse(rawContent)
        .replace(/,\s*}/g, '}') // Remover comas antes de }
        .replace(/,\s*]/g, ']') // Remover comas antes de ]
        .replace(/\n\s*/g, ' ') // Normalizar espacios
        .replace(/\s+/g, ' '); // Normalizar espacios múltiples
      return JSON.parse(cleaned);
    },
    
    // Estrategia 4: Regex extraction
    () => {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(cleanJsonResponse(match[0]));
      }
      throw new Error('No JSON found');
    }
  ];
  
  let lastError: Error | null = null;
  
  for (const strategy of strategies) {
    try {
      const result = strategy();
      console.log('✅ JSON parsing successful with strategy', strategies.indexOf(strategy) + 1);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Strategy ${strategies.indexOf(strategy) + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.error('🚨 All JSON parsing strategies failed. Raw content:', rawContent.substring(0, 200) + '...');
  throw lastError || new Error('JSON parsing failed with all strategies');
}

/**
 * Valida y completa la respuesta parseada con valores por defecto
 */
function validateAndCompleteResponse(parsed: any): TaskAISummary {
  const validRiskLevels = ['low', 'medium', 'high'];
  
  return {
    statusSummary: typeof parsed.statusSummary === 'string' ? parsed.statusSummary : 'Análisis no disponible temporalmente',
    nextSteps: typeof parsed.nextSteps === 'string' ? parsed.nextSteps : 'Revisar tarea manualmente',
    alerts: parsed.alerts || undefined,
    insights: parsed.insights || undefined,
    riskLevel: validRiskLevels.includes(parsed.riskLevel) ? parsed.riskLevel : 'low',
    intelligentActions: Array.isArray(parsed.intelligentActions) ? parsed.intelligentActions : []
  };
}

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

⚠️ INSTRUCCIONES CRÍTICAS DE FORMATO:
- Responde ÚNICAMENTE con JSON válido
- NO añadas texto explicativo antes o después del JSON
- NO uses comentarios dentro del JSON
- NO uses markdown (\`\`\`json)
- NO incluyas caracteres de escape problemáticos
- Usa comillas dobles para todas las strings
- NO pongas comas después del último elemento

✅ EJEMPLO DE RESPUESTA CORRECTA:
{"statusSummary":"Tarea en progreso con 7 subtareas","nextSteps":"Completar envíos pendientes","riskLevel":"low","intelligentActions":[]}

🚫 NO HAGAS ESTO:
Aquí está el análisis: {"statusSummary":"..."}
Cualquier texto antes o después del JSON causará errores.

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

  let response: any; // ✅ Declarar fuera del try

  try {
    response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'enhanced_task_analysis',
      temperature: 0.1 // ✅ Ultra bajo para consistencia
    });

    const content = response?.content || response?.message?.content || '';
    
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    console.log('🔍 Raw LLM response preview:', content.substring(0, 150) + '...');
    
    // ✅ Usar parser robusto
    const parsed = parseJsonSafely(content);
    
    // ✅ Validar y completar respuesta
    const validated = validateAndCompleteResponse(parsed);
    
    // Convertir scheduledFor strings a Date objects
    if (validated.intelligentActions) {
      validated.intelligentActions = validated.intelligentActions.map((action: any) => ({
        ...action,
        suggestedData: {
          ...action.suggestedData,
          scheduledFor: action.suggestedData.scheduledFor ? 
            new Date(action.suggestedData.scheduledFor) : 
            undefined
        }
      }));
    }
    
    console.log('✅ Successfully generated TaskAISummary:', {
      hasStatusSummary: !!validated.statusSummary,
      hasNextSteps: !!validated.nextSteps,
      riskLevel: validated.riskLevel,
      actionsCount: validated.intelligentActions?.length || 0
    });

    return validated;

  } catch (error) {
    console.error('🚨 Error in generateTaskStateAndSteps:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      taskId: context.mainTask.id,
      taskTitle: context.mainTask.title,
      responsePreview: response?.content?.substring(0, 200) || 'No response content',
      fullError: error
    });

    // ✅ Fallback seguro
    return {
      statusSummary: `Error al analizar la tarea "${context.mainTask.title}". Revisar manualmente.`,
      nextSteps: 'Verificar el estado de la tarea y contactar soporte si persiste el problema.',
      riskLevel: 'medium' as const,
      intelligentActions: []
    };
  }
};
