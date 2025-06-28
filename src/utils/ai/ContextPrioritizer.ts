
import { ExtendedAIContext } from '@/types/ai-context';
import { ContextAnalysis } from '@/utils/ai/ContextAnalyzer';

export interface PriorityWeights {
  urgency: number;
  importance: number;
  recency: number;
  userPreference: number;
  workPattern: number;
}

export interface PrioritizedTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  priorityScore: number;
  urgencyScore: number;
  importanceScore: number;
  reasons: string[];
}

export interface PrioritizedProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  priorityScore: number;
  deadlineScore: number;
  progressScore: number;
  reasons: string[];
}

export interface PrioritizedContext extends ExtendedAIContext {
  prioritizedTasks: PrioritizedTask[];
  prioritizedProjects: PrioritizedProject[];
  focusRecommendations: string[];
  timeAllocation: {
    tasks: number;
    projects: number;
    planning: number;
    review: number;
  };
}

export class ContextPrioritizer {
  private static DEFAULT_WEIGHTS: PriorityWeights = {
    urgency: 0.35,
    importance: 0.25,
    recency: 0.15,
    userPreference: 0.15,
    workPattern: 0.10,
  };

  static prioritizeContext(
    context: ExtendedAIContext,
    analysis: ContextAnalysis,
    customWeights?: Partial<PriorityWeights>
  ): PrioritizedContext {
    const weights = { ...this.DEFAULT_WEIGHTS, ...customWeights };

    const prioritizedTasks = this.prioritizeTasks(context, analysis, weights);
    const prioritizedProjects = this.prioritizeProjects(context, analysis, weights);
    const focusRecommendations = this.generateFocusRecommendations(
      prioritizedTasks, 
      prioritizedProjects, 
      analysis
    );
    const timeAllocation = this.calculateTimeAllocation(
      prioritizedTasks,
      prioritizedProjects,
      analysis
    );

    return {
      ...context,
      prioritizedTasks,
      prioritizedProjects,
      focusRecommendations,
      timeAllocation,
    };
  }

