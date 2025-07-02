import { Task } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';

export interface UserProductivityProfile {
  optimalHours: number[];
  optimalDays: string[];
  avgTaskDuration: number;
  completionRate: number;
  preferredTags: string[];
  procrastinationTriggers: string[];
  energyPeakHours: number[];
  productivePatterns: string[];
}

export interface BehaviorInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'trend';
  title: string;
  description: string;
  confidence: number;
  actionableSuggestion: string;
  dataPoints: number;
}

export interface UserPattern {
  pattern_type: 'completion_time' | 'productivity_hours' | 'task_preferences' | 'procrastination';
  pattern_data: any;
  confidence: number;
}

export class UserBehaviorAnalyzer {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async analyzeUserBehavior(): Promise<{
    profile: UserProductivityProfile;
    insights: BehaviorInsight[];
    patterns: UserPattern[];
  }> {
    try {
      const [tasks, taskLogs] = await Promise.all([
        this.getUserTasks(),
        this.getUserTaskLogs()
      ]);

      const profile = this.generateProductivityProfile(tasks, taskLogs);
      const patterns = this.detectPatterns(tasks, taskLogs);
      const insights = this.generateInsights(profile, patterns, tasks);

      return { profile, insights, patterns };
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      return {
        profile: this.getDefaultProfile(),
        insights: [],
        patterns: []
      };
    }
  }

