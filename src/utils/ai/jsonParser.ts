
/**
 * Parser JSON robusto para respuestas de IA Planner
 */
export function parseIntelligentActionsJSON(content: string, taskId: string): any[] {
  if (!content?.trim()) {
    console.warn('🔄 Contenido vacío para parsing');
    return [];
  }

  console.log('📝 IA Planner parsing content:', content.substring(0, 200) + '...');

  // Estrategias de limpieza progresivas
  const cleaningStrategies = [
    // Estrategia 1: Limpieza básica
    (text: string) => text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .replace(/,(\s*[}\]])/g, '$1')
      .trim(),
    
    // Estrategia 2: Extraer solo el array JSON
    (text: string) => {
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      return arrayMatch ? arrayMatch[0] : text;
    },
    
    // Estrategia 3: Completar JSON truncado
    (text: string) => {
      if (text.endsWith(',')) text = text.slice(0, -1);
      if (!text.endsWith(']')) text += ']';
      if (!text.startsWith('[')) text = '[' + text;
      return text;
    },
    
    // Estrategia 4: Reparar objetos incompletos
    (text: string) => {
      // Si termina abruptamente en una propiedad, cerrar el objeto
      if (text.match(/:\s*"[^"]*$/)) {
        text += '"';
      }
      if (text.match(/[^}\]]\s*$/)) {
        text += '}]';  
      }
      return text;
    }
  ];

  // Intentar cada estrategia secuencialmente
  for (let i = 0; i < cleaningStrategies.length; i++) {
    try {
      let cleaned = content;
      
      // Aplicar todas las estrategias hasta la actual
      for (let j = 0; j <= i; j++) {
        cleaned = cleaningStrategies[j](cleaned);
      }
      
      console.log(`🔧 Estrategia ${i + 1} - Cleaned:`, cleaned.substring(0, 100) + '...');
      
      const parsed = JSON.parse(cleaned);
      const actions = Array.isArray(parsed) ? parsed : [parsed];
      
      console.log(`✅ Parsing exitoso con estrategia ${i + 1}:`, actions.length, 'acciones');
      return actions;
      
    } catch (error) {
      console.log(`❌ Estrategia ${i + 1} falló:`, error.message);
      continue;
    }
  }

  // Si todas las estrategias fallan, extraer información básica
  console.warn('🔄 Todas las estrategias fallaron, extrayendo información básica');
  return extractBasicActions(content, taskId);
}

function extractBasicActions(content: string, taskId: string): any[] {
  const actions: any[] = [];
  
  // Buscar patrones de acciones en texto libre
  const actionPatterns = [
    /crear?\s+(?:subtarea|tarea)?\s*[:\-]?\s*([^.\n]+)/gi,
    /planificar?\s+([^.\n]+)/gi,
    /revisar?\s+([^.\n]+)/gi,
    /contactar?\s+([^.\n]+)/gi,
    /completar?\s+([^.\n]+)/gi
  ];

  let actionIndex = 0;
  
  actionPatterns.forEach((pattern, patternIndex) => {
    let match;
    while ((match = pattern.exec(content)) !== null && actionIndex < 2) {
      const actionText = match[1]?.trim();
      if (actionText && actionText.length > 5) {
        actions.push({
          id: `extracted-action-${taskId}-${actionIndex}`,
          type: 'create_subtask',
          label: actionText.length > 50 ? actionText.substring(0, 50) + '...' : actionText,
          priority: actionIndex === 0 ? 'high' : 'medium',
          confidence: 0.6,
          suggestedData: {
            title: actionText,
            content: `Acción extraída del análisis del IA Planner: ${actionText}`
          },
          basedOnPatterns: [`text_extraction_pattern_${patternIndex}`],
          reasoning: 'Acción identificada por análisis de texto'
        });
        actionIndex++;
      }
    }
  });

  return actions.slice(0, 2);
}
