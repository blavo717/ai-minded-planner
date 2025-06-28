
import { SmartPromptContext, SmartPromptOptions, GeneratedPrompt } from '@/types/ai-prompts';
import { Task } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';

export interface PromptBuilderConfig {
  includeTaskDetails?: boolean;
  includeProjectContext?: boolean;
  includeRecentActivity?: boolean;
  includeProductivityMetrics?: boolean;
  maxTasksToInclude?: number;
  maxProjectsToInclude?: number;
}

export class PromptBuilder {
  private userId: string;
  private config: PromptBuilderConfig;

  constructor(userId: string, config: PromptBuilderConfig = {}) {
    this.userId = userId;
    this.config = {
      includeTaskDetails: true,
      includeProjectContext: true,
      includeRecentActivity: true,
      includeProductivityMetrics: false,
      maxTasksToInclude: 5,
      maxProjectsToInclude: 3,
      ...config
    };
  }

  /**
   * Construye un prompt enriquecido con datos específicos de Supabase
   */
  async buildEnrichedPrompt(
    basePrompt: string,
    context: SmartPromptContext,
    options: SmartPromptOptions
  ): Promise<GeneratedPrompt> {
    let enrichedContent = basePrompt;

    // Agregar contexto de tareas si está habilitado
    if (this.config.includeTaskDetails && options.includeData) {
      const taskContext = await this.buildTaskContext();
      if (taskContext) {
        enrichedContent += `\n\n**Contexto de Tareas:**\n${taskContext}`;
      }
    }

    // Agregar contexto de proyectos si está habilitado
    if (this.config.includeProjectContext && options.includeData) {
      const projectContext = await this.buildProjectContext();
      if (projectContext) {
        enrichedContent += `\n\n**Contexto de Proyectos:**\n${projectContext}`;
      }
    }

    // Agregar métricas de productividad si está habilitado
    if (this.config.includeProductivityMetrics && options.includeData) {
      const metricsContext = await this.buildProductivityMetrics();
      if (metricsContext) {
        enrichedContent += `\n\n**Métricas de Productividad:**\n${metricsContext}`;
      }
    }

    // Agregar actividad reciente si está habilitado
    if (this.config.includeRecentActivity) {
      const activityContext = this.buildRecentActivityContext(context);
      if (activityContext) {
        enrichedContent += `\n\n**Actividad Reciente:**\n${activityContext}`;
      }
    }

    return {
      content: enrichedContent,
      context,
      options,
      timestamp: new Date(),
    };
  }

