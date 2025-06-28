
import { WorkPattern, TemporalPattern, TaskTypePattern, DurationPattern, ProductivityPattern, BlockagePattern, PatternAnalysisResult, PatternInsight, PatternRecommendation, PatternAnalysisConfig } from '@/types/ai-patterns';
import { Task } from '@/hooks/useTasks';
import { format, isWithinInterval, subDays, getHours, getDay } from 'date-fns';

export class PatternAnalyzer {
  private config: PatternAnalysisConfig;

  constructor(config: Partial<PatternAnalysisConfig> = {}) {
    this.config = {
      minDataPoints: 10,
      confidenceThreshold: 0.6,
      analysisWindowDays: 30,
      enableTemporalAnalysis: true,
      enableTaskTypeAnalysis: true,
      enableDurationAnalysis: true,
      enableProductivityAnalysis: true,
      enableBlockageDetection: true,
      ...config,
    };
  }

  /**
   * Análisis principal que coordina todos los tipos de análisis
   */
  public async analyzePatterns(
    tasks: Task[],
    taskSessions: any[] = [],
    workPatterns: any[] = []
  ): Promise<PatternAnalysisResult> {
    const patterns: WorkPattern[] = [];
    const insights: PatternInsight[] = [];
    const recommendations: PatternRecommendation[] = [];

    // Filtrar datos dentro de la ventana de análisis
    const analysisWindow = subDays(new Date(), this.config.analysisWindowDays);
    const recentTasks = tasks.filter(task => 
      task.created_at && new Date(task.created_at) >= analysisWindow
    );
    const recentSessions = taskSessions.filter(session => 
      session.started_at && new Date(session.started_at) >= analysisWindow
    );

    // Verificar calidad de datos
    const dataQuality = this.assessDataQuality(recentTasks, recentSessions);
    
    if (dataQuality === 'low') {
      return {
        patterns,
        insights: [{
          type: 'neutral',
          title: 'Datos insuficientes',
          description: 'Se necesitan más datos de actividad para generar análisis de patrones significativos.',
          pattern_ids: [],
          priority: 3,
          actionable: false,
        }],
        recommendations: [],
        confidence: 0.1,
        dataQuality,
      };
    }

    try {
      // Análisis temporal
      if (this.config.enableTemporalAnalysis) {
        const temporalPatterns = this.analyzeTemporalPatterns(recentTasks, recentSessions, workPatterns);
        patterns.push(...temporalPatterns);
      }

      // Análisis de tipos de tareas
      if (this.config.enableTaskTypeAnalysis) {
        const taskTypePatterns = this.analyzeTaskTypePatterns(recentTasks);
        patterns.push(...taskTypePatterns);
      }

      // Análisis de duraciones
      if (this.config.enableDurationAnalysis) {
        const durationPatterns = this.analyzeDurationPatterns(recentTasks, recentSessions);
        patterns.push(...durationPatterns);
      }

      // Análisis de productividad
      if (this.config.enableProductivityAnalysis) {
        const productivityPatterns = this.analyzeProductivityPatterns(recentSessions);
        patterns.push(...productivityPatterns);
      }

      // Detección de bloqueos
      if (this.config.enableBlockageDetection) {
        const blockagePatterns = this.detectBlockagePatterns(recentTasks);
        patterns.push(...blockagePatterns);
      }

      // Generar insights basados en patrones
      const generatedInsights = this.generateInsights(patterns);
      insights.push(...generatedInsights);

      // Generar recomendaciones
      const generatedRecommendations = this.generateRecommendations(patterns);
      recommendations.push(...generatedRecommendations);

      const overallConfidence = this.calculateOverallConfidence(patterns);

      return {
        patterns,
        insights,
        recommendations,
        confidence: overallConfidence,
        dataQuality,
      };

    } catch (error) {
      console.error('Error in pattern analysis:', error);
      return {
        patterns: [],
        insights: [{
          type: 'negative',
          title: 'Error en análisis',
          description: 'Ocurrió un error durante el análisis de patrones. Intentando nuevamente más tarde.',
          pattern_ids: [],
          priority: 2,
          actionable: false,
        }],
        recommendations: [],
        confidence: 0,
        dataQuality: 'low',
      };
    }
  }

  /**
   * Análisis de patrones temporales
   */
  private analyzeTemporalPatterns(
    tasks: Task[],
    sessions: any[],
    workPatterns: any[]
  ): TemporalPattern[] {
    const patterns: TemporalPattern[] = [];
    const hourlyStats: Record<number, { completions: number; totalTime: number; productivity: number[] }> = {};

    // Analizar completaciones por hora
    const completedTasks = tasks.filter(task => task.status === 'completed' && task.completed_at);
    
    completedTasks.forEach(task => {
      if (task.completed_at) {
        const hour = getHours(new Date(task.completed_at));
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { completions: 0, totalTime: 0, productivity: [] };
        }
        hourlyStats[hour].completions++;
        if (task.actual_duration) {
          hourlyStats[hour].totalTime += task.actual_duration;
        }
      }
    });

