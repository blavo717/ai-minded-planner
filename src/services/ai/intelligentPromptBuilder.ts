import { EnhancedContextualData } from '@/hooks/ai/useEnhancedContextualData';
import { CompleteTaskContext } from '@/utils/enhancedTaskContext';

export interface PromptContext {
  type: 'productivity_analysis' | 'smart_planning' | 'project_analysis' | 'task_focus' | 'general_chat';
  userData: EnhancedContextualData;
  specificContext?: CompleteTaskContext;
  timeContext: {
    hour: number;
    dayOfWeek: string;
    isWeekend: boolean;
    isProductiveTime: boolean;
  };
}

export interface SpecializedPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: PromptContext;
  expectedOutputType: 'analysis' | 'recommendations' | 'planning' | 'insights';
}

/**
 * Constructor de prompts especializados que genera prompts contextuales
 * basados en datos reales del usuario y su situación actual
 */
export class IntelligentPromptBuilder {
  
  /**
   * Construye prompt para análisis de productividad personal
   */
  static buildProductivityAnalysisPrompt(userData: EnhancedContextualData): SpecializedPrompt {
    const timeContext = this.getTimeContext();
    
    const systemPrompt = `Eres un analista de productividad experto que ayuda a usuarios a entender sus patrones de trabajo y optimizar su rendimiento.

ESPECIALIZACIÓN:
- Análisis de patrones de trabajo basado en datos REALES
- Identificación de bloqueos y cuellos de botella
- Sugerencias específicas y accionables
- Enfoque en mejora continua

CONTEXTO TEMPORAL:
- Hora actual: ${timeContext.hour}:00 (${timeContext.isProductiveTime ? 'Hora productiva' : 'Hora menos productiva'})
- Día: ${timeContext.dayOfWeek} ${timeContext.isWeekend ? '(Fin de semana)' : '(Día laboral)'}

INSTRUCCIONES DE RESPUESTA:
- Usa DATOS ESPECÍFICOS del usuario, no generalidades
- Identifica PATRONES concretos en los datos
- Proporciona RECOMENDACIONES específicas y realizables
- Menciona NÚMEROS específicos cuando sea relevante
- Enfócate en OPORTUNIDADES de mejora inmediata`;

    const userPrompt = this.buildProductivityUserPrompt(userData);

    return {
      systemPrompt,
      userPrompt,
      context: { type: 'productivity_analysis', userData, timeContext },
      expectedOutputType: 'analysis'
    };
  }

  /**
   * Construye prompt para planificación inteligente "¿Qué hago ahora?"
   */
  static buildSmartPlanningPrompt(userData: EnhancedContextualData): SpecializedPrompt {
    const timeContext = this.getTimeContext();
    
    const systemPrompt = `Eres un asistente de planificación inteligente que ayuda a usuarios a decidir qué hacer AHORA MISMO basándote en su contexto real.

ESPECIALIZACIÓN:
- Priorización inteligente basada en contexto actual
- Recomendaciones específicas para el momento presente
- Consideración de energía, tiempo disponible y patrones de trabajo
- Enfoque en acción inmediata

CONTEXTO TEMPORAL:
- Hora: ${timeContext.hour}:00 - ${this.getEnergyLevel(timeContext.hour)}
- Día: ${timeContext.dayOfWeek}
- Momento: ${this.getWorkMoment(timeContext.hour)}

CRITERIOS DE PRIORIZACIÓN:
1. Urgencia real (fechas límite, bloqueos)
2. Contexto energético actual
3. Momentum de trabajo (si hay sesión activa)
4. Patrones de productividad del usuario
5. Dependencias entre tareas

FORMATO DE RESPUESTA:
- RECOMENDACIÓN PRINCIPAL: Una acción específica para hacer AHORA
- RAZÓN: Por qué es la mejor opción en este momento
- ALTERNATIVAS: 2-3 opciones secundarias
- TIEMPO ESTIMADO: Duración aproximada de la tarea recomendada`;

    const userPrompt = this.buildPlanningUserPrompt(userData);

    return {
      systemPrompt,
      userPrompt,
      context: { type: 'smart_planning', userData, timeContext },
      expectedOutputType: 'recommendations'
    };
  }