  private static prioritizeTasks(
    context: ExtendedAIContext,
    analysis: ContextAnalysis,
    weights: PriorityWeights
  ): PrioritizedTask[] {
    return context.recentTasks.map(task => {
      const urgencyScore = this.calculateTaskUrgencyScore(task, context);
      const importanceScore = this.calculateTaskImportanceScore(task, context);
      const recencyScore = this.calculateTaskRecencyScore(task);
      const userPreferenceScore = this.calculateUserPreferenceScore(task, context);
      const workPatternScore = this.calculateWorkPatternScore(task, context);

      const priorityScore = 
        urgencyScore * weights.urgency +
        importanceScore * weights.importance +
        recencyScore * weights.recency +
        userPreferenceScore * weights.userPreference +
        workPatternScore * weights.workPattern;

      const reasons = this.generateTaskPriorityReasons(
        task,
        urgencyScore,
        importanceScore,
        analysis
      );

      return {
        id: task.id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        priorityScore: Math.round(priorityScore),
        urgencyScore: Math.round(urgencyScore),
        importanceScore: Math.round(importanceScore),
        reasons,
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private static calculateTaskUrgencyScore(
    task: any,
    context: ExtendedAIContext
  ): number {
    let score = 0;

    // Basado en prioridad declarada
    const priorityScores = { urgent: 100, high: 75, medium: 50, low: 25 };
    score += priorityScores[task.priority as keyof typeof priorityScores] || 25;

    // Tareas vencidas
    if (task.updated_at) {
      const taskDate = new Date(task.updated_at);
      const daysDiff = Math.floor((Date.now() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 7) score += 30;
      else if (daysDiff > 3) score += 15;
      else if (daysDiff > 1) score += 5;
    }

    // Estado de la tarea
    if (task.status === 'in_progress') score += 20;
    else if (task.status === 'pending') score += 10;

    return Math.min(score, 100);
  }

  private static calculateTaskImportanceScore(
    task: any,
    context: ExtendedAIContext
  ): number {
    let score = 50; // Score base

    // Si es parte de un proyecto activo
    const relatedProject = context.recentProjects.find(p => 
      p.id === task.project_id || p.name.toLowerCase().includes(task.title.toLowerCase())
    );
    
    if (relatedProject) {
      score += 25;
      
      // Proyectos con poco progreso son más importantes
      if (relatedProject.progress < 30) score += 15;
      else if (relatedProject.progress < 60) score += 10;
    }

    // Tareas que pueden desbloquear otras
    if (task.title.toLowerCase().includes('blocker') || 
        task.title.toLowerCase().includes('dependency')) {
      score += 30;
    }

    return Math.min(score, 100);
  }

  private static calculateTaskRecencyScore(task: any): number {
    if (!task.updated_at) return 25;

    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceUpdate === 0) return 100;
    if (daysSinceUpdate === 1) return 80;
    if (daysSinceUpdate <= 3) return 60;
    if (daysSinceUpdate <= 7) return 40;
    
    return 20;
  }

  private static calculateUserPreferenceScore(task: any, context: ExtendedAIContext): number {
    // Score basado en patrones de trabajo del usuario
    const workPattern = context.recentActivity.workPattern;
    
    if (workPattern === 'productive') {
      // Usuario productivo prefiere tareas desafiantes
      return task.priority === 'high' || task.priority === 'urgent' ? 80 : 60;
    } else if (workPattern === 'moderate') {
      // Usuario moderado prefiere balance
      return task.priority === 'medium' ? 80 : 65;
    } else if (workPattern === 'low') {
      // Usuario con baja actividad prefiere tareas fáciles
      return task.priority === 'low' || task.priority === 'medium' ? 75 : 50;
    }
    
    return 50; // Default para 'inactive'
  }

  private static calculateWorkPatternScore(task: any, context: ExtendedAIContext): number {
    const currentHour = new Date().getHours();
    
    // Si tenemos datos de patrones de trabajo
    if (context.workPatterns?.mostProductiveHours.includes(currentHour)) {
      return 90; // Hora productiva
    }
    
    // Score basado en horario
    if (context.currentSession.timeOfDay === 'morning') return 80;
    if (context.currentSession.timeOfDay === 'afternoon') return 70;
    if (context.currentSession.timeOfDay === 'evening') return 60;
    
    return 40; // night
  }

  private static generateTaskPriorityReasons(
    task: any,
    urgencyScore: number,
    importanceScore: number,
    analysis: ContextAnalysis
  ): string[] {
    const reasons: string[] = [];

    if (urgencyScore > 80) {
      reasons.push('Alta urgencia por prioridad y vencimiento');
    }

    if (importanceScore > 75) {
      reasons.push('Importante para el progreso del proyecto');
    }

    if (task.priority === 'urgent') {
      reasons.push('Marcada como urgente');
    }

    if (task.status === 'in_progress') {
      reasons.push('Ya en progreso, mantener momentum');
    }

    if (analysis.focusArea === 'tasks' && urgencyScore > 60) {
      reasons.push('Alineada con foco actual en tareas');
    }

    return reasons.slice(0, 3);
  }

  private static prioritizeProjects(
    context: ExtendedAIContext,
    analysis: ContextAnalysis,
    weights: PriorityWeights
  ): PrioritizedProject[] {
    return context.recentProjects.map(project => {
      const deadlineScore = this.calculateProjectDeadlineScore(project);
      const progressScore = this.calculateProjectProgressScore(project);
      const impactScore = this.calculateProjectImpactScore(project, context);

      const priorityScore = 
        deadlineScore * 0.4 +
        progressScore * 0.3 +
        impactScore * 0.3;

      const reasons = this.generateProjectPriorityReasons(
        project,
        deadlineScore,
        progressScore,
        analysis
      );

      return {
        id: project.id,
        name: project.name,
        status: project.status,
        progress: project.progress,
        priorityScore: Math.round(priorityScore),
        deadlineScore: Math.round(deadlineScore),
        progressScore: Math.round(progressScore),
        reasons,
      };
    }).sort((a, b) => b.priorityScore - a.priorityScore);
  }

  private static calculateProjectDeadlineScore(project: any): number {
    // Simulación de deadline - en implementación real vendría de la base de datos
    const progress = project.progress || 0;
    
    if (progress > 90) return 30; // Casi terminado, menor urgencia
    if (progress > 70) return 60; // Buen progreso
    if (progress < 30) return 90; // Poco progreso, alta urgencia
    
    return 75; // Progreso medio
  }

  private static calculateProjectProgressScore(project: any): number {
    const progress = project.progress || 0;
    
    // Proyectos con progreso medio necesitan atención
    if (progress >= 20 && progress <= 80) return 90;
    if (progress > 80) return 70; // Casi terminado
    if (progress < 20) return 85; // Necesita arranque
    
    return 60;
  }

  private static calculateProjectImpactScore(project: any, context: ExtendedAIContext): number {
    // Score basado en cuántas tareas están relacionadas con el proyecto
    const relatedTasks = context.recentTasks.filter(task => 
      task.title.toLowerCase().includes(project.name.toLowerCase()) ||
      task.id.includes(project.id) // Simulación
    ).length;

    return Math.min(relatedTasks * 20 + 40, 100);
  }

  private static generateProjectPriorityReasons(
    project: any,
    deadlineScore: number,
    progressScore: number,
    analysis: ContextAnalysis
  ): string[] {
    const reasons: string[] = [];

    if (deadlineScore > 80) {
      reasons.push('Deadline próximo o progreso lento');
    }

    if (progressScore > 85) {
      reasons.push('En zona crítica de progreso');
    }

    if (project.progress > 80) {
      reasons.push('Cerca de completarse');
    } else if (project.progress < 20) {
      reasons.push('Necesita impulso inicial');
    }

    if (analysis.focusArea === 'projects') {
      reasons.push('Alineado con foco actual en proyectos');
    }

    return reasons.slice(0, 3);
  }

  private static generateFocusRecommendations(
    tasks: PrioritizedTask[],
    projects: PrioritizedProject[],
    analysis: ContextAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Top 3 tareas
    const topTasks = tasks.slice(0, 3);
    if (topTasks.length > 0) {
      recommendations.push(`Enfócate en: ${topTasks.map(t => t.title).join(', ')}`);
    }

    // Proyecto prioritario
    const topProject = projects[0];
    if (topProject) {
      recommendations.push(`Proyecto prioritario: ${topProject.name} (${topProject.progress}% completado)`);
    }

    // Basado en análisis
    if (analysis.urgencyScore > 70) {
      recommendations.push('Día de alta urgencia - prioriza tareas críticas únicamente');
    } else if (analysis.workloadLevel === 'light') {
      recommendations.push('Carga liviana - considera avanzar proyectos a largo plazo');
    }

    return recommendations.slice(0, 4);
  }

  private static calculateTimeAllocation(
    tasks: PrioritizedTask[],
    projects: PrioritizedProject[],
    analysis: ContextAnalysis
  ): PrioritizedContext['timeAllocation'] {
    let tasksAllocation = 40;
    let projectsAllocation = 30;
    let planningAllocation = 20;
    let reviewAllocation = 10;

    // Ajustar basado en análisis
    switch (analysis.focusArea) {
      case 'tasks':
        tasksAllocation = 60;
        projectsAllocation = 20;
        planningAllocation = 15;
        reviewAllocation = 5;
        break;
      case 'projects':
        tasksAllocation = 25;
        projectsAllocation = 50;
        planningAllocation = 15;
        reviewAllocation = 10;
        break;
      case 'planning':
        tasksAllocation = 20;
        projectsAllocation = 20;
        planningAllocation = 50;
        reviewAllocation = 10;
        break;
      case 'review':
        tasksAllocation = 20;
        projectsAllocation = 20;
        planningAllocation = 10;
        reviewAllocation = 50;
        break;
    }

    // Ajustar por carga de trabajo
    if (analysis.workloadLevel === 'overwhelming') {
      tasksAllocation += 20;
      projectsAllocation -= 10;
      planningAllocation -= 5;
      reviewAllocation -= 5;
    }

    return {
      tasks: Math.max(tasksAllocation, 10),
      projects: Math.max(projectsAllocation, 10),
      planning: Math.max(planningAllocation, 5),
      review: Math.max(reviewAllocation, 5),
    };
  }
}
