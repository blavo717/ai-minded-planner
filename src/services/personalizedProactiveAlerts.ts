/**
 * SPRINT 3 - PERSONALIZACIÓN COMPLETA
 * Servicio inteligente de alertas proactivas que se adapta completamente
 * a las preferencias, horarios y patrones del usuario
 */

import { Task } from '@/hooks/useTasks';
import { BasicProactiveAlerts, DeadlineAlert } from './basicProactiveAlerts';
import { supabase } from '@/integrations/supabase/client';

export interface UserProductivityPreferences {
  work_hours_start: number;
  work_hours_end: number;
  preferred_work_days: number[];
  energy_schedule: {
    high: number[];
    medium: number[];
    low: number[];
  };
  notification_frequency: number;
  focus_session_duration: number;
  break_duration: number;
  productivity_goals: {
    daily_tasks: number;
    weekly_tasks: number;
  };
  alert_preferences: {
    enabled: boolean;
    deadline_days_before: number[];
    allowed_hours: 'work_hours' | 'any_time' | 'energy_based';
    min_severity: 'low' | 'medium' | 'high';
    max_daily_alerts: number;
    respect_focus_time: boolean;
    custom_messages: boolean;
    alert_types: {
      deadline_warnings: boolean;
      productivity_reminders: boolean;
      task_health_alerts: boolean;
      achievement_celebrations: boolean;
    };
    timing_strategy: 'immediate' | 'smart' | 'batch';
    energy_based_timing: boolean;
  };
}

export interface AlertEffectivenessRecord {
  alert_id: string;
  alert_type: string;
  user_action: 'accepted' | 'dismissed' | 'ignored' | 'completed';
  relevance_score?: number;
  context_data: any;
}

export class PersonalizedProactiveAlerts extends BasicProactiveAlerts {
  private preferences: UserProductivityPreferences | null = null;
  private dailyAlertCount: number = 0;
  private lastAlertCheckDate: string = '';
  private userId: string;

  constructor(userId: string) {
    super();
    this.userId = userId;
  }

  /**
   * Cargar preferencias del usuario desde la base de datos
   */
  async loadUserPreferences(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_productivity_preferences')
        .select('*')
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user preferences:', error);
        return;
      }

      this.preferences = data as unknown as UserProductivityPreferences;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  /**
   * Verificar si las alertas están habilitadas para el usuario
   */
  private areAlertsEnabled(): boolean {
    return this.preferences?.alert_preferences?.enabled ?? true;
  }

  /**
   * Verificar si estamos en horario permitido para mostrar alertas
   */
  private isAllowedTime(): boolean {
    if (!this.preferences) return true;

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const { alert_preferences, work_hours_start, work_hours_end, preferred_work_days, energy_schedule } = this.preferences;

    // Verificar días laborales
    if (!preferred_work_days.includes(currentDay)) {
      return false;
    }

    // Estrategia de horarios permitidos
    switch (alert_preferences.allowed_hours) {
      case 'work_hours':
        return currentHour >= work_hours_start && currentHour <= work_hours_end;
      
      case 'energy_based':
        if (!alert_preferences.energy_based_timing) return true;
        // Priorizar horas de alta energía para alertas importantes
        return energy_schedule.high.includes(currentHour) || energy_schedule.medium.includes(currentHour);
      
      case 'any_time':
      default:
        return true;
    }
  }

  /**
   * Verificar si se ha alcanzado el límite diario de alertas
   */
  private hasReachedDailyLimit(): boolean {
    if (!this.preferences) return false;

    const today = new Date().toDateString();
    if (this.lastAlertCheckDate !== today) {
      this.dailyAlertCount = 0;
      this.lastAlertCheckDate = today;
    }

    return this.dailyAlertCount >= this.preferences.alert_preferences.max_daily_alerts;
  }

  /**
   * Obtener nivel de energía actual del usuario
   */
  private getCurrentEnergyLevel(): 'high' | 'medium' | 'low' {
    if (!this.preferences) return 'medium';

    const currentHour = new Date().getHours();
    const { energy_schedule } = this.preferences;

    if (energy_schedule.high.includes(currentHour)) return 'high';
    if (energy_schedule.medium.includes(currentHour)) return 'medium';
    return 'low';
  }