  /**
   * Construye prompt para análisis de proyectos
   */
  static buildProjectAnalysisPrompt(userData: EnhancedContextualData): SpecializedPrompt {
    const timeContext = this.getTimeContext();
    
    const systemPrompt = `Eres un analista de proyectos especializado en identificar riesgos, oportunidades y estado general de múltiples proyectos.

ESPECIALIZACIÓN:
- Evaluación de salud de proyectos basada en datos reales
- Identificación temprana de riesgos y bloqueos
- Análisis de distribución de trabajo y recursos
- Recomendaciones estratégicas para gestión de portfolio

MÉTRICAS CLAVE A ANALIZAR:
- Progreso real vs. esperado
- Actividad reciente y momentum
- Distribución de trabajo entre proyectos
- Identificación de proyectos abandonados o en riesgo
- Carga de trabajo balanceada

FORMATO DE RESPUESTA:
- ESTADO GENERAL del portfolio
- PROYECTOS EN RIESGO con razones específicas
- OPORTUNIDADES de aceleración
- RECOMENDACIONES estratégicas para los próximos días`;

    const userPrompt = this.buildProjectUserPrompt(userData);

    return {
      systemPrompt,
      userPrompt,
      context: { type: 'project_analysis', userData, timeContext },
      expectedOutputType: 'insights'
    };
  }

  /**
   * Construye prompt para análisis específico de una tarea
   */
  static buildTaskFocusPrompt(taskContext: CompleteTaskContext, userData: EnhancedContextualData): SpecializedPrompt {
    const timeContext = this.getTimeContext();
    
    const systemPrompt = `Eres un especialista en análisis de tareas que ayuda a entender el estado completo de una tarea específica y sus próximos pasos.

ESPECIALIZACIÓN:
- Análisis profundo de una tarea específica con toda su jerarquía
- Identificación de bloqueos y dependencias
- Evaluación de progreso real vs. esperado
- Recomendaciones específicas para avanzar

CONTEXTO DE ANÁLISIS:
- Tarea con jerarquía completa (subtareas y microtareas)
- Actividad reciente y patrones de trabajo
- Sesiones de trabajo y tiempo invertido
- Dependencias y bloqueos
- Contexto del proyecto (si aplica)

FORMATO DE RESPUESTA:
- ESTADO ACTUAL: Diagnóstico preciso de la situación
- PRÓXIMOS PASOS: 3 acciones específicas y priorizadas
- RIESGOS: Identificación de posibles problemas
- OPTIMIZACIÓN: Sugerencias para trabajar más eficientemente`;

    const userPrompt = this.buildTaskFocusUserPrompt(taskContext, userData);

    return {
      systemPrompt,
      userPrompt,
      context: { type: 'task_focus', userData, specificContext: taskContext, timeContext },
      expectedOutputType: 'analysis'
    };
  }

  /**
   * Construye prompt para chat general contextual
   */
  static buildGeneralChatPrompt(userData: EnhancedContextualData, userMessage: string): SpecializedPrompt {
    const timeContext = this.getTimeContext();
    
    const systemPrompt = `Eres un asistente de productividad inteligente que conoce el contexto completo del usuario y puede ayudar con cualquier consulta relacionada con su trabajo.

CONOCIMIENTO DEL USUARIO:
- Tienes acceso a sus tareas, proyectos y patrones de trabajo
- Conoces su actividad reciente y estado actual
- Entiendes su contexto temporal y energético
- Puedes ofrecer consejos personalizados basados en SUS datos

PRINCIPIOS DE RESPUESTA:
- Usa el contexto real del usuario para personalizar respuestas
- Conecta las consultas con su situación actual
- Ofrece ejemplos específicos de sus propios datos
- Mantén un tono útil y proactivo

MENSAJE DEL USUARIO: "${userMessage}"`;

    const userPrompt = this.buildGeneralChatUserPrompt(userData, userMessage);

    return {
      systemPrompt,
      userPrompt,
      context: { type: 'general_chat', userData, timeContext },
      expectedOutputType: 'insights'
    };
  }

  // === MÉTODOS PRIVADOS PARA CONSTRUIR PROMPTS DE USUARIO ===

