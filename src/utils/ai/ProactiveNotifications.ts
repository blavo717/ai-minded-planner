
import { ProactiveNotification, NotificationTrigger, NotificationCondition, NotificationConfig, NotificationDeliveryResult } from '@/types/proactive-notifications';
import { AIInsight } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { Task } from '@/hooks/useTasks';
import { TaskSession } from '@/hooks/useTaskSessions';
import { format, isWithinInterval, startOfDay, endOfDay, addHours, subHours, getHours } from 'date-fns';

export class ProactiveNotificationManager {
  private config: NotificationConfig;
  private triggers: NotificationTrigger[] = [];
  private activeNotifications: ProactiveNotification[] = [];
  private deliveryQueue: ProactiveNotification[] = [];

  constructor(config: Partial<NotificationConfig> = {}) {
    this.config = {
      enableProductivityReminders: true,
      enableTaskHealthAlerts: true,
      enableDeadlineWarnings: true,
      enableAchievementCelebrations: true,
      quietHoursStart: 22, // 10 PM
      quietHoursEnd: 8,    // 8 AM
      maxNotificationsPerHour: 5,
      priorities: {
        enableHigh: true,
        enableMedium: true,
        enableLow: false,
      },
      ...config,
    };
    
    this.initializeDefaultTriggers();
  }

  /**
   * Procesa insights y genera notificaciones proactivas
   */
  public async processInsights(
    insights: AIInsight[],
    patternAnalysis: PatternAnalysisResult,
    tasks: Task[],
    sessions: TaskSession[]
  ): Promise<ProactiveNotification[]> {
    const notifications: ProactiveNotification[] = [];
    const currentTime = new Date();

    // Filtrar insights de alta prioridad y no leídos
    const criticalInsights = insights.filter(insight => 
      insight.priority === 1 && 
      !insight.readAt && 
      !insight.dismissedAt &&
      insight.category === 'critical'
    );

    // Generar notificaciones basadas en insights críticos
    for (const insight of criticalInsights) {
      const notification = this.createNotificationFromInsight(insight);
      if (notification && this.shouldDeliverNotification(notification)) {
        notifications.push(notification);
      }
    }

    // Generar notificaciones basadas en patrones
    const patternNotifications = this.generatePatternBasedNotifications(
      patternAnalysis,
      tasks,
      sessions,
      currentTime
    );
    notifications.push(...patternNotifications);

    // Generar recordatorios proactivos
    const proactiveReminders = this.generateProactiveReminders(
      tasks,
      sessions,
      currentTime
    );
    notifications.push(...proactiveReminders);

    // Filtrar y priorizar
    const filteredNotifications = this.filterAndPrioritizeNotifications(notifications);
    
    // Agregar a la cola de entrega
    this.deliveryQueue.push(...filteredNotifications);

    return filteredNotifications;
  }