  /**
   * Calcular la severidad personalizada basada en contexto del usuario
   */
  private calculatePersonalizedSeverity(task: Task, daysUntilDue: number): DeadlineAlert['severity'] {
    if (!this.preferences) return this.calculateSeverity(task, daysUntilDue);

    const energyLevel = this.getCurrentEnergyLevel();
    const baseSeverity = this.calculateSeverity(task, daysUntilDue);
    
    // Ajustar severidad basada en energía y timing inteligente
    if (this.preferences.alert_preferences.energy_based_timing) {
      // En horas de alta energía, mostrar tareas más complejas como más urgentes
      if (energyLevel === 'high' && task.priority === 'high') {
        return 'high';
      }
      
      // En horas de baja energía, suavizar la urgencia
      if (energyLevel === 'low' && baseSeverity === 'high') {
        return 'medium';
      }
    }

    return baseSeverity;
  }

  /**
   * Generar mensajes personalizados basados en preferencias del usuario
   */
  private generatePersonalizedMessages(
    task: Task, 
    daysUntilDue: number, 
    severity: DeadlineAlert['severity']
  ): { title: string; message: string } {
    if (!this.preferences?.alert_preferences.custom_messages) {
      return this.generateAlertMessages(task, daysUntilDue, severity);
    }

    const energyLevel = this.getCurrentEnergyLevel();
    const timeText = daysUntilDue === 0 ? 'hoy' : 
                     daysUntilDue === 1 ? 'mañana' : 
                     `en ${daysUntilDue} días`;

    // Mensajes adaptativos según energía y objetivos
    const energyContext = {
      high: 'Tienes alta energía ahora, perfecto momento para tareas importantes',
      medium: 'Tu energía está estable, buen momento para avanzar',
      low: 'Considera una tarea más ligera si es posible'
    };

    const urgencyEmoji = severity === 'high' ? '🚨' : 
                        severity === 'medium' ? '⚠️' : '📅';

    let title = `${urgencyEmoji} Deadline personalizado`;
    let message = `La tarea "${task.title}" vence ${timeText}.`;

    // Contextualizar según energía y preferencias
    if (this.preferences.alert_preferences.energy_based_timing) {
      message += ` ${energyContext[energyLevel]}.`;
    }

    // Añadir sugerencia basada en objetivos
    const dailyGoal = this.preferences.productivity_goals.daily_tasks;
    message += ` Objetivo diario: ${dailyGoal} tareas.`;

    return { title, message };
  }

  /**
   * Generar acciones contextuales personalizadas
   */
  private generatePersonalizedActions(task: Task, daysUntilDue: number): string {
    if (!this.preferences) return 'Trabajar en esta tarea';

    const energyLevel = this.getCurrentEnergyLevel();
    const isInWorkHours = this.isAllowedTime();

    // Acciones basadas en contexto
    if (!isInWorkHours) {
      return 'Programar para mañana';
    }

    if (energyLevel === 'high' && task.priority === 'high') {
      return 'Trabajar ahora (momento ideal)';
    }

    if (energyLevel === 'low' && task.estimated_duration && task.estimated_duration > 60) {
      return 'Dividir en subtareas';
    }

    if (daysUntilDue === 0) {
      return 'Acción urgente requerida';
    }

    return 'Trabajar en esta tarea';
  }

