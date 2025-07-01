
import { TaskContext } from '@/utils/taskContext';
import { TaskAISummary } from '@/services/taskAIService';

/**
 * Generador de insights contextuales específicos
 */
export class ContextualInsightGenerator {
  
  /**
   * Analiza el contexto y genera insights específicos
   */
  static generateSpecificInsights(context: TaskContext): SpecificInsight[] {
    const insights: SpecificInsight[] = [];
    
    // Análisis de timing
    insights.push(...this.analyzeTaskTiming(context));
    
    // Análisis de progreso
    insights.push(...this.analyzeProgressPatterns(context));
    
    // Análisis de dependencias
    insights.push(...this.analyzeDependencyImpact(context));
    
    // Análisis de productividad
    insights.push(...this.analyzeProductivityIndicators(context));
    
    return insights.filter(insight => insight.confidence > 0.6);
  }

  /**
   * Analiza patrones de tiempo específicos de la tarea
   */
  private static analyzeTaskTiming(context: TaskContext): SpecificInsight[] {
    const insights: SpecificInsight[] = [];
    const { mainTask, recentLogs } = context;
    
    const daysSinceCreation = Math.floor(
      (new Date().getTime() - new Date(mainTask.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const lastActivity = recentLogs.length > 0 ? new Date(recentLogs[0].created_at) : null;
    const daysSinceActivity = lastActivity ? 
      Math.floor((new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 
      999;
    
    // Insight: Tarea antigua sin progreso
    if (daysSinceCreation > 14 && context.completionStatus.overallProgress < 30) {
      insights.push({
        type: 'timing_alert',
        title: 'Tarea Antigua Estancada',
        description: `Esta tarea lleva ${daysSinceCreation} días creada con solo ${context.completionStatus.overallProgress}% de progreso`,
        actionable: `Considerar dividir en tareas más pequeñas o revisar si sigue siendo prioritaria`,
        confidence: 0.9,
        urgency: 'high'
      });
    }
    
    // Insight: Actividad reciente positiva
    if (daysSinceActivity <= 1 && recentLogs.length >= 2) {
      insights.push({
        type: 'momentum_positive',
        title: 'Momento Productivo Activo',
        description: `${recentLogs.length} actualizaciones en los últimos días - buen ritmo de trabajo`,
        actionable: `Mantener el momentum actual y considerar bloquear tiempo adicional`,
        confidence: 0.8,
        urgency: 'low'
      });
    }
    
    return insights;
  }

  /**
   * Analiza patrones específicos de progreso
   */
  private static analyzeProgressPatterns(context: TaskContext): SpecificInsight[] {
    const insights: SpecificInsight[] = [];
    const { completionStatus, mainTask } = context;
    
    // Insight: Desbalance entre subtareas y microtareas
    if (completionStatus.totalSubtasks > 0 && completionStatus.totalMicrotasks > 0) {
      const subtaskCompletion = (completionStatus.completedSubtasks / completionStatus.totalSubtasks) * 100;
      const microtaskCompletion = (completionStatus.completedMicrotasks / completionStatus.totalMicrotasks) * 100;
      
      if (Math.abs(subtaskCompletion - microtaskCompletion) > 30) {
        insights.push({
          type: 'progress_imbalance',
          title: 'Desbalance en Ejecución',
          description: `Subtareas: ${subtaskCompletion.toFixed(0)}% vs Microtareas: ${microtaskCompletion.toFixed(0)}%`,
          actionable: subtaskCompletion > microtaskCompletion ? 
            'Enfocar en completar las microtareas pendientes' : 
            'Dividir las subtareas grandes en pasos más pequeños',
          confidence: 0.7,
          urgency: 'medium'
        });
      }
    }
    
    // Insight: Progreso estancado
    if (completionStatus.overallProgress > 0 && completionStatus.overallProgress < 25 && recentLogs.length === 0) {
      insights.push({
        type: 'progress_stalled',
        title: 'Progreso Inicial Estancado',
        description: `${completionStatus.overallProgress}% completado pero sin actividad reciente`,
        actionable: 'Identificar y resolver el bloqueo específico que impide avanzar',
        confidence: 0.8,
        urgency: 'high'
      });
    }
    
    return insights;
  }

  /**
   * Analiza el impacto específico de las dependencias
   */
  private static analyzeDependencyImpact(context: TaskContext): SpecificInsight[] {
    const insights: SpecificInsight[] = [];
    const { dependencies, mainTask } = context;
    
    // Insight: Bloqueo crítico por dependencias
    if (dependencies.dependent.length > 0 && context.completionStatus.overallProgress < 10) {
      insights.push({
        type: 'dependency_blocking',
        title: 'Dependencias Críticas Sin Resolver',
        description: `${dependencies.dependent.length} tareas deben completarse antes de avanzar significativamente`,
        actionable: `Priorizar completar las dependencias o buscar alternativas paralelas`,
        confidence: 0.9,
        urgency: 'high'
      });
    }
    
    // Insight: Impacto en cadena
    if (dependencies.blocking.length >= 3) {
      insights.push({
        type: 'chain_impact',
        title: 'Alto Impacto en Cadena',
        description: `${dependencies.blocking.length} tareas esperan que esta se complete`,
        actionable: `Esta tarea es crítica - considerar asignar recursos adicionales`,
        confidence: 0.8,
        urgency: 'medium'
      });
    }
    
    return insights;
  }

  /**
   * Analiza indicadores específicos de productividad
   */
  private static analyzeProductivityIndicators(context: TaskContext): SpecificInsight[] {
    const insights: SpecificInsight[] = [];
    const { recentLogs, completionStatus, mainTask } = context;
    
    // Insight: Actividad fragmentada
    if (recentLogs.length >= 5) {
      const logTypes = recentLogs.map(log => log.log_type);
      const uniqueTypes = new Set(logTypes).size;
      
      if (uniqueTypes >= 3) {
        insights.push({
          type: 'activity_fragmented',
          title: 'Actividad Muy Fragmentada',
          description: `${recentLogs.length} actualizaciones de ${uniqueTypes} tipos diferentes`,
          actionable: 'Considerar sesiones de trabajo más enfocadas en un solo aspecto',
          confidence: 0.6,
          urgency: 'low'
        });
      }
    }
    
    // Insight: Complejidad subestimada
    if (completionStatus.totalSubtasks > 10 && !mainTask.estimated_duration) {
      insights.push({
        type: 'complexity_underestimated',
        title: 'Complejidad Posiblemente Subestimada',
        description: `${completionStatus.totalSubtasks} subtareas sugieren alta complejidad`,
        actionable: 'Estimar duración y considerar dividir en fases o milestones',
        confidence: 0.7,
        urgency: 'medium'
      });
    }
    
    return insights;
  }
}

interface SpecificInsight {
  type: string;
  title: string;
  description: string;
  actionable: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
}
