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
  // ✅ CHECKPOINT 1.4: Contexto personal completo
  lastActivity?: any;
  workPatterns?: string[];
  personalizedReferences?: string[];
  // ✅ FASE 1: Información personal del usuario
  personalInfo?: any;
  preferences?: {
    likes: string[];
    dislikes: string[];
  };
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
  behaviorInsights?: any[];
  productivityProfile?: any;
  performanceMetrics?: any;
  // ✅ CHECKPOINT 2.2: Contexto rico adicional
  projects?: any;
  sessions?: any;
  preferences?: any;
  assignments?: any;
  // ✅ CHECKPOINT 2.3: Análisis contextual avanzado
  advancedInsights?: any[];
  advancedProductivity?: any;
}

/**
 * ✅ CHECKPOINT 1.2.1: Constructor de Prompt Dinámico e Inteligente
 * Genera prompts adaptativos que evitan repetición y crean conversaciones naturales
 */
export class DynamicPromptBuilder {
  
  /**
   * ✅ IMPLEMENTACIÓN: PROMPT RICO EN CONTEXTO PARA GEMINI FLASH
   * Construir prompt con TODA la información específica disponible
   */
  buildDynamicSystemPrompt(context: PromptContext, userMessage: string): string {
    return `ASISTENTE INTELIGENTE PARA ${context.user.name}
=====================================================

PERSONALIDAD Y ESTILO:
• Eres un compañero de trabajo inteligente, proactivo y motivador
• Tienes acceso completo a toda la información del usuario
• Tomas decisiones basadas en datos reales, no en generalizaciones
• Eres específico con nombres de tareas y proyectos reales
• Gestionas proactivamente el trabajo del usuario
• Respondes de forma natural y conversacional

CONTEXTO COMPLETO DEL USUARIO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INFORMACIÓN PERSONAL:
- Nombre: ${context.user.name}
- Rol: ${context.user.role || 'No especificado'}
- Departamento: ${context.user.department || 'No especificado'}
- Zona horaria: ${context.user.timezone}
- Tareas totales: ${context.user.tasksCount}
- Proyectos activos: ${context.user.projectsCount}
- Tareas completadas hoy: ${context.user.completedTasksToday}

FECHA Y HORA ACTUAL: ${new Date().toLocaleString('es-ES', { timeZone: context.user.timezone })}

${this.buildCompleteTasksContext(context)}

${this.buildProjectsContext(context)}

${this.buildSessionsContext(context)}

${this.buildPreferencesContext(context)}

${this.buildAssignmentsContext(context)}

${this.buildAdvancedInsightsContext(context)}

${this.buildTemporalAnalysis(context)}

${this.buildRecentActivityContext(context)}

${this.buildConversationContext(context.conversation)}

CAPACIDADES Y ACCIONES DISPONIBLES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Puedes recomendar tareas específicas basándote en toda la información
• Puedes crear planes de trabajo secuenciales para tiempo disponible
• Puedes priorizar automáticamente basándote en urgencias y contexto
• Puedes gestionar proactivamente la productividad del usuario
• Debes ser específico con nombres reales de tareas y estimaciones

INSTRUCCIONES PARA TU RESPUESTA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Consulta del usuario: "${userMessage}"

${this.buildResponseInstructions(userMessage, context)}

Responde basándote en TODA la información específica disponible. Usa nombres reales de tareas y proyectos. Sé proactivo y específico.`;
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
   * ✅ PROMPT RICO: Construir contexto completo de tareas
   */
  private buildCompleteTasksContext(context: PromptContext): string {
    const { tasks } = context;
    
    let taskContext = `TAREAS COMPLETAS (${context.user.tasksCount} totales):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    // ✅ CHECKPOINT 2.1: Información de jerarquía completa
    if (context.tasks.hierarchy.length > 0) {
      taskContext += `📁 JERARQUÍA DE PROYECTOS (${context.tasks.hierarchy.length} tareas principales):\n`;
      context.tasks.hierarchy.slice(0, 3).forEach(mainTask => {
        taskContext += `  • "${mainTask.title}" (${mainTask.progressPercent}% completado)\n`;
        if (mainTask.subtaskCount > 0) {
          taskContext += `    └ ${mainTask.completedSubtasks}/${mainTask.subtaskCount} subtareas completadas`;
          if (mainTask.microtaskCount > 0) {
            taskContext += `, ${mainTask.completedMicrotasks}/${mainTask.microtaskCount} microtareas`;
          }
          taskContext += '\n';
        }
      });
      taskContext += '\n';
    }

    // Tareas vencidas (prioridad máxima)
    if (tasks.specificTasks.overdue.length > 0) {
      taskContext += `🚨 TAREAS VENCIDAS (${tasks.specificTasks.overdue.length}):\n`;
      tasks.specificTasks.overdue.forEach(task => {
        taskContext += `  • "${task.title}" - VENCIDA hace ${task.daysOverdue} día(s)`;
        if (task.estimatedDuration) taskContext += ` (~${task.estimatedDuration} min)`;
        taskContext += '\n';
      });
      taskContext += '\n';
    }

    // Tareas urgentes hoy
    if (tasks.specificTasks.urgent.length > 0) {
      taskContext += `⚡ TAREAS URGENTES HOY (${tasks.specificTasks.urgent.length}):\n`;
      tasks.specificTasks.urgent.forEach(task => {
        taskContext += `  • "${task.title}"`;
        if (task.estimatedDuration) taskContext += ` (~${task.estimatedDuration} min)`;
        if (task.dueDate) taskContext += ` - Vence: ${new Date(task.dueDate).toLocaleDateString('es-ES')}`;
        taskContext += '\n';
      });
      taskContext += '\n';
    }

    // Tareas en progreso
    if (tasks.specificTasks.inProgress.length > 0) {
      taskContext += `🔄 TAREAS EN PROGRESO (${tasks.specificTasks.inProgress.length}):\n`;
      tasks.specificTasks.inProgress.forEach(task => {
        taskContext += `  • "${task.title}"`;
        if (task.estimatedDuration) taskContext += ` (~${task.estimatedDuration} min)`;
        taskContext += '\n';
      });
      taskContext += '\n';
    }

    // Quick wins
    if (tasks.specificTasks.quickWins.length > 0) {
      taskContext += `⚡ QUICK WINS (≤15 min) - ${tasks.specificTasks.quickWins.length} disponibles:\n`;
      tasks.specificTasks.quickWins.slice(0, 5).forEach(task => {
        taskContext += `  • "${task.title}" (~${task.estimatedDuration || 15} min)\n`;
      });
      taskContext += '\n';
    }

    // Recomendaciones basadas en tiempo si existen
    if (tasks.timeBasedRecommendations && tasks.timeBasedRecommendations.length > 0) {
      taskContext += `🎯 RECOMENDACIONES ESPECÍFICAS PARA TIEMPO DISPONIBLE:\n`;
      tasks.timeBasedRecommendations.slice(0, 3).forEach((rec, index) => {
        taskContext += `  ${index + 1}. "${rec.task.title}" (${rec.estimatedDuration} min)\n`;
        taskContext += `     Razón: ${rec.specificReason}\n`;
        if (rec.actionSteps) {
          taskContext += `     Pasos: ${rec.actionSteps.join(' → ')}\n`;
        }
      });
    }

    return taskContext;
  }

  /**
   * ✅ CHECKPOINT 2.2: Construir contexto rico de proyectos
   */
  private buildProjectsContext(context: PromptContext): string {
    let projectSection = `PROYECTOS ACTIVOS (${context.user.projectsCount} totales):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (context.projects?.projectsWithProgress && context.projects.projectsWithProgress.length > 0) {
      projectSection += `📊 PROGRESO DETALLADO DE PROYECTOS:\n`;
      context.projects.projectsWithProgress.slice(0, 5).forEach(project => {
        projectSection += `  • "${project.name}" - ${project.progressPercent}% completado\n`;
        projectSection += `    └ ${project.completedTaskCount}/${project.taskCount} tareas completadas`;
        if (project.urgentTasks > 0) {
          projectSection += ` (${project.urgentTasks} urgentes)`;
        }
        projectSection += '\n';
      });
    } else {
      projectSection += `El usuario tiene ${context.user.projectsCount} proyectos activos con tareas distribuidas entre ellos.\n`;
    }

    return projectSection + '\n';
  }

  /**
   * ✅ CHECKPOINT 2.2: Construir contexto de sesiones de trabajo
   */
  private buildSessionsContext(context: PromptContext): string {
    let sessionSection = `SESIONES DE TRABAJO Y PRODUCTIVIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (context.sessions) {
      sessionSection += `• Total de sesiones registradas: ${context.sessions.totalSessions}\n`;
      
      if (context.sessions.sessionPatterns && context.sessions.sessionPatterns.length > 0) {
        sessionSection += `• Patrones de sesiones identificados:\n`;
        context.sessions.sessionPatterns.forEach(pattern => {
          sessionSection += `  - ${pattern}\n`;
        });
      }

      if (context.sessions.recentSessions && context.sessions.recentSessions.length > 0) {
        sessionSection += `\n📝 SESIONES RECIENTES:\n`;
        context.sessions.recentSessions.slice(0, 3).forEach(session => {
          sessionSection += `  • ${session.duration_minutes ? `${session.duration_minutes} min` : 'En curso'}`;
          if (session.productivity_score) {
            sessionSection += ` (Productividad: ${session.productivity_score}/10)`;
          }
          sessionSection += `\n`;
        });
      }
    } else {
      sessionSection += `Sin sesiones de trabajo registradas.\n`;
    }

    return sessionSection + '\n';
  }

  /**
   * ✅ CHECKPOINT 2.2: Construir contexto de preferencias de productividad
   */
  private buildPreferencesContext(context: PromptContext): string {
    let prefSection = `PREFERENCIAS DE PRODUCTIVIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (context.preferences?.productivity) {
      const prefs = context.preferences.productivity;
      
      prefSection += `• Horario de trabajo: ${context.preferences.workingHours}\n`;
      
      if (prefs.focus_session_duration) {
        prefSection += `• Duración de sesiones de enfoque: ${prefs.focus_session_duration} minutos\n`;
      }
      
      if (prefs.productivity_goals) {
        prefSection += `• Objetivos de productividad: ${prefs.productivity_goals.daily_tasks} tareas/día, ${prefs.productivity_goals.weekly_tasks} tareas/semana\n`;
      }

      if (context.preferences.energySchedule) {
        const energy = context.preferences.energySchedule;
        prefSection += `• Horarios de energía alta: ${energy.high?.join(', ') || 'No configurados'}\n`;
        prefSection += `• Horarios de energía media: ${energy.medium?.join(', ') || 'No configurados'}\n`;
      }
    } else {
      prefSection += `Preferencias de productividad no configuradas.\n`;
    }

    return prefSection + '\n';
  }

  /**
   * ✅ CHECKPOINT 2.2: Construir contexto de asignaciones y colaboración
   */
  private buildAssignmentsContext(context: PromptContext): string {
    let assignSection = `ASIGNACIONES Y COLABORACIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    if (context.assignments) {
      assignSection += `• Total de asignaciones: ${context.assignments.totalAssignments}\n`;
      assignSection += `• Nivel de colaboración: ${context.assignments.collaborationLevel}\n`;

      if (context.assignments.taskAssignments && context.assignments.taskAssignments.length > 0) {
        assignSection += `\n👥 ASIGNACIONES ACTIVAS:\n`;
        context.assignments.taskAssignments.slice(0, 3).forEach(assignment => {
          assignSection += `  • Rol: ${assignment.role_in_task}`;
          if (assignment.due_date) {
            assignSection += ` - Vence: ${new Date(assignment.due_date).toLocaleDateString('es-ES')}`;
          }
          assignSection += '\n';
        });
      }
    } else {
      assignSection += `Sin asignaciones de tareas registradas. Trabajo individual.\n`;
    }

    return assignSection + '\n';
  }

  /**
   * ✅ CHECKPOINT 2.3: Construir contexto de insights históricos avanzados
   */
  private buildAdvancedInsightsContext(context: PromptContext): string {
    let insightsSection = `ANÁLISIS HISTÓRICO E INSIGHTS INTELIGENTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;

    // Insights históricos
    if (context.advancedInsights && context.advancedInsights.length > 0) {
      insightsSection += `🧠 INSIGHTS INTELIGENTES DETECTADOS:\n`;
      context.advancedInsights.slice(0, 5).forEach(insight => {
        const severityEmoji = insight.severity === 'high' ? '🔴' : insight.severity === 'medium' ? '🟡' : '🟢';
        insightsSection += `  ${severityEmoji} ${insight.icon} ${insight.title}\n`;
        insightsSection += `    └ ${insight.description}\n`;
        if (insight.actionable) {
          insightsSection += `    └ ⚡ Acción recomendada disponible\n`;
        }
      });
      insightsSection += '\n';
    }

    // Análisis de productividad avanzado
    if (context.advancedProductivity) {
      const prod = context.advancedProductivity;
      insightsSection += `📊 ANÁLISIS DE PRODUCTIVIDAD AVANZADO:\n`;
      
      if (prod.weeklyProgress) {
        const trend = prod.weeklyProgress.trend === 'improving' ? '📈 Mejorando' : 
                     prod.weeklyProgress.trend === 'declining' ? '📉 Declinando' : 
                     '➡️ Estable';
        insightsSection += `  • Progreso semanal: ${prod.weeklyProgress.currentWeek}h esta semana vs ${prod.weeklyProgress.lastWeek}h anterior (${trend})\n`;
      }

      if (prod.optimalHours && prod.optimalHours.length > 0) {
        insightsSection += `  • Horarios óptimos identificados: ${prod.productiveTimeSlots?.join(', ') || 'Calculando...'}\n`;
      }

      if (prod.averageSessionDuration) {
        insightsSection += `  • Duración promedio de sesiones: ${prod.averageSessionDuration} minutos\n`;
      }

      if (prod.completionRate) {
        const completionPercent = Math.round(prod.completionRate * 100);
        insightsSection += `  • Tasa de completación: ${completionPercent}%\n`;
      }
    }

    if (!context.advancedInsights?.length && !context.advancedProductivity) {
      insightsSection += `Construyendo análisis histórico... Se necesitan más datos para generar insights.`;
    }

    return insightsSection + '\n';
  }

  /**
   * ✅ PROMPT RICO: Análisis temporal y urgencias
   */
  private buildTemporalAnalysis(context: PromptContext): string {
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });
    const timeOfDay = now.getHours() < 12 ? 'mañana' : now.getHours() < 18 ? 'tarde' : 'noche';
    
