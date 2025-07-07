/**
 * ✅ CHECKPOINT 2.3: Análisis Contextual Avanzado
 * Servicio para generar insights históricos inteligentes basados en patrones de trabajo
 */

export interface HistoricalInsight {
  type: 'productivity_pattern' | 'task_inactivity' | 'project_progress' | 'work_rhythm' | 'achievement';
  title: string;
  description: string;
  data: any;
  severity: 'low' | 'medium' | 'high';
  actionable: boolean;
  icon: string;
}

export interface ProductivityInsights {
  weeklyProgress: {
    currentWeek: number;
    lastWeek: number;
    trend: 'improving' | 'declining' | 'stable';
  };
  optimalHours: number[];
  productiveTimeSlots: string[];
  averageSessionDuration: number;
  completionRate: number;
}

export interface UserPattern {
  pattern_type: string;
  confidence: number;
  data: any;
}

export class AdvancedContextAnalyzer {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Analiza patrones de productividad basados en logs y sesiones de trabajo
   */
  analyzeProductivityPatterns(logs: any[], sessions: any[]): ProductivityInsights {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Sesiones de esta semana vs semana pasada
    const currentWeekSessions = sessions.filter(s => 
      new Date(s.created_at) >= oneWeekAgo
    );
    const lastWeekSessions = sessions.filter(s => 
      new Date(s.created_at) >= twoWeeksAgo && new Date(s.created_at) < oneWeekAgo
    );

    const currentWeekHours = currentWeekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;
    const lastWeekHours = lastWeekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

    // Horarios óptimos de productividad
    const hourlyProductivity = new Map<number, { total: number; productive: number }>();
    
    sessions.forEach(session => {
      if (session.productivity_score && session.started_at) {
        const hour = new Date(session.started_at).getHours();
        const current = hourlyProductivity.get(hour) || { total: 0, productive: 0 };
        current.total++;
        if (session.productivity_score >= 7) {
          current.productive++;
        }
        hourlyProductivity.set(hour, current);
      }
    });

    // Encontrar horarios con mejor ratio de productividad
    const optimalHours = Array.from(hourlyProductivity.entries())
      .filter(([_, data]) => data.total >= 3) // Al menos 3 sesiones para ser significativo
      .sort(([_, a], [__, b]) => (b.productive / b.total) - (a.productive / a.total))
      .slice(0, 4)
      .map(([hour]) => hour);

    // Duración promedio de sesiones
    const avgDuration = sessions
      .filter(s => s.duration_minutes)
      .reduce((sum, s) => sum + s.duration_minutes, 0) / Math.max(1, sessions.filter(s => s.duration_minutes).length);

    // Tasa de completación (basada en logs de completación)
    const completionLogs = logs.filter(l => l.log_type === 'completion' || l.title.includes('completad'));
    const totalWorkLogs = logs.filter(l => l.log_type === 'work' || l.log_type === 'progress');
    const completionRate = totalWorkLogs.length > 0 ? completionLogs.length / totalWorkLogs.length : 0;

    return {
      weeklyProgress: {
        currentWeek: Math.round(currentWeekHours * 10) / 10,
        lastWeek: Math.round(lastWeekHours * 10) / 10,
        trend: currentWeekHours > lastWeekHours * 1.1 ? 'improving' : 
               currentWeekHours < lastWeekHours * 0.9 ? 'declining' : 'stable'
      },
      optimalHours,
      productiveTimeSlots: this.generateTimeSlotDescriptions(optimalHours),
      averageSessionDuration: Math.round(avgDuration),
      completionRate: Math.round(completionRate * 100) / 100
    };
  }