  private static buildProductivityUserPrompt(userData: EnhancedContextualData): string {
    const { user, taskHierarchy, currentWork, productivity, recentActivity, insights } = userData;
    
    return `ANÁLISIS DE PRODUCTIVIDAD SOLICITADO

DATOS DEL USUARIO:
- Total de tareas: ${user.totalTasks}
- Tareas activas: ${user.activeTasks}
- Completadas hoy: ${user.completedToday}
- Horas de trabajo hoy: ${user.workingHours.toFixed(1)}h

JERARQUÍA DE TRABAJO:
- Tareas principales: ${taskHierarchy.mainTasks.length}
- Tareas urgentes: ${taskHierarchy.urgentTasks.length}
- Tareas bloqueadas: ${taskHierarchy.blockedTasks.length}
- Trabajadas recientemente: ${taskHierarchy.recentlyWorked.length}

TRABAJO ACTUAL:
- Sesión activa: ${currentWork.activeSession ? 'SÍ' : 'NO'}
- Duración sesión actual: ${Math.floor(currentWork.sessionDuration / 60)} minutos
- Sesiones hoy: ${currentWork.todaysSessions.length}

MÉTRICAS DE PRODUCTIVIDAD:
- Puntuación hoy: ${productivity.todayScore}/100
- Tasa de completación: ${productivity.completionRate.toFixed(1)}%
- Tiempo promedio por tarea: ${productivity.averageTaskTime.toFixed(1)} min
- Hora más productiva: ${productivity.mostProductiveHour}:00

ACTIVIDAD RECIENTE:
- Días sin actividad: ${recentActivity.daysSinceLastActivity}
- Completadas hoy: ${recentActivity.recentCompletions.length}
- Patrón de trabajo: ${insights.workPattern}

ALERTAS ACTUALES:
${insights.alerts.map(alert => `- ${alert}`).join('\n')}

Analiza estos datos y proporciona insights específicos sobre patrones de productividad, identificación de bloqueos y recomendaciones concretas para optimizar el rendimiento.`;
  }

  private static buildPlanningUserPrompt(userData: EnhancedContextualData): string {
    const { taskHierarchy, currentWork, productivity, insights } = userData;
    
    const urgentTasks = taskHierarchy.urgentTasks.slice(0, 3);
    const recentlyWorked = taskHierarchy.recentlyWorked.slice(0, 3);
    
    return `PLANIFICACIÓN INTELIGENTE - ¿QUÉ HAGO AHORA?

SITUACIÓN ACTUAL:
- Sesión activa: ${currentWork.activeSession ? `SÍ - ${currentWork.activeSession.task_id}` : 'NO'}
- Trabajo en curso: ${currentWork.currentTask?.title || currentWork.currentSubtask?.title || currentWork.currentMicrotask?.title || 'Ninguno'}
- Energía actual: ${this.getEnergyLevel(new Date().getHours())}
- Productividad hoy: ${productivity.todayScore}/100

TAREAS URGENTES:
${urgentTasks.map(task => `- ${task.title} (${task.priority})`).join('\n') || 'Ninguna'}

TRABAJADAS RECIENTEMENTE:
${recentlyWorked.map(task => `- ${task.title} (${task.status})`).join('\n') || 'Ninguna'}

TAREAS BLOQUEADAS:
${taskHierarchy.blockedTasks.slice(0, 3).map(task => `- ${task.title}`).join('\n') || 'Ninguna'}

RECOMENDACIONES PREVIAS:
${insights.recommendations.slice(0, 3).map(rec => `- ${rec}`).join('\n')}

PRÓXIMA MEJOR ACCIÓN SUGERIDA:
${insights.nextBestAction}

Basándote en esta información REAL, recomienda específicamente qué debería hacer AHORA MISMO. Considera el contexto temporal, mi energía actual, y el momentum de trabajo.`;
  }

  private static buildProjectUserPrompt(userData: EnhancedContextualData): string {
    const { projects, taskHierarchy } = userData;
    
    return `ANÁLISIS DE PROYECTOS SOLICITADO

PROYECTOS ACTIVOS:
${projects.activeProjects.map(project => 
  `- ${project.name} (Progreso: ${project.progress}%)`
).join('\n') || 'Ninguno'}

PROYECTOS ESTANCADOS:
${projects.stuckProjects.map(project => 
  `- ${project.name} (Sin actividad reciente)`
).join('\n') || 'Ninguno'}

PROYECTOS PRÓXIMOS A COMPLETAR:
${projects.completingProjects.map(project => 
  `- ${project.name} (${project.progress}% completado)`
).join('\n') || 'Ninguno'}

DISTRIBUCIÓN DE TRABAJO:
- Tareas principales: ${taskHierarchy.mainTasks.length}
- Con subtareas: ${taskHierarchy.mainTasks.filter(h => h.subtasks.length > 0).length}
- Con microtareas: ${taskHierarchy.mainTasks.filter(h => h.microtasks.length > 0).length}

ESTADO GENERAL:
- Progreso promedio: ${projects.activeProjects.length > 0 ? 
  Math.round(projects.activeProjects.reduce((sum, p) => sum + p.progress, 0) / projects.activeProjects.length) : 0}%
- Proyectos en riesgo: ${projects.stuckProjects.length}

Analiza el estado general del portfolio de proyectos, identifica riesgos específicos y proporciona recomendaciones estratégicas para los próximos días.`;
  }

