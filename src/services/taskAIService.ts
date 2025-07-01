
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
 * Limpia respuesta del LLM para extraer JSON válido - VERSIÓN ULTRA-ROBUSTA
 */
function cleanJsonResponse(rawContent: string): string {
  if (!rawContent) return '{}';
  
  let cleaned = rawContent.trim();
  
  // 🔥 PASO 1: Remover todo el ruido común
  cleaned = cleaned.replace(/```json/gi, ''); // Markdown
  cleaned = cleaned.replace(/```/g, ''); // Markdown
  cleaned = cleaned.replace(/^[^{]*/, ''); // Todo antes del primer {
  cleaned = cleaned.replace(/[^}]*$/, ''); // Todo después del último }
  
  // 🔥 PASO 2: Encontrar el JSON más probable
  const jsonMatches = cleaned.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
  if (jsonMatches && jsonMatches.length > 0) {
    cleaned = jsonMatches[0]; // Tomar el primer JSON completo encontrado
  }
  
  // 🔥 PASO 3: Limpiar caracteres problemáticos AGRESIVAMENTE
  cleaned = cleaned.replace(/\/\/.*$/gm, ''); // Comentarios de línea
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, ''); // Comentarios de bloque
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1'); // Comas antes de } o ]
  cleaned = cleaned.replace(/\n/g, ' '); // Saltos de línea
  cleaned = cleaned.replace(/\r/g, ''); // Retornos de carro
  cleaned = cleaned.replace(/\t/g, ' '); // Tabs
  cleaned = cleaned.replace(/\s+/g, ' '); // Espacios múltiples
  
  // 🔥 PASO 4: Reparar strings sin terminar
  const openQuotes = (cleaned.match(/"/g) || []).length;
  if (openQuotes % 2 !== 0) {
    // Número impar de comillas - reparar
    const lastQuoteIndex = cleaned.lastIndexOf('"');
    if (lastQuoteIndex > 0) {
      cleaned = cleaned.substring(0, lastQuoteIndex) + '"}';
    }
  }
  
  // 🔥 PASO 5: Asegurar estructura mínima válida
  if (!cleaned.startsWith('{')) cleaned = '{' + cleaned;
  if (!cleaned.endsWith('}')) cleaned = cleaned + '}';
  
  return cleaned.trim();
}

/**
 * Parser JSON ULTRA-ROBUSTO con 8 estrategias de fallback
 */
function parseJsonSafely(rawContent: string): any {
  console.log('🔍 Iniciando parsing con 8 estrategias, raw content preview:', rawContent.substring(0, 100));
  
  const strategies = [
    // Estrategia 1: Parsing directo
    () => JSON.parse(rawContent),
    
    // Estrategia 2: Limpieza básica
    () => JSON.parse(cleanJsonResponse(rawContent)),
    
    // Estrategia 3: Reparar strings sin terminar
    () => {
      let repaired = rawContent;
      // Encontrar strings sin terminar y cerrarlas
      const openQuotes = (repaired.match(/(?<!\\)"/g) || []).length;
      if (openQuotes % 2 !== 0) {
        repaired = repaired + '"';
      }
      return JSON.parse(cleanJsonResponse(repaired));
    },
    
    // Estrategia 4: Reparar comas problemáticas
    () => {
      const cleaned = cleanJsonResponse(rawContent)
        .replace(/,(\s*[}\]])/g, '$1') // Remover comas antes de } o ]
        .replace(/([}\]])(\s*)(["\w])/g, '$1,$2$3') // Añadir comas faltantes
        .replace(/(["\w])(\s*)([}\]])/g, '$1$2$3'); // Limpiar espacios
      return JSON.parse(cleaned);
    },
    
    // Estrategia 5: Construcción de JSON por campos
    () => {
      const statusMatch = rawContent.match(/"statusSummary"\s*:\s*"([^"]+)"/);
      const stepsMatch = rawContent.match(/"nextSteps"\s*:\s*"([^"]+)"/);
      const riskMatch = rawContent.match(/"riskLevel"\s*:\s*"(low|medium|high)"/);
      
      return {
        statusSummary: statusMatch?.[1] || 'Estado no disponible',
        nextSteps: stepsMatch?.[1] || 'Pasos no disponibles',
        riskLevel: riskMatch?.[1] || 'low'
      };
    },
    
    // Estrategia 6: Regex extraction mejorado
    () => {
      const match = rawContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
      if (match) {
        return JSON.parse(cleanJsonResponse(match[0]));
      }
      throw new Error('No JSON found');
    },
    
    // Estrategia 7: Reconstrucción línea por línea
    () => {
      const lines = rawContent.split('\n').map(line => line.trim()).filter(line => line);
      const jsonObj: any = {};
      
      for (const line of lines) {
        const match = line.match(/"([^"]+)"\s*:\s*"([^"]*)"/) || line.match(/"([^"]+)"\s*:\s*([^,}]+)/);
        if (match) {
          jsonObj[match[1]] = match[2].replace(/[",]/g, '').trim();
        }
      }
      
      if (Object.keys(jsonObj).length > 0) {
        return jsonObj;
      }
      throw new Error('No valid fields found');
    },
    
    // Estrategia 8: Fallback manual ultra-seguro
    () => {
      console.log('🚨 Usando fallback manual ultra-seguro');
      return {
        statusSummary: rawContent.substring(0, 80).replace(/[^a-zA-Z0-9\s]/g, ' ').trim() || 'Análisis en proceso',
        nextSteps: 'Revisar manualmente la respuesta del sistema',
        riskLevel: 'medium'
      };
    }
  ];
  
  let lastError: Error | null = null;
  
  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = strategies[i]();
      console.log(`✅ JSON parsing exitoso con estrategia ${i + 1}:`, result);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Estrategia ${i + 1} falló:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.error('🚨 Las 8 estrategias fallaron. Contenido raw:', rawContent);
  
  // Esto nunca debería ejecutarse por la estrategia 8, pero por seguridad
  return {
    statusSummary: 'Error en análisis IA - revisar manualmente',
    nextSteps: 'Contactar soporte técnico',
    riskLevel: 'medium'
  };
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

  let response: any; // ✅ Declarar fuera del try

  try {
    response = await makeLLMRequest({
      systemPrompt,
      userPrompt,
      functionName: 'enhanced_task_analysis',
      temperature: 0.0, // ✅ Ultra bajo para consistencia
      max_tokens: 500, // ✅ Límite para respuestas cortas
      stop: ["\n\n", "```"], // ✅ Detener en patrones problemáticos
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