  /**
   * Construye contexto específico de tareas desde Supabase
   */
  private async buildTaskContext(): Promise<string | null> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, due_date, estimated_duration')
        .eq('user_id', this.userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(this.config.maxTasksToInclude || 5);

      if (error || !tasks || tasks.length === 0) {
        return null;
      }

      const urgentTasks = tasks.filter(t => t.priority === 'urgent');
      const overdueTasks = tasks.filter(t => 
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      );
      const pendingTasks = tasks.filter(t => t.status === 'pending');

      let context = '';

      if (urgentTasks.length > 0) {
        context += `- Tareas urgentes (${urgentTasks.length}): ${urgentTasks.map(t => t.title).join(', ')}\n`;
      }

      if (overdueTasks.length > 0) {
        context += `- Tareas vencidas (${overdueTasks.length}): ${overdueTasks.map(t => t.title).join(', ')}\n`;
      }

      if (pendingTasks.length > 0) {
        const topPending = pendingTasks.slice(0, 3);
        context += `- Próximas tareas pendientes: ${topPending.map(t => t.title).join(', ')}\n`;
      }

      return context || null;
    } catch (error) {
      console.error('Error building task context:', error);
      return null;
    }
  }

  /**
   * Construye contexto específico de proyectos desde Supabase
   */
  private async buildProjectContext(): Promise<string | null> {
    try {
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, status, progress, deadline')
        .eq('user_id', this.userId)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(this.config.maxProjectsToInclude || 3);

      if (error || !projects || projects.length === 0) {
        return null;
      }

      const stuckProjects = projects.filter(p => (p.progress || 0) < 10);
      const nearDeadline = projects.filter(p => 
        p.deadline && 
        new Date(p.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
      );

      let context = '';

      if (projects.length > 0) {
        context += `- Proyectos activos: ${projects.map(p => `${p.name} (${p.progress || 0}%)`).join(', ')}\n`;
      }

      if (stuckProjects.length > 0) {
        context += `- Proyectos con poco progreso: ${stuckProjects.map(p => p.name).join(', ')}\n`;
      }

      if (nearDeadline.length > 0) {
        context += `- Proyectos próximos a vencer: ${nearDeadline.map(p => p.name).join(', ')}\n`;
      }

      return context || null;
    } catch (error) {
      console.error('Error building project context:', error);
      return null;
    }
  }

  /**
   * Construye métricas de productividad básicas
   */
  private async buildProductivityMetrics(): Promise<string | null> {
    try {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data: completedTasks, error } = await supabase
        .from('tasks')
        .select('completed_at, estimated_duration, actual_duration')
        .eq('user_id', this.userId)
        .eq('status', 'completed')
        .gte('completed_at', weekAgo.toISOString())
        .lte('completed_at', today.toISOString());

      if (error || !completedTasks || completedTasks.length === 0) {
        return null;
      }

      const tasksThisWeek = completedTasks.length;
      const avgDuration = completedTasks
        .filter(t => t.actual_duration)
        .reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedTasks.length;

      return `- Tareas completadas esta semana: ${tasksThisWeek}\n- Duración promedio: ${Math.round(avgDuration || 0)} minutos`;
    } catch (error) {
      console.error('Error building productivity metrics:', error);
      return null;
    }
  }

  /**
   * Construye contexto de actividad reciente basado en el contexto existente
   */
  private buildRecentActivityContext(context: SmartPromptContext): string | null {
    const { recentActivity, currentSession } = context;

    let activityContext = '';

    // Información de la sesión actual
    activityContext += `- Momento actual: ${currentSession.dayOfWeek} ${currentSession.timeOfDay}`;
    if (currentSession.isWeekend) {
      activityContext += ' (fin de semana)';
    }
    activityContext += '\n';

    // Patrón de trabajo
    switch (recentActivity.workPattern) {
      case 'productive':
        activityContext += `- Patrón de trabajo: Muy productivo (${recentActivity.recentCompletions} tareas completadas hoy)\n`;
        break;
      case 'moderate':
        activityContext += `- Patrón de trabajo: Moderado (${recentActivity.recentCompletions} tareas completadas hoy)\n`;
        break;
      case 'low':
        activityContext += `- Patrón de trabajo: Bajo (${recentActivity.recentCompletions} tareas completadas hoy)\n`;
        break;
      case 'inactive':
        activityContext += '- Patrón de trabajo: Sin actividad registrada hoy\n';
        break;
    }

    // Última actualización de tarea
    if (recentActivity.lastTaskUpdate) {
      const timeSinceUpdate = new Date().getTime() - recentActivity.lastTaskUpdate.getTime();
      const hoursSince = Math.floor(timeSinceUpdate / (1000 * 60 * 60));
      
      if (hoursSince < 1) {
        activityContext += '- Última actividad: Hace menos de una hora\n';
      } else if (hoursSince < 24) {
        activityContext += `- Última actividad: Hace ${hoursSince} horas\n`;
      } else {
        activityContext += '- Última actividad: Hace más de un día\n';
      }
    }

    return activityContext || null;
  }

  /**
   * Construye un prompt específico para análisis de tareas
   */
  async buildTaskAnalysisPrompt(taskIds: string[]): Promise<string> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('id, title, description, status, priority, due_date, estimated_duration, actual_duration, created_at, updated_at')
        .in('id', taskIds)
        .eq('user_id', this.userId);

      if (error || !tasks) {
        return 'No se pudieron obtener los detalles de las tareas solicitadas.';
      }

      let prompt = 'Análisis de las siguientes tareas:\n\n';

      tasks.forEach((task, index) => {
        prompt += `${index + 1}. **${task.title}**\n`;
        if (task.description) {
          prompt += `   - Descripción: ${task.description}\n`;
        }
        prompt += `   - Estado: ${task.status}\n`;
        prompt += `   - Prioridad: ${task.priority}\n`;
        
        if (task.due_date) {
          const dueDate = new Date(task.due_date);
          const isOverdue = dueDate < new Date() && task.status !== 'completed';
          prompt += `   - Fecha límite: ${dueDate.toLocaleDateString()}${isOverdue ? ' (VENCIDA)' : ''}\n`;
        }
        
        if (task.estimated_duration) {
          prompt += `   - Duración estimada: ${task.estimated_duration} minutos\n`;
        }
        
        if (task.actual_duration) {
          prompt += `   - Duración real: ${task.actual_duration} minutos\n`;
        }
        
        prompt += '\n';
      });

      return prompt;
    } catch (error) {
      console.error('Error building task analysis prompt:', error);
      return 'Error al construir el análisis de tareas.';
    }
  }

  /**
   * Actualiza la configuración del builder
   */
  updateConfig(newConfig: Partial<PromptBuilderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Obtiene la configuración actual
   */
  getConfig(): PromptBuilderConfig {
    return { ...this.config };
  }
}

// Función de utilidad para crear un builder rápidamente
export const createPromptBuilder = (userId: string, config?: PromptBuilderConfig): PromptBuilder => {
  return new PromptBuilder(userId, config);
};

// Función de utilidad para construir prompts de manera sencilla
export const buildQuickPrompt = async (
  userId: string,
  basePrompt: string,
  context: SmartPromptContext,
  options: SmartPromptOptions = { type: 'general', includeData: true }
): Promise<GeneratedPrompt> => {
  const builder = createPromptBuilder(userId);
  return await builder.buildEnrichedPrompt(basePrompt, context, options);
};