  /**
   * Entrega las notificaciones pendientes
   */
  public async deliverPendingNotifications(
    deliveryHandler: (notification: ProactiveNotification) => Promise<NotificationDeliveryResult>
  ): Promise<NotificationDeliveryResult[]> {
    const results: NotificationDeliveryResult[] = [];
    const now = new Date();

    // Filtrar notificaciones que deben entregarse ahora
    const readyToDeliver = this.deliveryQueue.filter(notification => 
      notification.triggerTime <= now &&
      !notification.isDismissed &&
      (!notification.expiresAt || notification.expiresAt > now)
    );

    for (const notification of readyToDeliver) {
      try {
        const result = await deliveryHandler(notification);
        results.push(result);
        
        if (result.success) {
          // Remover de la cola y agregar a activas
          this.deliveryQueue = this.deliveryQueue.filter(n => n.id !== notification.id);
          this.activeNotifications.push(notification);
        }
      } catch (error) {
        console.error('Error delivering notification:', error);
        results.push({
          success: false,
          notificationId: notification.id,
          deliveredAt: now,
          channel: 'toast',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Marca una notificación como leída
   */
  public markAsRead(notificationId: string): void {
    const notification = this.activeNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
    }
  }

  /**
   * Desestima una notificación
   */
  public dismissNotification(notificationId: string): void {
    const notification = this.activeNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isDismissed = true;
      notification.dismissedAt = new Date();
    }

    // También remover de la cola si está ahí
    this.deliveryQueue = this.deliveryQueue.filter(n => n.id !== notificationId);
  }

  /**
   * Métodos privados
   */
  private initializeDefaultTriggers(): void {
    // Trigger para tareas sin actividad por mucho tiempo
    this.triggers.push({
      id: 'stale-tasks-reminder',
      type: 'pattern_based',
      condition: {
        type: 'task_state',
        parameters: { hoursWithoutActivity: 48 },
        threshold: 3,
        operator: 'gte',
      },
      template: {
        title: 'Tareas sin actividad',
        message: 'Tienes {count} tareas que no han tenido actividad en las últimas 48 horas.',
        category: 'task_management',
        priority: 2,
        actions: [{
          label: 'Revisar tareas',
          type: 'navigate',
          target: '/tasks?filter=stale',
        }],
        expirationHours: 6,
      },
      isActive: true,
      frequency: {
        type: 'daily',
        maxPerDay: 1,
        cooldownMinutes: 360, // 6 horas
      },
      createdAt: new Date(),
    });

    // Trigger para momento de alta productividad
    this.triggers.push({
      id: 'productivity-peak-reminder',
      type: 'pattern_based',
      condition: {
        type: 'productivity',
        parameters: { currentVsAverage: 1.3 },
        threshold: 1.3,
        operator: 'gte',
      },
      template: {
        title: '¡Momento de alta productividad!',
        message: 'Estás en tu mejor momento del día. Considera trabajar en tareas importantes.',
        category: 'productivity',
        priority: 1,
        actions: [{
          label: 'Ver tareas prioritarias',
          type: 'navigate',
          target: '/tasks?priority=high',
        }],
        expirationHours: 2,
      },
      isActive: true,
      frequency: {
        type: 'custom',
        interval: 120, // 2 horas
        maxPerDay: 3,
        cooldownMinutes: 60,
      },
      createdAt: new Date(),
    });
  }

  private createNotificationFromInsight(insight: AIInsight): ProactiveNotification | null {
    const now = new Date();
    
    return {
      id: `insight-${insight.id}-${Date.now()}`,
      type: insight.category === 'critical' ? 'alert' : 'suggestion',
      category: this.mapInsightToNotificationCategory(insight.type),
      title: insight.title,
      message: insight.description,
      priority: insight.priority,
      triggerTime: now,
      expiresAt: addHours(now, 6),
      isRead: false,
      isDismissed: false,
      actions: insight.actions?.map((action, index) => ({
        id: `${insight.id}-action-${index}`,
        label: action.label,
        type: action.type,
        target: action.target,
        handler: action.handler,
      })),
      metadata: {
        sourceInsightId: insight.id,
        confidence: insight.confidence,
        originalData: insight.data,
      },
      createdAt: now,
    };
  }

  private generatePatternBasedNotifications(
    analysis: PatternAnalysisResult,
    tasks: Task[],
    sessions: TaskSession[],
    currentTime: Date
  ): ProactiveNotification[] {
    const notifications: ProactiveNotification[] = [];

    // Notification para momento óptimo de trabajo
    const temporalPatterns = analysis.patterns.filter(p => p.type === 'temporal');
    const currentHour = getHours(currentTime);
    
    const optimalPattern = temporalPatterns.find(p => 
      Math.abs(p.data.hour - currentHour) <= 1 && 
      p.data.productivity_score >= 4
    );

    if (optimalPattern && this.config.enableProductivityReminders) {
      notifications.push({
        id: `optimal-time-${Date.now()}`,
        type: 'reminder',
        category: 'productivity',
        title: 'Momento óptimo para trabajar',
        message: `Este es tu horario más productivo (${optimalPattern.data.productivity_score}/5). ¡Aprovecha este impulso!`,
        priority: 1,
        triggerTime: currentTime,
        expiresAt: addHours(currentTime, 2),
        isRead: false,
        isDismissed: false,
        actions: [{
          id: 'view-important-tasks',
          label: 'Ver tareas importantes',
          type: 'navigate',
          target: '/tasks?priority=high',
        }],
        metadata: {
          patternId: optimalPattern.id,
          productivityScore: optimalPattern.data.productivity_score,
        },
        createdAt: currentTime,
      });
    }

    return notifications;
  }

  private generateProactiveReminders(
    tasks: Task[],
    sessions: TaskSession[],
    currentTime: Date
  ): ProactiveNotification[] {
    const notifications: ProactiveNotification[] = [];

    // Recordatorio para tareas con deadline próximo
    if (this.config.enableDeadlineWarnings) {
      const upcomingDeadlines = tasks.filter(task => {
        if (!task.due_date || task.status === 'completed') return false;
        
        const dueDate = new Date(task.due_date);
        const hoursUntilDue = (dueDate.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
        
        return hoursUntilDue > 0 && hoursUntilDue <= 24;
      });

      if (upcomingDeadlines.length > 0) {
        const urgentTask = upcomingDeadlines[0];
        notifications.push({
          id: `deadline-warning-${urgentTask.id}`,
          type: 'alert',
          category: 'task_management',
          title: 'Deadline próximo',
          message: `La tarea "${urgentTask.title}" vence en menos de 24 horas.`,
          priority: 1,
          triggerTime: currentTime,
          expiresAt: new Date(urgentTask.due_date!),
          isRead: false,
          isDismissed: false,
          actions: [{
            id: 'view-task',
            label: 'Ver tarea',
            type: 'navigate',
            target: `/tasks?id=${urgentTask.id}`,
          }],
          metadata: {
            taskId: urgentTask.id,
            dueDate: urgentTask.due_date,
          },
          createdAt: currentTime,
        });
      }
    }

    return notifications;
  }

  private shouldDeliverNotification(notification: ProactiveNotification): boolean {
    // Verificar horario de silencio
    if (this.isQuietHours(notification.triggerTime)) {
      return false;
    }

    // Verificar límite de notificaciones por hora
    const hourStart = new Date(notification.triggerTime);
    hourStart.setMinutes(0, 0, 0);
    const hourEnd = addHours(hourStart, 1);

    const notificationsThisHour = this.activeNotifications.filter(n =>
      n.createdAt >= hourStart && n.createdAt < hourEnd
    ).length;

    if (notificationsThisHour >= this.config.maxNotificationsPerHour) {
      return false;
    }

    // Verificar configuración de prioridades
    if (notification.priority === 1 && !this.config.priorities.enableHigh) return false;
    if (notification.priority === 2 && !this.config.priorities.enableMedium) return false;
    if (notification.priority === 3 && !this.config.priorities.enableLow) return false;

    return true;
  }

  private isQuietHours(time: Date): boolean {
    if (!this.config.quietHoursStart || !this.config.quietHoursEnd) {
      return false;
    }

    const hour = getHours(time);
    const start = this.config.quietHoursStart;
    const end = this.config.quietHoursEnd;

    if (start <= end) {
      return hour >= start && hour < end;
    } else {
      // Quiet hours span midnight
      return hour >= start || hour < end;
    }
  }

  private filterAndPrioritizeNotifications(
    notifications: ProactiveNotification[]
  ): ProactiveNotification[] {
    // Remover duplicados por tipo y metadata similar
    const unique = notifications.filter((notification, index, array) =>
      array.findIndex(n => 
        n.type === notification.type &&
        n.category === notification.category &&
        JSON.stringify(n.metadata) === JSON.stringify(notification.metadata)
      ) === index
    );

    // Ordenar por prioridad y tiempo
    return unique.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // 1 = alta prioridad primero
      }
      return a.triggerTime.getTime() - b.triggerTime.getTime();
    });
  }

  private mapInsightToNotificationCategory(
    insightType: AIInsight['type']
  ): ProactiveNotification['category'] {
    switch (insightType) {
      case 'productivity':
        return 'productivity';
      case 'task_management':
        return 'task_management';
      case 'health':
        return 'health';
      case 'recommendation':
        return 'task_management';
      default:
        return 'productivity';
    }
  }

  // Getters públicos
  public getActiveNotifications(): ProactiveNotification[] {
    return this.activeNotifications.filter(n => !n.isDismissed);
  }

  public getPendingNotifications(): ProactiveNotification[] {
    const now = new Date();
    return this.deliveryQueue.filter(n => 
      !n.isDismissed && 
      (!n.expiresAt || n.expiresAt > now)
    );
  }

  public getConfig(): NotificationConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Instancia por defecto
export const defaultNotificationManager = new ProactiveNotificationManager();