  /**
   * Filtrar tareas basado en preferencias de tipos de alerta
   */
  private filterTasksByAlertTypes(tasks: Task[]): Task[] {
    if (!this.preferences?.alert_preferences.alert_types.deadline_warnings) {
      return [];
    }

    return tasks.filter(task => {
      // Aplicar filtros adicionales basados en preferencias
      const minSeverity = this.preferences!.alert_preferences.min_severity;
      const daysUntilDue = Math.ceil(
        (new Date(task.due_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const severity = this.calculatePersonalizedSeverity(task, daysUntilDue);
      
      // Filtrar por severidad mínima
      const severityOrder = { low: 1, medium: 2, high: 3 };
      return severityOrder[severity] >= severityOrder[minSeverity];
    });
  }

  /**
   * Registrar efectividad de alerta para aprendizaje
   */
  async recordAlertEffectiveness(record: AlertEffectivenessRecord): Promise<void> {
    try {
      await supabase
        .from('alert_effectiveness_tracking')
        .insert({
          user_id: this.userId,
          ...record,
          shown_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to record alert effectiveness:', error);
    }
  }

  /**
   * Método principal personalizado para detectar alertas
   */
  async checkForPersonalizedDeadlineAlerts(tasks: Task[], sessionId: string): Promise<DeadlineAlert | null> {
    // Cargar preferencias si no están cargadas
    if (!this.preferences) {
      await this.loadUserPreferences();
    }

    // Verificaciones de habilitación y límites
    if (!this.areAlertsEnabled()) {
      return null;
    }

    if (!this.isAllowedTime()) {
      return null;
    }

    if (this.hasReachedDailyLimit()) {
      return null;
    }

    // Control de frecuencia personalizada
    if (this.lastAlertSession === sessionId) {
      return null;
    }

    // Filtrar tareas según preferencias
    const filteredTasks = this.filterTasksByAlertTypes(tasks);
    if (filteredTasks.length === 0) {
      return null;
    }

    // Usar días personalizados para filtrado
    const allowedDays = this.preferences?.alert_preferences.deadline_days_before || [0, 1, 2];
    const now = new Date();
    
    const upcomingTasks = filteredTasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      
      const dueDate = new Date(task.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return allowedDays.includes(daysUntilDue) && daysUntilDue >= 0;
    });

    if (upcomingTasks.length === 0) {
      return null;
    }

    // Priorización inteligente
    const prioritizedTask = upcomingTasks.sort((a, b) => {
      // Usar scoring personalizado
      const scoreA = this.calculateTaskPriorityScore(a);
      const scoreB = this.calculateTaskPriorityScore(b);
      return scoreB - scoreA;
    })[0];

    const daysUntilDue = Math.ceil(
      (new Date(prioritizedTask.due_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Incrementar contador y marcar sesión
    this.dailyAlertCount++;
    this.lastAlertSession = sessionId;

    return this.createPersonalizedDeadlineAlert(prioritizedTask, daysUntilDue);
  }

  /**
   * Calcular score de prioridad personalizado
   */
  private calculateTaskPriorityScore(task: Task): number {
    let score = 0;
    
    // Score base por prioridad
    const priorityScores = { urgent: 100, high: 75, medium: 50, low: 25 };
    score += priorityScores[task.priority];
    
    // Bonus por energía requerida vs disponible
    if (this.preferences?.alert_preferences.energy_based_timing) {
      const energyLevel = this.getCurrentEnergyLevel();
      const taskEnergyNeeded = this.estimateTaskEnergyNeeded(task);
      
      if (energyLevel === taskEnergyNeeded) {
        score += 25; // Bonus por match perfecto
      }
    }
    
    // Penalty por duración si estamos en baja energía
    if (task.estimated_duration && task.estimated_duration > 60 && this.getCurrentEnergyLevel() === 'low') {
      score -= 20;
    }
    
    return score;
  }

  /**
   * Estimar energía requerida para una tarea
   */
  private estimateTaskEnergyNeeded(task: Task): 'high' | 'medium' | 'low' {
    if (task.priority === 'urgent' || task.priority === 'high') return 'high';
    if (task.estimated_duration && task.estimated_duration > 60) return 'medium';
    return 'low';
  }

  /**
   * Crear alerta personalizada
   */
  private createPersonalizedDeadlineAlert(task: Task, daysUntilDue: number): DeadlineAlert {
    const severity = this.calculatePersonalizedSeverity(task, daysUntilDue);
    const { title, message } = this.generatePersonalizedMessages(task, daysUntilDue, severity);
    const actionLabel = this.generatePersonalizedActions(task, daysUntilDue);
    
    return {
      id: `personalized_alert_${task.id}_${Date.now()}`,
      type: 'deadline_warning',
      severity,
      title,
      message,
      task,
      daysUntilDue,
      actionLabel,
      actionType: 'work_on_task'
    };
  }

  /**
   * Crear preferencias por defecto si no existen
   */
  async ensureDefaultPreferences(): Promise<void> {
    if (this.preferences) return;

    try {
      const { data: existing } = await supabase
        .from('user_productivity_preferences')
        .select('id')
        .eq('user_id', this.userId)
        .single();

      if (!existing) {
        await supabase
          .from('user_productivity_preferences')
          .insert({
            user_id: this.userId,
            work_hours_start: 9,
            work_hours_end: 17,
            preferred_work_days: [1, 2, 3, 4, 5],
            energy_schedule: {
              high: [9, 10, 11],
              medium: [12, 13, 14, 15, 16],
              low: [17, 18, 19]
            },
            notification_frequency: 30,
            focus_session_duration: 25,
            break_duration: 5,
            productivity_goals: {
              daily_tasks: 3,
              weekly_tasks: 15
            }
          });
      }

      await this.loadUserPreferences();
    } catch (error) {
      console.error('Failed to ensure default preferences:', error);
    }
  }
}