import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTaskLogMutations } from '@/hooks/useTaskLogMutations';
import { SmartReminders } from '@/services/smartReminders';

export interface ExecutableAction {
  type: 'start_task' | 'complete_task' | 'update_activity' | 'create_log' | 'schedule_reminder' | 'suggest_grouping';
  taskId?: string;
  data?: any;
  description: string;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * ✅ CHECKPOINT 4.2: Servicio de Acciones Ejecutables
 * Permite al asistente IA ejecutar acciones reales en tareas
 */
export class ExecutableActionsService {
  private userId: string;
  private taskMutations: ReturnType<typeof useTaskMutations>;
  private taskLogMutations: ReturnType<typeof useTaskLogMutations>;
  private smartReminders: SmartReminders;

  constructor(
    userId: string, 
    taskMutations: ReturnType<typeof useTaskMutations>,
    taskLogMutations: ReturnType<typeof useTaskLogMutations>,
    smartReminders: SmartReminders
  ) {
    this.userId = userId;
    this.taskMutations = taskMutations;
    this.taskLogMutations = taskLogMutations;
    this.smartReminders = smartReminders;
  }

  /**
   * Ejecuta una acción específica
   */
  async executeAction(action: ExecutableAction): Promise<ActionResult> {
    try {
      console.log('🎯 Executing action:', action);

      switch (action.type) {
        case 'start_task':
          return await this.startTask(action.taskId!, action.data);
        
        case 'complete_task':
          return await this.completeTask(action.taskId!, action.data);
        
        case 'update_activity':
          return await this.updateActivity(action.taskId!, action.data);
        
        case 'create_log':
          return await this.createActivityLog(action.taskId!, action.data);
        
        case 'schedule_reminder':
          return await this.scheduleReminder(action.taskId!, action.data);
        
        case 'suggest_grouping':
          return await this.suggestTaskGrouping(action.data);
        
        default:
          return {
            success: false,
            message: `Acción '${action.type}' no reconocida`
          };
      }
    } catch (error) {
      console.error('❌ Error executing action:', error);
      return {
        success: false,
        message: `Error ejecutando acción: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Marca una tarea como "en progreso" y actualiza última actividad
   */
  private async startTask(taskId: string, data: any = {}): Promise<ActionResult> {
    try {
      // Usar mutación directa sin mutateAsync
      this.taskMutations.updateTask({
        id: taskId,
        status: 'in_progress',
        last_worked_at: new Date().toISOString()
      });

      // Crear log automático
      await this.createActivityLog(taskId, {
        title: 'Tarea iniciada',
        content: 'Tarea marcada como en progreso desde el asistente IA',
        log_type: 'ai_action'
      });

      return {
        success: true,
        message: '✅ Tarea marcada como "en progreso" y actividad actualizada',
        data: { taskId, status: 'in_progress' }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al iniciar tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Marca una tarea como completada
   */
  private async completeTask(taskId: string, data: any = {}): Promise<ActionResult> {
    try {
      // Usar mutación directa
      this.taskMutations.completeTask({
        taskId,
        completionNotes: data.notes || 'Completada desde el asistente IA'
      });

      return {
        success: true,
        message: '✅ Tarea completada exitosamente',
        data: { taskId, status: 'completed' }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al completar tarea: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Actualiza la última actividad en una tarea
   */
  private async updateActivity(taskId: string, data: any = {}): Promise<ActionResult> {
    try {
      // Usar mutación directa
      this.taskMutations.updateTask({
        id: taskId,
        last_worked_at: new Date().toISOString(),
        ...(data.notes && { completion_notes: data.notes })
      });

      return {
        success: true,
        message: '✅ Última actividad actualizada',
        data: { taskId, lastWorkedAt: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar actividad: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Crea un log de actividad automático
   */
  private async createActivityLog(taskId: string, data: any): Promise<ActionResult> {
    try {
      // Usar mutación directa
      this.taskLogMutations.createLog({
        task_id: taskId,
        title: data.title || 'Actividad registrada',
        content: data.content || 'Log creado automáticamente',
        log_type: data.log_type || 'ai_action',
        metadata: {
          created_by: 'ai_assistant',
          timestamp: new Date().toISOString(),
          ...data.metadata
        }
      });

      return {
        success: true,
        message: '✅ Log de actividad creado',
        data: { taskId, logType: data.log_type || 'ai_action' }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al crear log: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Programa un recordatorio para una tarea
   */
  private async scheduleReminder(taskId: string, data: any): Promise<ActionResult> {
    try {
      const minutes = data.minutes || 30;
      const message = data.message || 'Recordatorio programado desde el chat';

      const result = await this.smartReminders.scheduleReminder(taskId, minutes, message);

      return {
        success: result.success,
        message: result.message,
        data: { taskId, reminderId: result.reminderId, minutes }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al programar recordatorio: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Sugiere reagrupación de tareas basada en contexto
   */
  private async suggestTaskGrouping(data: any): Promise<ActionResult> {
    try {
      const suggestions = this.generateGroupingSuggestions(data.tasks || []);

      return {
        success: true,
        message: '✅ Sugerencias de reagrupación generadas',
        data: { suggestions }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al generar sugerencias: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Genera sugerencias de reagrupación de tareas
   */
  private generateGroupingSuggestions(tasks: any[]): any[] {
    const suggestions = [];

    // Sugerencias por proyecto
    const tasksByProject = tasks.reduce((acc, task) => {
      const projectId = task.project_id || 'sin_proyecto';
      if (!acc[projectId]) acc[projectId] = [];
      acc[projectId].push(task);
      return acc;
    }, {});

    Object.entries(tasksByProject).forEach(([projectId, projectTasks]: [string, any]) => {
      if (projectTasks.length >= 3) {
        suggestions.push({
          type: 'project_grouping',
          title: `Agrupar tareas del proyecto`,
          description: `${projectTasks.length} tareas pueden ser organizadas mejor`,
          tasks: projectTasks.map((t: any) => t.id),
          reason: 'Múltiples tareas del mismo proyecto'
        });
      }
    });

    // Sugerencias por prioridad
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
    if (highPriorityTasks.length >= 2) {
      suggestions.push({
        type: 'priority_grouping',
        title: 'Agrupar tareas de alta prioridad',
        description: `${highPriorityTasks.length} tareas urgentes requieren atención`,
        tasks: highPriorityTasks.map(t => t.id),
        reason: 'Prioridad alta requiere enfoque'
      });
    }

    // Sugerencias por tags similares
    const tasksByTags = tasks.reduce((acc, task) => {
      (task.tags || []).forEach((tag: string) => {
        if (!acc[tag]) acc[tag] = [];
        acc[tag].push(task);
      });
      return acc;
    }, {});

    Object.entries(tasksByTags).forEach(([tag, tagTasks]: [string, any]) => {
      if (tagTasks.length >= 2) {
        suggestions.push({
          type: 'tag_grouping',
          title: `Agrupar tareas "${tag}"`,
          description: `${tagTasks.length} tareas comparten características similares`,
          tasks: tagTasks.map((t: any) => t.id),
          reason: `Tag común: ${tag}`
        });
      }
    });

    return suggestions.slice(0, 5); // Máximo 5 sugerencias
  }

  /**
   * Detecta intenciones de acción en el texto del usuario
   */
  static detectActionIntentions(userMessage: string, tasks: any[]): ExecutableAction[] {
    const actions: ExecutableAction[] = [];
    const message = userMessage.toLowerCase();

    // Detectar intención de marcar tarea en progreso
    const startPatterns = [
      /(?:empezar|iniciar|comenzar|trabajar\s+en)\s*(?:la\s+)?tarea/i,
      /(?:marcar?\s+como\s+)?(?:en\s+progreso|empezada)/i,
      /voy\s+a\s+(?:empezar|trabajar)/i
    ];

    if (startPatterns.some(pattern => pattern.test(message))) {
      // Encontrar tarea mencionada o la más relevante
      const mentionedTask = tasks.find(t => 
        message.includes(t.title.toLowerCase()) || 
        (t.tags && t.tags.some((tag: string) => message.includes(tag.toLowerCase())))
      );

      if (mentionedTask) {
        actions.push({
          type: 'start_task',
          taskId: mentionedTask.id,
          description: `Marcar "${mentionedTask.title}" como en progreso`
        });
      }
    }

    // Detectar intención de completar tarea
    const completePatterns = [
      /(?:completar|terminar|finalizar)\s*(?:la\s+)?tarea/i,
      /(?:marcar?\s+como\s+)?(?:completada?|terminada?|finalizada?)/i,
      /ya\s+(?:terminé|completé)/i
    ];

    if (completePatterns.some(pattern => pattern.test(message))) {
      const mentionedTask = tasks.find(t => 
        message.includes(t.title.toLowerCase()) ||
        (t.tags && t.tags.some((tag: string) => message.includes(tag.toLowerCase())))
      );

      if (mentionedTask) {
        actions.push({
          type: 'complete_task',
          taskId: mentionedTask.id,
          description: `Completar "${mentionedTask.title}"`
        });
      }
    }

    // Detectar intención de programar recordatorio
    const reminderMatch = message.match(/recuerda(?:me)?\s+(?:en\s+)?(\d+)\s*(?:minutos?|mins?)/i);
    if (reminderMatch) {
      const minutes = parseInt(reminderMatch[1]);
      actions.push({
        type: 'schedule_reminder',
        data: { minutes, message: 'Recordatorio solicitado desde el chat' },
        description: `Programar recordatorio en ${minutes} minutos`
      });
    }

    // Detectar intención de actualizar actividad
    const activityPatterns = [
      /(?:actualizar|registrar)\s+actividad/i,
      /(?:marcar|anotar)\s+progreso/i,
      /estoy\s+trabajando\s+en/i
    ];

    if (activityPatterns.some(pattern => pattern.test(message))) {
      const mentionedTask = tasks.find(t => 
        message.includes(t.title.toLowerCase())
      );

      if (mentionedTask) {
        actions.push({
          type: 'update_activity',
          taskId: mentionedTask.id,
          description: `Actualizar actividad en "${mentionedTask.title}"`
        });
      }
    }

    return actions;
  }
}