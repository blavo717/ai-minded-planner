import { ConversationSummary, ConversationMessage } from './conversationMemory';

export interface UserContext {
  id: string;
  name: string;
  role?: string;
  department?: string;
  timezone: string;
  tasksCount: number;
  projectsCount: number;
  completedTasksToday: number;
}

export interface TaskContext {
  hierarchy: any[];
  urgentToday: any[];
  overdue: any[];
  inProgress: any[];
  quickWins: any[];
  // ✅ CHECKPOINT 1.2.2: Datos específicos de tareas
  specificTasks: {
    urgent: Array<{id: string; title: string; dueDate?: string; estimatedDuration?: number}>;
    overdue: Array<{id: string; title: string; daysOverdue: number; estimatedDuration?: number}>;
    inProgress: Array<{id: string; title: string; estimatedDuration?: number}>;
    quickWins: Array<{id: string; title: string; estimatedDuration?: number}>;
  };
  timeBasedRecommendations?: any[];
}

export interface PromptContext {
  user: UserContext;
  tasks: TaskContext;
  conversation: ConversationSummary;
  recentActivity?: any;
  currentRecommendation?: any;
  behavioral?: any;
}

/**
 * ✅ CHECKPOINT 1.2.1: Constructor de Prompt Dinámico e Inteligente
 * Genera prompts adaptativos que evitan repetición y crean conversaciones naturales
 */
export class DynamicPromptBuilder {
  
  /**
   * Construir sistema de instrucciones dinámico basado en contexto completo
   */
  buildDynamicSystemPrompt(context: PromptContext, userMessage: string): string {
    const baseInstructions = this.getBaseInstructions(context.user);
    const conversationalInstructions = this.getConversationalInstructions(context.conversation);
    const contextualInstructions = this.getContextualInstructions(context, userMessage);
    const adaptiveInstructions = this.getAdaptiveInstructions(context.conversation);

    return `${baseInstructions}

${conversationalInstructions}

${contextualInstructions}

${adaptiveInstructions}

DATOS CONTEXTUALES ACTUALES:
${this.formatContextData(context)}

FECHA Y HORA ACTUAL: ${new Date().toLocaleString('es-ES', { timeZone: context.user.timezone })}

Responde de manera natural, conversacional y útil. Evita repetir frases o patrones ya utilizados en esta conversación.`;
  }

  /**
   * Instrucciones base de personalidad
   */
  private getBaseInstructions(user: UserContext): string {
    return `Eres un compañero de trabajo inteligente y motivador para ${user.name}${user.role ? `, ${user.role}` : ''}. 

Tu objetivo es ayudar de manera práctica y humana, como un verdadero compañero de equipo que conoce bien a la persona y su trabajo.

CARACTERÍSTICAS CLAVE:
• Conversacional y natural, nunca robótico
• Motivador pero no exagerado o falso
• Conoces el contexto completo de su trabajo
• Ofreces ayuda práctica y directa
• Usas su nombre de manera natural (no en cada frase)
• Adaptas tu tono según la situación`;
  }

  /**
   * Instrucciones conversacionales basadas en el historial
   */
  private getConversationalInstructions(conversation: ConversationSummary): string {
    let instructions = '';

    // Instrucciones según flujo de conversación
    switch (conversation.conversationFlow) {
      case 'greeting':
        if (!conversation.hasGreeted) {
          instructions += '• Este es el inicio de la conversación, saluda de manera natural\n';
        } else {
          instructions += '• Ya te has presentado, no repitas el saludo\n';
        }
        break;
      
      case 'ongoing':
        instructions += '• La conversación está en desarrollo, mantén el contexto\n';
        if (conversation.lastTaskMentioned) {
          instructions += `• Última tarea mencionada: "${conversation.lastTaskMentioned}"\n`;
        }
        break;
      
      case 'follow_up':
        instructions += '• Conversación avanzada, puedes profundizar o hacer seguimiento\n';
        break;
    }

    // Instrucciones según mood del usuario
    switch (conversation.userMood) {
      case 'enthusiastic':
        instructions += '• El usuario está entusiasmado, mantén esa energía positiva\n';
        break;
      case 'focused':
        instructions += '• El usuario está enfocado/urgente, sé directo y eficiente\n';
        break;
      case 'tired':
        instructions += '• El usuario parece cansado, sé comprensivo y ofrece opciones simples\n';
        break;
      case 'casual':
        instructions += '• Mantén un tono relajado y natural\n';
        break;
    }

    // Temas recientes
    if (conversation.recentTopics.length > 0) {
      instructions += `• Temas recientes en la conversación: ${conversation.recentTopics.join(', ')}\n`;
    }

    return `CONTEXTO CONVERSACIONAL:
${instructions}`;
  }