    // Incorporar datos de sesiones para productividad
    sessions.forEach(session => {
      if (session.started_at && session.productivity_score) {
        const hour = getHours(new Date(session.started_at));
        if (hourlyStats[hour]) {
          hourlyStats[hour].productivity.push(session.productivity_score);
        }
      }
    });

    // Crear patrones para horas con suficientes datos
    Object.entries(hourlyStats).forEach(([hourStr, stats]) => {
      const hour = parseInt(hourStr);
      if (stats.completions >= 3) { // Mínimo 3 completaciones para considerar patrón
        const avgProductivity = stats.productivity.length > 0 
          ? stats.productivity.reduce((a, b) => a + b, 0) / stats.productivity.length 
          : 0;
        
        const avgDuration = stats.totalTime > 0 ? stats.totalTime / stats.completions : 0;

        patterns.push({
          id: `temporal-hour-${hour}`,
          type: 'temporal',
          confidence: Math.min(stats.completions / 10, 0.9), // Máx 0.9 confidence
          frequency: stats.completions,
          data: {
            hour,
            dayOfWeek: -1, // No específico del día
            productivity_score: avgProductivity,
            tasks_completed: stats.completions,
            average_duration: avgDuration,
          },
          insights: this.generateTemporalInsights(hour, stats.completions, avgProductivity),
          createdAt: new Date(),
          lastObserved: new Date(),
        });
      }
    });