  async getUserTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return (data || []) as Task[];
  }

  async getUserTaskLogs(): Promise<any[]> {
    const { data, error } = await supabase
      .from('task_logs')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return data || [];
  }

  generateProductivityProfile(tasks: Task[], taskLogs: any[]): UserProductivityProfile {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    // Análizar horarios óptimos
    const optimalHours = this.analyzeOptimalHours(completedTasks);
    
    // Analizar días productivos
    const optimalDays = this.analyzeOptimalDays(completedTasks);
    
    // Duración promedio
    const avgTaskDuration = this.calculateAverageTaskDuration(completedTasks);
    
    // Tasa de completación
    const completionRate = completedTasks.length / Math.max(tasks.length, 1) * 100;
    
    // Tags preferidos
    const preferredTags = this.analyzePreferredTags(completedTasks);
    
    // Triggers de procrastinación
    const procrastinationTriggers = this.analyzeProcrastinationTriggers(tasks);
    
    // Horas pico de energía
    const energyPeakHours = this.analyzeEnergyPeakHours(taskLogs);
    
    // Patrones productivos
    const productivePatterns = this.analyzeProductivePatterns(completedTasks, taskLogs);

    return {
      optimalHours,
      optimalDays,
      avgTaskDuration,
      completionRate,
      preferredTags,
      procrastinationTriggers,
      energyPeakHours,
      productivePatterns
    };
  }

  detectPatterns(tasks: Task[], taskLogs: any[]): UserPattern[] {
    const patterns: UserPattern[] = [];

    // Patrón de horarios de completación
    const completionTimePattern = this.detectCompletionTimePattern(tasks);
    if (completionTimePattern) {
      patterns.push({
        pattern_type: 'completion_time',
        pattern_data: completionTimePattern,
        confidence: 0.8
      });
    }

    // Patrón de horas productivas
    const productivityHoursPattern = this.detectProductivityHoursPattern(taskLogs);
    if (productivityHoursPattern) {
      patterns.push({
        pattern_type: 'productivity_hours',
        pattern_data: productivityHoursPattern,
        confidence: 0.75
      });
    }

    // Patrón de preferencias de tareas
    const taskPreferencesPattern = this.detectTaskPreferencesPattern(tasks);
    if (taskPreferencesPattern) {
      patterns.push({
        pattern_type: 'task_preferences',
        pattern_data: taskPreferencesPattern,
        confidence: 0.7
      });
    }

    return patterns;
  }

  generateInsights(profile: UserProductivityProfile, patterns: UserPattern[], tasks: Task[]): BehaviorInsight[] {
    const insights: BehaviorInsight[] = [];

    // Insight sobre horarios óptimos
    if (profile.optimalHours.length > 0) {
      insights.push({
        type: 'strength',
        title: 'Horarios de alta productividad identificados',
        description: `Eres más productivo entre las ${profile.optimalHours[0]}:00 y ${profile.optimalHours[profile.optimalHours.length - 1]}:00`,
        confidence: 85,
        actionableSuggestion: 'Programa tus tareas más importantes durante estas horas',
        dataPoints: profile.optimalHours.length
      });
    }

    // Insight sobre tasa de completación
    if (profile.completionRate < 70) {
      insights.push({
        type: 'weakness',
        title: 'Tasa de completación baja',
        description: `Solo completas el ${Math.round(profile.completionRate)}% de tus tareas`,
        confidence: 90,
        actionableSuggestion: 'Considera crear tareas más pequeñas y específicas',
        dataPoints: tasks.length
      });
    } else if (profile.completionRate > 85) {
      insights.push({
        type: 'strength',
        title: 'Excelente tasa de completación',
        description: `Completas el ${Math.round(profile.completionRate)}% de tus tareas`,
        confidence: 95,
        actionableSuggestion: 'Podrías desafiarte con tareas más ambiciosas',
        dataPoints: tasks.length
      });
    }

    // Insight sobre duración de tareas
    if (profile.avgTaskDuration > 120) {
      insights.push({
        type: 'opportunity',
        title: 'Las tareas tienden a ser largas',
        description: `Tu duración promedio es de ${Math.round(profile.avgTaskDuration)} minutos`,
        confidence: 80,
        actionableSuggestion: 'Intenta dividir tareas grandes en subtareas más manejables',
        dataPoints: tasks.filter(t => t.actual_duration).length
      });
    }

    // Insight sobre preferencias de tags
    if (profile.preferredTags.length > 0) {
      insights.push({
        type: 'trend',
        title: 'Patrones de preferencia identificados',
        description: `Tienes mejor desempeño en tareas de: ${profile.preferredTags.slice(0, 3).join(', ')}`,
        confidence: 75,
        actionableSuggestion: 'Aprovecha estas fortalezas para tareas importantes',
        dataPoints: profile.preferredTags.length
      });
    }

    return insights;
  }

  private analyzeOptimalHours(completedTasks: Task[]): number[] {
    const hourCounts: { [hour: number]: number } = {};
    
    completedTasks.forEach(task => {
      if (task.completed_at) {
        const hour = new Date(task.completed_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    // Encontrar las 3-4 horas con más completaciones
    const sortedHours = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 4)
      .map(([hour]) => parseInt(hour))
      .sort((a, b) => a - b);

    return sortedHours;
  }

  private analyzeOptimalDays(completedTasks: Task[]): string[] {
    const dayCounts: { [day: string]: number } = {};
    
    completedTasks.forEach(task => {
      if (task.completed_at) {
        const day = new Date(task.completed_at).toLocaleDateString('es-ES', { weekday: 'long' });
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      }
    });

    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  }

  private calculateAverageTaskDuration(completedTasks: Task[]): number {
    const tasksWithDuration = completedTasks.filter(t => t.actual_duration);
    if (tasksWithDuration.length === 0) return 60; // Default 1 hour
    
    const totalDuration = tasksWithDuration.reduce((sum, task) => sum + (task.actual_duration || 0), 0);
    return totalDuration / tasksWithDuration.length;
  }

  private analyzePreferredTags(completedTasks: Task[]): string[] {
    const tagCounts: { [tag: string]: number } = {};
    
    completedTasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private analyzeProcrastinationTriggers(tasks: Task[]): string[] {
    const triggers: string[] = [];
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    
    // Tareas pendientes por más de 7 días
    const oldPendingTasks = pendingTasks.filter(t => {
      const daysSinceCreated = (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreated > 7;
    });

    if (oldPendingTasks.length > 3) {
      triggers.push('Tareas sin fecha límite');
    }

    // Tareas con estimaciones altas
    const highEstimationTasks = pendingTasks.filter(t => t.estimated_duration && t.estimated_duration > 120);
    if (highEstimationTasks.length > pendingTasks.length * 0.3) {
      triggers.push('Tareas con duración estimada alta');
    }

    return triggers;
  }

  private analyzeEnergyPeakHours(taskLogs: any[]): number[] {
    // Análisis básico basado en logs de actividad
    const activityHours: { [hour: number]: number } = {};
    
    taskLogs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      activityHours[hour] = (activityHours[hour] || 0) + 1;
    });

    return Object.entries(activityHours)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  }

  private analyzeProductivePatterns(completedTasks: Task[], taskLogs: any[]): string[] {
    const patterns: string[] = [];
    
    // Patrón de completación matutina
    const morningCompletions = completedTasks.filter(t => {
      if (!t.completed_at) return false;
      const hour = new Date(t.completed_at).getHours();
      return hour >= 6 && hour <= 11;
    });

    if (morningCompletions.length > completedTasks.length * 0.4) {
      patterns.push('Productividad matutina alta');
    }

    // Patrón de trabajo concentrado
    const intensiveDays = this.findIntensiveWorkDays(taskLogs);
    if (intensiveDays > 0) {
      patterns.push('Períodos de trabajo intensivo');
    }

    return patterns;
  }

  private detectCompletionTimePattern(tasks: Task[]): any {
    const completedTasks = tasks.filter(t => t.completed_at);
    if (completedTasks.length < 5) return null;

    const hourFrequency: { [hour: number]: number } = {};
    completedTasks.forEach(task => {
      const hour = new Date(task.completed_at!).getHours();
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      peak_hour: parseInt(peakHour[0]),
      frequency: peakHour[1],
      total_completions: completedTasks.length
    };
  }

  private detectProductivityHoursPattern(taskLogs: any[]): any {
    if (taskLogs.length < 10) return null;

    const hourActivity: { [hour: number]: number } = {};
    taskLogs.forEach(log => {
      const hour = new Date(log.created_at).getHours();
      hourActivity[hour] = (hourActivity[hour] || 0) + 1;
    });

    const sortedHours = Object.entries(hourActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return {
      productive_hours: sortedHours.map(([hour]) => parseInt(hour)),
      activity_distribution: hourActivity
    };
  }

  private detectTaskPreferencesPattern(tasks: Task[]): any {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (completedTasks.length < 5) return null;

    const prioritySuccess: { [priority: string]: { completed: number; total: number } } = {};
    
    tasks.forEach(task => {
      if (!prioritySuccess[task.priority]) {
        prioritySuccess[task.priority] = { completed: 0, total: 0 };
      }
      prioritySuccess[task.priority].total++;
      if (task.status === 'completed') {
        prioritySuccess[task.priority].completed++;
      }
    });

    const preferenceData = Object.entries(prioritySuccess).map(([priority, data]) => ({
      priority,
      success_rate: data.completed / data.total,
      sample_size: data.total
    }));

    return {
      preferences: preferenceData.sort((a, b) => b.success_rate - a.success_rate)
    };
  }

  private findIntensiveWorkDays(taskLogs: any[]): number {
    const dailyActivity: { [date: string]: number } = {};
    
    taskLogs.forEach(log => {
      const date = new Date(log.created_at).toDateString();
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    // Días con más de 10 logs de actividad
    return Object.values(dailyActivity).filter(count => count > 10).length;
  }

  private getDefaultProfile(): UserProductivityProfile {
    return {
      optimalHours: [9, 10, 11],
      optimalDays: ['lunes', 'martes', 'miércoles'],
      avgTaskDuration: 60,
      completionRate: 75,
      preferredTags: [],
      procrastinationTriggers: [],
      energyPeakHours: [9, 14],
      productivePatterns: []
    };
  }
}