  private static buildTaskFocusUserPrompt(taskContext: CompleteTaskContext, userData: EnhancedContextualData): string {
    const { mainTask, fullHierarchy, activityData, progressAnalysis, workSessions, userContext } = taskContext;
    
    return `ANÁLISIS DETALLADO DE TAREA ESPECÍFICA

TAREA PRINCIPAL:
- Título: "${mainTask.title}"
- Estado: ${mainTask.status}
- Prioridad: ${mainTask.priority}
- Creada: ${new Date(mainTask.created_at).toLocaleDateString()}
- Última actualización: ${new Date(mainTask.updated_at).toLocaleDateString()}

JERARQUÍA COMPLETA:
- Subtareas: ${fullHierarchy.subtasks.length} (${fullHierarchy.subtasks.filter(s => s.status === 'completed').length} completadas)
- Microtareas: ${fullHierarchy.microtasks.length} (${fullHierarchy.microtasks.filter(m => m.status === 'completed').length} completadas)
- Progreso general: ${progressAnalysis.overallProgress}%

ACTIVIDAD RECIENTE:
- Logs totales: ${activityData.allLogs.length}
- Último log: ${activityData.lastActivity ? new Date(activityData.lastActivity).toLocaleDateString() : 'Nunca'}
- Días sin actividad: ${activityData.daysSinceLastActivity}

SESIONES DE TRABAJO:
- Sesiones activas: ${workSessions.activeSessions.length}
- Tiempo total invertido: ${workSessions.totalWorkTime} minutos
- Tiempo hoy: ${workSessions.todayWorkTime} minutos

ANÁLISIS DE PROGRESO:
- Velocidad de avance: ${progressAnalysis.velocityScore.toFixed(2)} puntos/día
- Riesgo de estancamiento: ${progressAnalysis.stagnationRisk}
- Estimación de completación: ${progressAnalysis.estimatedCompletion ? new Date(progressAnalysis.estimatedCompletion).toLocaleDateString() : 'No disponible'}

DEPENDENCIAS:
- Bloqueada por: ${taskContext.dependencies.blocking.length} tareas
- Bloquea a: ${taskContext.dependencies.dependent.length} tareas
- Puede proceder: ${taskContext.dependencies.canProceed ? 'SÍ' : 'NO'}

CONTEXTO DEL USUARIO:
- Productividad hoy: ${userContext.productivityScore}/100
- Completadas hoy: ${userContext.completedToday}
- Momento del día: ${userContext.workPattern}

Proporciona un análisis detallado del estado de esta tarea específica y recomendaciones concretas para avanzar eficientemente.`;
  }

  private static buildGeneralChatUserPrompt(userData: EnhancedContextualData, userMessage: string): string {
    const { user, productivity, insights } = userData;
    
    return `CONSULTA DEL USUARIO: "${userMessage}"

CONTEXTO ACTUAL DEL USUARIO:
- Tareas activas: ${user.activeTasks}
- Completadas hoy: ${user.completedToday}
- Productividad hoy: ${productivity.todayScore}/100
- Patrón de trabajo: ${insights.workPattern}
- Próxima acción sugerida: ${insights.nextBestAction}

Responde a la consulta del usuario teniendo en cuenta su contexto actual de trabajo y datos específicos.`;
  }

  // === MÉTODOS AUXILIARES ===

  private static getTimeContext() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });
    const isWeekend = [0, 6].includes(now.getDay());
    const isProductiveTime = hour >= 9 && hour <= 17;

    return { hour, dayOfWeek, isWeekend, isProductiveTime };
  }

  private static getEnergyLevel(hour: number): string {
    if (hour >= 9 && hour <= 11) return 'Energía alta (mañana)';
    if (hour >= 14 && hour <= 16) return 'Energía media-alta (tarde)';
    if (hour >= 17 && hour <= 19) return 'Energía media (tarde-noche)';
    return 'Energía baja';
  }

  private static getWorkMoment(hour: number): string {
    if (hour >= 9 && hour <= 12) return 'Momento de trabajo intenso';
    if (hour >= 13 && hour <= 17) return 'Momento de trabajo enfocado';
    if (hour >= 18 && hour <= 20) return 'Momento de revisión y planificación';
    return 'Momento de descanso';
  }
}