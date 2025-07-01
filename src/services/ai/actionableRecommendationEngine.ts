
import { TaskContext } from '@/utils/taskContext';
import { IntelligentAction } from '@/types/intelligent-actions';

/**
 * Motor de recomendaciones accionables específicas
 */
export class ActionableRecommendationEngine {
  
  /**
   * Genera acciones inteligentes específicas basadas en el contexto
   */
  static generateSmartActions(context: TaskContext): IntelligentAction[] {
    const actions: IntelligentAction[] = [];
    
    // Acciones basadas en el estado específico
    actions.push(...this.generateStatusBasedActions(context));
    
    // Acciones basadas en patrones temporales
    actions.push(...this.generateTimingBasedActions(context));
    
    // Acciones basadas en progreso
    actions.push(...this.generateProgressBasedActions(context));
    
    // Acciones basadas en dependencias
    actions.push(...this.generateDependencyBasedActions(context));
    
    return actions
      .filter(action => action.confidence > 0.6)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3); // Top 3 acciones más relevantes
  }

  /**
   * Genera acciones específicas basadas en el estado actual
   */
  private static generateStatusBasedActions(context: TaskContext): IntelligentAction[] {
    const actions: IntelligentAction[] = [];
    const { mainTask, completionStatus, recentLogs } = context;
    
    // Acción: Crear checkpoint para tareas complejas
    if (completionStatus.totalSubtasks > 8 && completionStatus.completedSubtasks < 2) {
      actions.push({
        id: `checkpoint-${mainTask.id}`,
        type: 'create_subtask',
        label: 'Crear Checkpoint Intermedio',
        priority: 'high',
        confidence: 0.8,
        suggestedData: {
          title: `Checkpoint: Revisión ${mainTask.title}`,
          content: `Revisar progreso y reorganizar subtareas restantes para optimizar flujo de trabajo`,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mañana
          language: 'es',
          estimatedDuration: 30
        },
        basedOnPatterns: ['high_complexity', 'low_initial_progress']
      });
    }
    
    // Acción: Recordatorio de seguimiento para tareas estancadas
    const daysSinceActivity = recentLogs.length > 0 ? 
      Math.floor((new Date().getTime() - new Date(recentLogs[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) :
      999;
    
    if (daysSinceActivity > 3 && completionStatus.overallProgress > 0) {
      actions.push({
        id: `followup-${mainTask.id}`,
        type: 'create_reminder',
        label: 'Recordatorio de Reactivación',
        priority: 'medium',
        confidence: 0.9,
        suggestedData: {
          title: `Retomar: ${mainTask.title}`,
          content: `Han pasado ${daysSinceActivity} días sin actividad. Revisar estado y identificar próximo paso específico.`,
          scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000), // En 2 horas
          language: 'es',
          estimatedDuration: 15,
          reminderType: 'check_in'
        },
        basedOnPatterns: ['stalled_task', 'previous_progress']
      });
    }
    
    return actions;
  }

  /**
   * Genera acciones basadas en patrones temporales específicos
   */
  private static generateTimingBasedActions(context: TaskContext): IntelligentAction[] {
    const actions: IntelligentAction[] = [];
    const { mainTask } = context;
    
    // Acción: Deadline crítico
    if (mainTask.due_date) {
      const daysToDeadline = Math.ceil(
        (new Date(mainTask.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysToDeadline <= 7 && daysToDeadline > 1 && context.completionStatus.overallProgress < 70) {
        actions.push({
          id: `deadline-sprint-${mainTask.id}`,
          type: 'create_subtask',
          label: 'Sprint Final Deadline',
          priority: 'high',
          confidence: 0.95,
          suggestedData: {
            title: `Sprint Final: ${mainTask.title}`,
            content: `Quedan ${daysToDeadline} días. Enfocar en completar elementos críticos y preparar entrega mínima viable.`,
            scheduledFor: new Date(), // Ahora
            language: 'es',
            estimatedDuration: 120
          },
          basedOnPatterns: ['approaching_deadline', 'insufficient_progress']
        });
      }
    }
    
    return actions;
  }

  /**
   * Genera acciones específicas basadas en progreso
   */
  private static generateProgressBasedActions(context: TaskContext): IntelligentAction[] {
    const actions: IntelligentAction[] = [];
    const { completionStatus, mainTask } = context;
    
    // Acción: Optimizar estructura para progreso lento
    if (completionStatus.overallProgress < 20 && completionStatus.totalSubtasks > 5) {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(mainTask.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceCreation > 7) {
        actions.push({
          id: `restructure-${mainTask.id}`,
          type: 'create_subtask',
          label: 'Reestructurar Enfoque',
          priority: 'high',
          confidence: 0.8,
          suggestedData: {
            title: `Reestructurar: ${mainTask.title}`,
            content: `Después de ${daysSinceCreation} días con progreso lento, revisar y simplificar el enfoque. Identificar la subtarea más simple para generar momentum.`,
            scheduledFor: new Date(Date.now() + 60 * 60 * 1000), // En 1 hora
            language: 'es',
            estimatedDuration: 45
          },
          basedOnPatterns: ['slow_progress', 'complex_structure']
        });
      }
    }
    
    return actions;
  }

  /**
   * Genera acciones basadas en dependencias
   */
  private static generateDependencyBasedActions(context: TaskContext): IntelligentAction[] {
    const actions: IntelligentAction[] = [];
    const { dependencies, mainTask } = context;
    
    // Acción: Resolver dependencias bloqueantes
    if (dependencies.dependent.length > 0 && context.completionStatus.overallProgress < 30) {
      actions.push({
        id: `resolve-deps-${mainTask.id}`,
        type: 'create_subtask',
        label: 'Resolver Dependencias',
        priority: 'high',
        confidence: 0.9,
        suggestedData: {
          title: `Resolver Dependencias: ${mainTask.title}`,
          content: `${dependencies.dependent.length} tareas están bloqueando el progreso. Priorizar su resolución o buscar alternativas paralelas.`,
          scheduledFor: new Date(Date.now() + 30 * 60 * 1000), // En 30 minutos
          language: 'es',
          estimatedDuration: 60
        },
        basedOnPatterns: ['dependency_blocking', 'low_progress']
      });
    }
    
    return actions;
  }
}
