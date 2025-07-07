/**
 * SPRINT 2 - MVP PROACTIVO
 * Servicio básico para detectar alertas de deadlines
 * Funcionalidad simple sin ML, solo reglas básicas
 */

import { Task } from '@/hooks/useTasks';

export interface DeadlineAlert {
  id: string;
  type: 'deadline_warning';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  task: Task;
  daysUntilDue: number;
  actionLabel: string;
  actionType: 'work_on_task' | 'reschedule' | 'mark_urgent';
}

export class BasicProactiveAlerts {
  protected lastAlertSession: string | null = null;

  /**
   * Detecta tareas con due_date cercano (< 2 días)
   * Máximo 1 alerta por sesión para evitar spam
   */
  checkForDeadlineAlerts(tasks: Task[], sessionId: string): DeadlineAlert | null {
    // Control de frecuencia: máximo 1 alerta por sesión
    if (this.lastAlertSession === sessionId) {
      return null;
    }

    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);

    // Filtrar tareas con deadline próximo
    const upcomingTasks = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      
      const dueDate = new Date(task.due_date);
      return dueDate <= twoDaysFromNow && dueDate >= now;
    });

    if (upcomingTasks.length === 0) {
      return null;
    }

    // Priorizar por urgencia y fecha
    const prioritizedTask = upcomingTasks.sort((a, b) => {
      // Primero por prioridad
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Luego por fecha más cercana
      return new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime();
    })[0];

    const daysUntilDue = Math.ceil(
      (new Date(prioritizedTask.due_date!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Marcar que ya se mostró alerta en esta sesión
    this.lastAlertSession = sessionId;

    return this.createDeadlineAlert(prioritizedTask, daysUntilDue);
  }

  private createDeadlineAlert(task: Task, daysUntilDue: number): DeadlineAlert {
    const severity = this.calculateSeverity(task, daysUntilDue);
    const { title, message } = this.generateAlertMessages(task, daysUntilDue, severity);
    
    return {
      id: `deadline_alert_${task.id}_${Date.now()}`,
      type: 'deadline_warning',
      severity,
      title,
      message,
      task,
      daysUntilDue,
      actionLabel: 'Trabajar en esta tarea',
      actionType: 'work_on_task'
    };
  }

  protected calculateSeverity(task: Task, daysUntilDue: number): DeadlineAlert['severity'] {
    if (daysUntilDue === 0 || task.priority === 'urgent') {
      return 'high';
    }
    if (daysUntilDue === 1 || task.priority === 'high') {
      return 'medium';
    }
    return 'low';
  }

  protected generateAlertMessages(
    task: Task, 
    daysUntilDue: number, 
    severity: DeadlineAlert['severity']
  ): { title: string; message: string } {
    const timeText = daysUntilDue === 0 ? 'hoy' : 
                     daysUntilDue === 1 ? 'mañana' : 
                     `en ${daysUntilDue} días`;

    const urgencyEmoji = severity === 'high' ? '🚨' : 
                        severity === 'medium' ? '⚠️' : '📅';

    const title = `${urgencyEmoji} Deadline próximo`;
    
    const message = daysUntilDue === 0 
      ? `La tarea "${task.title}" vence HOY. ¿Te gustaría trabajar en ella ahora?`
      : `La tarea "${task.title}" vence ${timeText}. Es un buen momento para avanzar.`;

    return { title, message };
  }

  /**
   * Reset para nueva sesión (cuando se limpia el chat)
   */
  resetSession(): void {
    this.lastAlertSession = null;
  }
}