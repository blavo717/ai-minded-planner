import { Profile } from '@/types/profile';

interface Activity {
  task_title?: string;
  timestamp?: string;
  type?: string;
}

interface ConversationContext {
  isFirstMessage: boolean;
  hasRecentActivity: boolean;
  lastActivity?: Activity;
  completedTasksToday: number;
  taskCount: number;
  projectCount: number;
}

export class ConversationPatterns {
  
  /**
   * ✅ CHECKPOINT 1.2: Genera saludos inteligentes contextuales
   */
  static getIntelligentGreeting(
    userProfile: Profile | null, 
    lastActivity: Activity | null,
    context: ConversationContext
  ): string {
    const userName = userProfile?.full_name || "Compañero";
    
    // Saludo para primera vez
    if (context.isFirstMessage) {
      return `¡Hola ${userName}! ¿En qué te puedo ayudar?`;
    }
    
    // Saludo con actividad reciente
    if (context.hasRecentActivity && lastActivity?.task_title) {
      return `¡Hola de nuevo ${userName}! ¿Cómo vas con "${lastActivity.task_title}"?`;
    }
    
    // Saludo con progreso del día
    if (context.completedTasksToday > 0) {
      return `¡Hola ${userName}! Veo que ya completaste ${context.completedTasksToday} tareas hoy. ¡Excelente trabajo! 🎯`;
    }
    
    // Saludo general de reactivación
    return `¡Hola de nuevo ${userName}! ¿Cómo va todo?`;
  }

  /**
   * ✅ CHECKPOINT 1.2: Respuestas motivadoras predefinidas
   */
  static getMotivationalResponse(context: string): string {
    const motivationalPhrases = [
      "¡Yess! Te veo con ganas de ser productivo! 💪",
      "¡Perfecto! Tienes buen timing para esta tarea 🎯", 
      "¡Excelente elección! Esta tarea te va a dar mucha satisfacción ✨",
      "¡Genial que preguntes! 📊",
      "¡A darle caña! 🔥",
      "¡Me encanta tu actitud! Vamos con todo 🚀",
      "¡Esa es la energía que necesitamos! 💯",
      "¡Perfecto timing! Es el momento ideal 🎪"
    ];
    
    // Seleccionar frase basada en contexto (simple hash para consistencia)
    const index = Math.abs(context.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % motivationalPhrases.length;
    return motivationalPhrases[index];
  }

  /**
   * ✅ CHECKPOINT 1.2: Emojis contextuales
   */
  static getContextualEmoji(sentiment: string): string {
    const emojiMap: Record<string, string> = {
      'productive': '💪',
      'success': '✅',
      'energy': '🔥',
      'target': '🎯',
      'celebration': '🎉',
      'thinking': '🤔',
      'time': '⏰',
      'progress': '📊',
      'rocket': '🚀',
      'star': '⭐',
      'perfect': '✨',
      'thumbsup': '👍'
    };
    
    return emojiMap[sentiment] || '😊';
  }

  /**
   * ✅ CHECKPOINT 1.2: Detecta el tipo de consulta para respuesta apropiada
   */
  static detectQueryType(userMessage: string): {
    type: 'greeting' | 'task_request' | 'status_check' | 'general';
    motivationLevel: 'high' | 'medium' | 'low';
  } {
    const message = userMessage.toLowerCase();
    
    // Detectar saludos
    if (message.includes('hola') || message.includes('hello') || message.includes('buenas')) {
      return { type: 'greeting', motivationLevel: 'medium' };
    }
    
    // Detectar solicitud de tareas
    if (message.includes('qué hago') || message.includes('tarea') || message.includes('trabajar') || 
        message.includes('hueco') || message.includes('tiempo libre')) {
      return { type: 'task_request', motivationLevel: 'high' };
    }
    
    // Detectar consulta de estado
    if (message.includes('cómo voy') || message.includes('progreso') || message.includes('proyectos') ||
        message.includes('estado') || message.includes('resumen')) {
      return { type: 'status_check', motivationLevel: 'medium' };
    }
    
    return { type: 'general', motivationLevel: 'low' };
  }

  /**
   * ✅ CHECKPOINT 1.2: Genera respuesta contextual completa
   */
  static generateContextualResponse(
    userProfile: Profile | null,
    queryType: { type: string; motivationLevel: string },
    context: ConversationContext,
    taskRecommendation?: any
  ): string {
    const userName = userProfile?.full_name || "Compañero";
    
    switch (queryType.type) {
      case 'greeting':
        return this.getIntelligentGreeting(userProfile, context.lastActivity, context);
        
      case 'task_request':
        if (queryType.motivationLevel === 'high') {
          return `${this.getMotivationalResponse('productive')}

${taskRecommendation ? 
  `La tarea más recomendada ahora es "${taskRecommendation.title}".` : 
  'Déjame revisar qué tarea te conviene más ahora.'
}

¿Quieres trabajar en esta tarea o prefieres que te recuerde en unos minutos?`;
        }
        break;
        
      case 'status_check':
        return `¡Genial que preguntes ${userName}! ${this.getContextualEmoji('progress')}

Hoy has completado ${context.completedTasksToday} tareas. Tienes ${context.taskCount} tareas activas en ${context.projectCount} proyectos.

¿Quieres que analicemos algún proyecto en específico?`;
        
      default:
        return `Perfecto ${userName}, ¿en qué te puedo ayudar hoy? ${this.getContextualEmoji('thinking')}`;
    }
    
    return `¡Hola ${userName}! ¿En qué te puedo ayudar?`;
  }

  /**
   * ✅ CHECKPOINT 1.2: Frases de confirmación y éxito
   */
  static getSuccessPhrase(): string {
    const successPhrases = [
      "¡Perfecto! ✅",
      "¡Excelente! 🎯", 
      "¡Genial! 🚀",
      "¡Me encanta! ⭐",
      "¡Súper! 💯",
      "¡Fantástico! ✨"
    ];
    
    return successPhrases[Math.floor(Math.random() * successPhrases.length)];
  }

  /**
   * ✅ CHECKPOINT 1.2: Frases de ánimo para cuando se salta una tarea
   */
  static getEncouragementPhrase(): string {
    const encouragementPhrases = [
      "¡No pasa nada! Sigamos con otra cosa 😊",
      "¡Perfecto! Vamos con la siguiente 👍",
      "¡Claro! A veces el timing no es el correcto 🎯",
      "¡Entendido! Busquemos algo que te apetezca más 🔥",
      "¡Vale! Hay muchas opciones interesantes 🚀"
    ];
    
    return encouragementPhrases[Math.floor(Math.random() * encouragementPhrases.length)];
  }
}