  /**
   * Genera insights históricos detallados
   */
  generateHistoricalInsights(tasks: any[], logs: any[], sessions: any[], timeframe: number = 7): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];
    const now = new Date();
    const timeframeDate = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000);

    // 1. Análisis de progreso de proyecto
    const projectProgress = this.analyzeProjectProgress(tasks, logs, timeframeDate);
    if (projectProgress) {
      insights.push(projectProgress);
    }

    // 2. Detección de tareas inactivas
    const inactiveTasks = this.detectInactiveTasks(tasks, logs);
    insights.push(...inactiveTasks);

    // 3. Análisis de ritmo de trabajo
    const workRhythm = this.analyzeWorkRhythm(sessions, timeframeDate);
    if (workRhythm) {
      insights.push(workRhythm);
    }

    // 4. Patrones de productividad
    const productivityPattern = this.analyzeProductivityPattern(sessions, timeframeDate);
    if (productivityPattern) {
      insights.push(productivityPattern);
    }

    // 5. Logros y celebraciones
    const achievements = this.detectAchievements(tasks, logs, timeframeDate);
    insights.push(...achievements);

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Analiza progreso de proyectos con trabajo reciente
   */
  private analyzeProjectProgress(tasks: any[], logs: any[], since: Date): HistoricalInsight | null {
    const recentWorkLogs = logs.filter(log => 
      new Date(log.created_at) >= since && 
      (log.log_type === 'work' || log.log_type === 'progress')
    );

    if (recentWorkLogs.length === 0) return null;

    // Agrupar por proyecto
    const projectWork = new Map<string, { hours: number; taskCount: number; projectName: string }>();
    
    recentWorkLogs.forEach(log => {
      const task = tasks.find(t => t.id === log.task_id);
      if (task && task.project_id) {
        const current = projectWork.get(task.project_id) || { 
          hours: 0, 
          taskCount: 0, 
          projectName: 'Proyecto sin nombre' 
        };
        
        // Estimar horas basado en duración estimada o assumir 30 min por log
        const estimatedHours = (task.estimated_duration || 30) / 60;
        current.hours += estimatedHours;
        current.taskCount++;
        
        projectWork.set(task.project_id, current);
      }
    });

    if (projectWork.size === 0) return null;

    // Encontrar proyecto con más progreso
    const topProject = Array.from(projectWork.entries())
      .sort(([_, a], [__, b]) => b.hours - a.hours)[0];

    const [projectId, data] = topProject;
    const timeframeDays = Math.ceil((Date.now() - since.getTime()) / (1000 * 60 * 60 * 24));

    return {
      type: 'project_progress',
      title: '🚀 Gran avance en proyecto',
      description: `Trabajaste ${Math.round(data.hours * 10) / 10} horas en "${data.projectName}" en los últimos ${timeframeDays} días - ¡excelente progreso!`,
      data: { projectId, hours: data.hours, taskCount: data.taskCount },
      severity: data.hours >= 4 ? 'high' : 'medium',
      actionable: false,
      icon: '🚀'
    };
  }

  /**
   * Detecta tareas que llevan mucho tiempo sin actividad
   */
  private detectInactiveTasks(tasks: any[], logs: any[]): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const inProgressTasks = tasks.filter(t => 
      t.status === 'in_progress' && !t.is_archived
    );

    for (const task of inProgressTasks) {
      // Buscar último log de trabajo para esta tarea
      const taskLogs = logs
        .filter(log => log.task_id === task.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const lastLog = taskLogs[0];
      const lastActivity = lastLog ? new Date(lastLog.created_at) : new Date(task.updated_at);

      if (lastActivity < threeDaysAgo) {
        const daysSinceActivity = Math.ceil((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        insights.push({
          type: 'task_inactivity',
          title: '⏰ Tarea sin actividad',
          description: `"${task.title}" lleva ${daysSinceActivity} días sin actividad. ¿La retomamos?`,
          data: { taskId: task.id, daysSinceActivity, lastActivity },
          severity: daysSinceActivity >= 7 ? 'high' : 'medium',
          actionable: true,
          icon: '⏰'
        });
      }
    }

    return insights.slice(0, 3); // Máximo 3 tareas inactivas
  }

  /**
   * Analiza ritmo de trabajo y productividad
   */
  private analyzeWorkRhythm(sessions: any[], since: Date): HistoricalInsight | null {
    const recentSessions = sessions.filter(s => new Date(s.created_at) >= since);
    
    if (recentSessions.length < 3) return null;

    const productiveSessions = recentSessions.filter(s => s.productivity_score && s.productivity_score >= 7);
    const productivityRate = productiveSessions.length / recentSessions.length;

    if (productivityRate >= 0.7) {
      return {
        type: 'work_rhythm',
        title: '💪 Excelente ritmo de trabajo',
        description: `${Math.round(productivityRate * 100)}% de tus sesiones recientes han sido altamente productivas. ¡Sigue así!`,
        data: { productivityRate, totalSessions: recentSessions.length },
        severity: 'low',
        actionable: false,
        icon: '💪'
      };
    }

    return null;
  }

  /**
   * Analiza patrones de productividad por horarios
   */
  private analyzeProductivityPattern(sessions: any[], since: Date): HistoricalInsight | null {
    const recentSessions = sessions.filter(s => 
      new Date(s.created_at) >= since && s.productivity_score && s.started_at
    );

    if (recentSessions.length < 5) return null;

    // Agrupar por hora
    const hourlyStats = new Map<number, { count: number; avgProductivity: number }>();
    
    recentSessions.forEach(session => {
      const hour = new Date(session.started_at).getHours();
      const current = hourlyStats.get(hour) || { count: 0, avgProductivity: 0 };
      current.count++;
      current.avgProductivity = (current.avgProductivity * (current.count - 1) + session.productivity_score) / current.count;
      hourlyStats.set(hour, current);
    });

    // Encontrar mejor hora
    const bestHour = Array.from(hourlyStats.entries())
      .filter(([_, data]) => data.count >= 2)
      .sort(([_, a], [__, b]) => b.avgProductivity - a.avgProductivity)[0];

    if (bestHour && bestHour[1].avgProductivity >= 7.5) {
      const [hour, data] = bestHour;
      const timeSlot = this.formatHourRange(hour);

      return {
        type: 'productivity_pattern',
        title: '⭐ Horario óptimo identificado',
        description: `Según tu historial reciente, eres más productivo ${timeSlot} (promedio: ${Math.round(data.avgProductivity * 10) / 10}/10)`,
        data: { hour, avgProductivity: data.avgProductivity, sessionCount: data.count },
        severity: 'medium',
        actionable: true,
        icon: '⭐'
      };
    }

    return null;
  }

  /**
   * Detecta logros y celebraciones recientes
   */
  private detectAchievements(tasks: any[], logs: any[], since: Date): HistoricalInsight[] {
    const insights: HistoricalInsight[] = [];

    // Tareas completadas recientemente
    const recentCompletions = tasks.filter(t => 
      t.status === 'completed' && 
      t.completed_at && 
      new Date(t.completed_at) >= since
    );

    if (recentCompletions.length >= 5) {
      insights.push({
        type: 'achievement',
        title: '🏆 ¡Racha productiva!',
        description: `Has completado ${recentCompletions.length} tareas en los últimos días. ¡Excelente trabajo!`,
        data: { completedCount: recentCompletions.length },
        severity: 'low',
        actionable: false,
        icon: '🏆'
      });
    }

    // Proyecto completado
    const completedProjects = recentCompletions
      .filter(t => t.project_id)
      .reduce((acc, task) => {
        acc[task.project_id] = (acc[task.project_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    Object.entries(completedProjects).forEach(([projectId, count]) => {
      if (typeof count === 'number' && count >= 3) {
        insights.push({
          type: 'achievement',
          title: '🎯 Proyecto en progreso avanzado',
          description: `Has completado ${count} tareas del mismo proyecto recientemente. ¡Vas muy bien!`,
          data: { projectId, tasksCompleted: count },
          severity: 'low',
          actionable: false,
          icon: '🎯'
        });
      }
    });

    return insights;
  }

  /**
   * Genera descripciones de franjas horarias
   */
  private generateTimeSlotDescriptions(hours: number[]): string[] {
    return hours.map(hour => this.formatHourRange(hour));
  }

  /**
   * Formatea una hora en un rango legible
   */
  private formatHourRange(hour: number): string {
    const nextHour = (hour + 1) % 24;
    return `entre las ${hour}:00 y ${nextHour}:00`;
  }

  /**
   * Función principal para generar análisis completo
   */
  generateAdvancedInsights(tasks: any[], logs: any[], sessions: any[]): {
    insights: HistoricalInsight[];
    productivity: ProductivityInsights;
  } {
    const insights = this.generateHistoricalInsights(tasks, logs, sessions);
    const productivity = this.analyzeProductivityPatterns(logs, sessions);

    return {
      insights,
      productivity
    };
  }
}