    return `ANÁLISIS TEMPORAL Y URGENCIAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Momento actual: ${dayOfWeek} por la ${timeOfDay}
• Tareas vencidas: ${context.tasks.specificTasks.overdue.length}
• Tareas urgentes hoy: ${context.tasks.specificTasks.urgent.length}
• Quick wins disponibles: ${context.tasks.specificTasks.quickWins.length}
• Tareas en progreso: ${context.tasks.specificTasks.inProgress.length}

${context.currentRecommendation ? 
  `🎯 RECOMENDACIÓN PRINCIPAL CALCULADA:
  "${context.currentRecommendation.task?.title}" (Confianza: ${Math.round(context.currentRecommendation.confidence || 0)}%)` :
  'Sin recomendación principal calculada'
}

`;
  }

  /**
   * ✅ PROMPT RICO: Contexto de actividad reciente
   */
  private buildRecentActivityContext(context: PromptContext): string {
    let activitySection = `ACTIVIDAD RECIENTE Y PRODUCTIVIDAD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Tareas completadas hoy: ${context.user.completedTasksToday}
• Patrón de productividad: ${context.user.completedTasksToday >= 3 ? 'Alto' : context.user.completedTasksToday >= 1 ? 'Moderado' : 'Bajo'}`;

    // ✅ CHECKPOINT 1.4: Incluir datos históricos y patrones de trabajo
    if (context.user.lastActivity) {
      if (typeof context.user.lastActivity === 'string') {
        activitySection += `\n• Última actividad: ${context.user.lastActivity}`;
      } else {
        activitySection += `\n• Última tarea trabajada: "${context.user.lastActivity.lastTaskWorked}" ${context.user.lastActivity.timeAgo}`;
      }
    }

    if (context.user.workPatterns && context.user.workPatterns.length > 0) {
      activitySection += `\n• Patrones de trabajo identificados:`;
      context.user.workPatterns.forEach(pattern => {
        activitySection += `\n  - ${pattern}`;
      });
    }

    if (context.user.personalizedReferences && context.user.personalizedReferences.length > 0) {
      activitySection += `\n• Referencias personalizadas disponibles: ${context.user.personalizedReferences.join(', ')}`;
    }

    if (context.behaviorInsights) {
      activitySection += `\n• Insights de comportamiento disponibles: ${context.behaviorInsights.length || 0} insights`;
    } else {
      activitySection += `\n• Sin análisis de comportamiento disponible`;
    }

    return activitySection + '\n\n';
  }

  /**
   * ✅ PROMPT RICO: Contexto conversacional
   */
  private buildConversationContext(conversation: ConversationSummary): string {
    return `CONTEXTO CONVERSACIONAL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Flujo de conversación: ${conversation.conversationFlow}
• Estado de ánimo detectado: ${conversation.userMood}
• Ha saludado previamente: ${conversation.hasGreeted ? 'Sí' : 'No'}
${conversation.lastTaskMentioned ? `• Última tarea mencionada: "${conversation.lastTaskMentioned}"` : ''}
${conversation.recentTopics.length > 0 ? `• Temas recientes: ${conversation.recentTopics.join(', ')}` : ''}

`;
  }

  /**
   * ✅ PROMPT RICO: Instrucciones específicas para la respuesta
   */
  private buildResponseInstructions(userMessage: string, context: PromptContext): string {
    const queryType = this.analyzeQueryType(userMessage);
    let instructions = '';

    switch (queryType.type) {
      case 'task_request':
        instructions = `INSTRUCCIÓN ESPECÍFICA:
El usuario pide gestión/recomendación de tareas. DEBES:
• Usar nombres específicos de tareas reales de su lista
• Priorizar tareas vencidas si las hay
• Dar pasos concretos y ejecutables
• Ser proactivo en la gestión`;
        break;

      case 'status_check':
        instructions = `INSTRUCCIÓN ESPECÍFICA:
El usuario quiere conocer su estado. DEBES:
• Dar resumen preciso basado en datos reales
• Mencionar números específicos de tareas
• Destacar urgencias y prioridades
• Sugerir próximas acciones`;
        break;

      default:
        instructions = `INSTRUCCIÓN ESPECÍFICA:
Responde basándote en todo el contexto disponible.
• Usa datos específicos, no generalidades
• Sé proactivo si detectas oportunidades de ayuda
• Menciona tareas y proyectos por nombre real`;
    }

    // Comandos especiales
    if (userMessage.toLowerCase().includes('gestioname') || userMessage.toLowerCase().includes('gestiona')) {
      instructions += `

🎯 COMANDO ESPECIAL DETECTADO: "GESTIONAME"
DEBES tomar control total y ofrecer gestión proactiva:
• Analizar toda la situación
• Priorizar automáticamente
• Crear plan de acción secuencial
• Dar instrucciones específicas paso a paso`;
    }

    return instructions;
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