  /**
   * Instrucciones contextuales específicas para la consulta actual
   */
  private getContextualInstructions(context: PromptContext, userMessage: string): string {
    const queryType = this.analyzeQueryType(userMessage);
    let instructions = '';

    switch (queryType.type) {
      case 'task_request':
        instructions += `• Usuario pide recomendación de tarea - sé específico y práctico\n`;
        // ✅ CHECKPOINT 1.2.2: Instrucciones específicas con datos reales
        if (context.tasks.timeBasedRecommendations && context.tasks.timeBasedRecommendations.length > 0) {
          instructions += `• TAREAS ESPECÍFICAS RECOMENDADAS:\n`;
          context.tasks.timeBasedRecommendations.slice(0, 3).forEach((rec, index) => {
            instructions += `  ${index + 1}. "${rec.task.title}" (${rec.estimatedDuration} min) - ${rec.specificReason}\n`;
          });
          instructions += `• Menciona nombres de tareas específicas, no metodologías genéricas\n`;
        } else if (context.currentRecommendation) {
          instructions += `• Tienes una recomendación inteligente disponible\n`;
        }
        break;

      case 'status_check':
        instructions += `• Usuario quiere conocer estado - proporciona resumen claro\n`;
        break;

      case 'planning':
        instructions += `• Usuario está planificando - ofrece estructura y opciones\n`;
        break;

      case 'casual':
        instructions += `• Conversación casual - mantén tono amigable\n`;
        break;
    }

    // ✅ CHECKPOINT 1.2.2: Información específica con nombres de tareas
    if (context.tasks.specificTasks.overdue.length > 0) {
      instructions += `• TAREAS VENCIDAS ESPECÍFICAS:\n`;
      context.tasks.specificTasks.overdue.slice(0, 3).forEach(task => {
        instructions += `  - "${task.title}" (${task.daysOverdue} días de retraso)\n`;
      });
    }

    if (context.tasks.specificTasks.urgent.length > 0) {
      instructions += `• TAREAS URGENTES PARA HOY:\n`;
      context.tasks.specificTasks.urgent.slice(0, 3).forEach(task => {
        instructions += `  - "${task.title}" ${task.estimatedDuration ? `(~${task.estimatedDuration} min)` : ''}\n`;
      });
    }

    return `CONTEXTO ESPECÍFICO PARA ESTA CONSULTA:
${instructions}`;
  }

  /**
   * Instrucciones adaptativas para evitar repetición
   */
  private getAdaptiveInstructions(conversation: ConversationSummary): string {
    return `REGLAS ANTI-REPETICIÓN:
• NO uses las mismas frases motivadoras repetidamente
• NO repitas información ya mencionada en esta conversación
• NO uses emojis en exceso (máximo 2-3 por mensaje)
• NO fuerces entusiasmo si no es apropiado para el contexto
• SÍ varía tu vocabulario y estructura de respuestas
• SÍ adapta el tono según el flujo natural de la conversación`;
  }

  /**
   * Formatear datos de contexto de manera clara
   */
  private formatContextData(context: PromptContext): string {
    return `Usuario: ${context.user.name} (${context.user.tasksCount} tareas, ${context.user.projectsCount} proyectos)
Completadas hoy: ${context.user.completedTasksToday}
Tareas urgentes: ${context.tasks.urgentToday.length}
Tareas vencidas: ${context.tasks.overdue.length}
En progreso: ${context.tasks.inProgress.length}`;
  }

  /**
   * Analizar tipo de consulta del usuario
   */
  private analyzeQueryType(message: string): { type: string; urgency: string } {
    const msg = message.toLowerCase();

    if (msg.includes('qué hago') || msg.includes('tarea') || msg.includes('recomienda')) {
      return { type: 'task_request', urgency: 'high' };
    }

    if (msg.includes('cómo voy') || msg.includes('progreso') || msg.includes('estado')) {
      return { type: 'status_check', urgency: 'medium' };
    }

    if (msg.includes('planif') || msg.includes('organiz') || msg.includes('semana')) {
      return { type: 'planning', urgency: 'medium' };
    }

    return { type: 'casual', urgency: 'low' };
  }

  /**
   * Generar prompt de seguimiento para evitar respuestas genéricas
   */
  buildFollowUpContext(previousResponse: string, userMessage: string): string {
    return `CONTEXTO DE SEGUIMIENTO:
• Respuesta anterior del asistente: "${previousResponse.substring(0, 100)}..."
• Nueva consulta del usuario: "${userMessage}"
• Construye sobre la conversación anterior sin repetir información
• Si es una aclaración, sé más específico
• Si es un tema nuevo, haz la transición de manera natural`;
  }
}