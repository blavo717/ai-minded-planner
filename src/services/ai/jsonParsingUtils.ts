
/**
 * JSON Parsing Utilities for AI Responses
 * Handles robust parsing of potentially malformed JSON from LLM responses
 */

/**
 * Limpia respuesta del LLM para extraer JSON válido - VERSIÓN ULTRA-ROBUSTA
 */
export function cleanJsonResponse(rawContent: string): string {
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
export function parseJsonSafely(rawContent: string): any {
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

export { validateGeneratedJSON };