    return patterns;
  }

  /**
   * Análisis de patrones por tipo de tarea
   */
  private analyzeTaskTypePatterns(tasks: Task[]): TaskTypePattern[] {
    const patterns: TaskTypePattern[] = [];
    const priorityStats: Record<string, { total: number; completed: number; durations: number[] }> = {};

    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      if (!priorityStats[priority]) {
        priorityStats[priority] = { total: 0, completed: 0, durations: [] };
      }
      priorityStats[priority].total++;
      if (task.status === 'completed') {
        priorityStats[priority].completed++;
        if (task.actual_duration) {
          priorityStats[priority].durations.push(task.actual_duration);
        }
      }
    });

    Object.entries(priorityStats).forEach(([priority, stats]) => {
      if (stats.total >= this.config.minDataPoints) {
        const completionRate = stats.completed / stats.total;
        const avgDuration = stats.durations.length > 0 
          ? stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length 
          : 0;

        patterns.push({
          id: `task-type-priority-${priority}`,
          type: 'task_type',
          confidence: Math.min(stats.total / 20, 0.8),
          frequency: stats.total,
          data: {
            task_priority: priority,
            task_category: 'general',
            completion_rate: completionRate,
            average_completion_time: avgDuration,
            common_blockers: [], // Se podría expandir con más análisis
          },
          insights: this.generateTaskTypeInsights(priority, completionRate, avgDuration),
          createdAt: new Date(),
          lastObserved: new Date(),
        });
      }
    });

    return patterns;
  }

  /**
   * Análisis de patrones de duración
   */
  private analyzeDurationPatterns(tasks: Task[], sessions: any[]): DurationPattern[] {
    const patterns: DurationPattern[] = [];
    const durationStats: Record<string, { estimated: number[]; actual: number[] }> = {};

    tasks
      .filter(task => task.estimated_duration && task.actual_duration)
      .forEach(task => {
        const type = task.priority || 'general';
        if (!durationStats[type]) {
          durationStats[type] = { estimated: [], actual: [] };
        }
        durationStats[type].estimated.push(task.estimated_duration!);
        durationStats[type].actual.push(task.actual_duration!);
      });

    Object.entries(durationStats).forEach(([type, stats]) => {
      if (stats.estimated.length >= 5) {
        const estimatedAvg = stats.estimated.reduce((a, b) => a + b, 0) / stats.estimated.length;
        const actualAvg = stats.actual.reduce((a, b) => a + b, 0) / stats.actual.length;
        const ratio = actualAvg / estimatedAvg;

        const sortedActual = stats.actual.sort((a, b) => a - b);
        const q1 = sortedActual[Math.floor(sortedActual.length * 0.25)];
        const q3 = sortedActual[Math.floor(sortedActual.length * 0.75)];

        patterns.push({
          id: `duration-${type}`,
          type: 'duration',
          confidence: Math.min(stats.estimated.length / 15, 0.8),
          frequency: stats.estimated.length,
          data: {
            task_type: type,
            estimated_vs_actual: ratio,
            optimal_duration_range: [q1, q3],
            productivity_correlation: 0, // Se podría calcular con datos de sesiones
          },
          insights: this.generateDurationInsights(type, ratio, [q1, q3]),
          createdAt: new Date(),
          lastObserved: new Date(),
        });
      }
    });

    return patterns;
  }

  /**
   * Análisis de patrones de productividad
   */
  private analyzeProductivityPatterns(sessions: any[]): ProductivityPattern[] {
    const patterns: ProductivityPattern[] = [];
    
    if (sessions.length < 5) return patterns;

    const morningScores = sessions
      .filter(s => s.started_at && getHours(new Date(s.started_at)) < 12)
      .map(s => s.productivity_score)
      .filter(s => s > 0);

    const afternoonScores = sessions
      .filter(s => s.started_at && getHours(new Date(s.started_at)) >= 12)
      .map(s => s.productivity_score)
      .filter(s => s > 0);

    if (morningScores.length >= 3) {
      const avgMorning = morningScores.reduce((a, b) => a + b, 0) / morningScores.length;
      patterns.push({
        id: 'productivity-morning',
        type: 'productivity',
        confidence: Math.min(morningScores.length / 10, 0.8),
        frequency: morningScores.length,
        data: {
          context: 'morning',
          productivity_score: avgMorning,
          tasks_completed: 0, // Se podría correlacionar
          quality_indicators: { focus: avgMorning },
        },
        insights: [`Productividad matutina promedio: ${avgMorning.toFixed(1)}/5`],
        createdAt: new Date(),
        lastObserved: new Date(),
      });
    }

    if (afternoonScores.length >= 3) {
      const avgAfternoon = afternoonScores.reduce((a, b) => a + b, 0) / afternoonScores.length;
      patterns.push({
        id: 'productivity-afternoon',
        type: 'productivity',
        confidence: Math.min(afternoonScores.length / 10, 0.8),
        frequency: afternoonScores.length,
        data: {
          context: 'afternoon',
          productivity_score: avgAfternoon,
          tasks_completed: 0,
          quality_indicators: { focus: avgAfternoon },
        },
        insights: [`Productividad vespertina promedio: ${avgAfternoon.toFixed(1)}/5`],
        createdAt: new Date(),
        lastObserved: new Date(),
      });
    }

    return patterns;
  }

  /**
   * Detección de patrones de bloqueo
   */
  private detectBlockagePatterns(tasks: Task[]): BlockagePattern[] {
    const patterns: BlockagePattern[] = [];
    
    // Tareas que llevan mucho tiempo sin actualizarse
    const stuckTasks = tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      if (!task.updated_at) return false;
      
      const daysSinceUpdate = (new Date().getTime() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7; // Más de 7 días sin actualizar
    });

    if (stuckTasks.length >= 3) {
      const commonPriorities = stuckTasks.reduce((acc: Record<string, number>, task) => {
        const priority = task.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {});

      patterns.push({
        id: 'blockage-stuck-tasks',
        type: 'blockage',
        confidence: Math.min(stuckTasks.length / 10, 0.8),
        frequency: stuckTasks.length,
        data: {
          common_blockers: ['lack_of_progress', 'no_recent_updates'],
          average_block_duration: 7 * 24 * 60, // 7 días en minutos
          resolution_patterns: ['task_breakdown', 'priority_review'],
          prevention_suggestions: [
            'Establecer recordatorios regulares',
            'Dividir tareas grandes en subtareas',
            'Revisar prioridades semanalmente'
          ],
        },
        insights: [
          `${stuckTasks.length} tareas llevan más de 7 días sin actualizarse`,
          `Prioridades más afectadas: ${Object.keys(commonPriorities).join(', ')}`
        ],
        createdAt: new Date(),
        lastObserved: new Date(),
      });
    }

    return patterns;
  }

  /**
   * Generar insights basados en patrones detectados
   */
  private generateInsights(patterns: WorkPattern[]): PatternInsight[] {
    const insights: PatternInsight[] = [];

    // Insights de patrones temporales
    const temporalPatterns = patterns.filter(p => p.type === 'temporal') as TemporalPattern[];
    const bestHours = temporalPatterns
      .filter(p => p.data.productivity_score >= 4)
      .map(p => p.data.hour);

    if (bestHours.length > 0) {
      insights.push({
        type: 'positive',
        title: 'Horarios de alta productividad identificados',
        description: `Trabajas mejor entre las ${Math.min(...bestHours)}:00 y ${Math.max(...bestHours)}:00`,
        pattern_ids: temporalPatterns.map(p => p.id),
        priority: 1,
        actionable: true,
      });
    }

    // Insights de duraciones
    const durationPatterns = patterns.filter(p => p.type === 'duration') as DurationPattern[];
    const underestimated = durationPatterns.filter(p => p.data.estimated_vs_actual > 1.5);
    
    if (underestimated.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Patrones de subestimación detectados',
        description: `Tiendes a subestimar el tiempo en tareas de tipo: ${underestimated.map(p => p.data.task_type).join(', ')}`,
        pattern_ids: underestimated.map(p => p.id),
        priority: 2,
        actionable: true,
      });
    }

    return insights;
  }

  /**
   * Generar recomendaciones basadas en patrones
   */
  private generateRecommendations(patterns: WorkPattern[]): PatternRecommendation[] {
    const recommendations: PatternRecommendation[] = [];

    // Recomendaciones temporales
    const temporalPatterns = patterns.filter(p => p.type === 'temporal') as TemporalPattern[];
    const highProductivityHours = temporalPatterns
      .filter(p => p.data.productivity_score >= 4)
      .map(p => p.data.hour);

    if (highProductivityHours.length > 0) {
      recommendations.push({
        id: 'schedule-important-tasks',
        type: 'timing',
        title: 'Programar tareas importantes en horarios óptimos',
        description: `Agenda las tareas más importantes entre las ${Math.min(...highProductivityHours)}:00 y ${Math.max(...highProductivityHours)}:00`,
        expectedImpact: 'high',
        effort: 'low',
        basedOnPatterns: temporalPatterns.map(p => p.id),
      });
    }

    // Recomendaciones de duración
    const durationPatterns = patterns.filter(p => p.type === 'duration') as DurationPattern[];
    if (durationPatterns.some(p => p.data.estimated_vs_actual > 1.3)) {
      recommendations.push({
        id: 'improve-estimation',
        type: 'task_management',
        title: 'Mejorar estimaciones de tiempo',
        description: 'Considera añadir un 30-50% más de tiempo a tus estimaciones iniciales',
        expectedImpact: 'medium',
        effort: 'low',
        basedOnPatterns: durationPatterns.map(p => p.id),
      });
    }

    return recommendations;
  }

  /**
   * Métodos auxiliares para generar insights específicos
   */
  private generateTemporalInsights(hour: number, completions: number, productivity: number): string[] {
    const insights: string[] = [];
    
    if (productivity >= 4) {
      insights.push(`Hora de alta productividad (${productivity.toFixed(1)}/5)`);
    }
    if (completions >= 5) {
      insights.push(`Hora de alta completación (${completions} tareas completadas)`);
    }
    
    return insights;
  }

  private generateTaskTypeInsights(priority: string, completionRate: number, avgDuration: number): string[] {
    const insights: string[] = [];
    
    if (completionRate >= 0.8) {
      insights.push(`Alta tasa de completación para tareas ${priority} (${(completionRate * 100).toFixed(0)}%)`);
    } else if (completionRate <= 0.5) {
      insights.push(`Baja tasa de completación para tareas ${priority} (${(completionRate * 100).toFixed(0)}%)`);
    }
    
    if (avgDuration > 0) {
      insights.push(`Duración promedio: ${Math.round(avgDuration)} minutos`);
    }
    
    return insights;
  }

  private generateDurationInsights(type: string, ratio: number, range: [number, number]): string[] {
    const insights: string[] = [];
    
    if (ratio > 1.5) {
      insights.push(`Subestimas consistentemente tareas ${type} (${(ratio * 100 - 100).toFixed(0)}% más tiempo del estimado)`);
    } else if (ratio < 0.8) {
      insights.push(`Sobreestimas tareas ${type} (${(100 - ratio * 100).toFixed(0)}% menos tiempo del estimado)`);
    }
    
    insights.push(`Rango óptimo de duración: ${Math.round(range[0])}-${Math.round(range[1])} minutos`);
    
    return insights;
  }

  /**
   * Evaluar calidad de datos para análisis
   */
  private assessDataQuality(tasks: Task[], sessions: any[]): 'low' | 'medium' | 'high' {
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalSessions = sessions.length;
    const tasksWithDuration = tasks.filter(t => t.actual_duration).length;

    if (completedTasks < 5 && totalSessions < 3) return 'low';
    if (completedTasks >= 5 && completedTasks < 15 && totalSessions >= 3) return 'medium';
    if (completedTasks >= 15 && totalSessions >= 10 && tasksWithDuration >= 5) return 'high';
    
    return 'medium';
  }

  /**
   * Calcular confianza general del análisis
   */
  private calculateOverallConfidence(patterns: WorkPattern[]): number {
    if (patterns.length === 0) return 0;
    
    const avgConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const dataBonus = Math.min(patterns.length / 10, 0.2); // Bonus por cantidad de patrones
    
    return Math.min(avgConfidence + dataBonus, 1.0);
  }
}

// Instancia por defecto con configuración estándar
export const defaultPatternAnalyzer = new PatternAnalyzer();
