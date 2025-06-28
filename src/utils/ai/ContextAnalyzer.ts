
import { SmartPromptContext } from '@/types/ai-prompts';
import { ExtendedAIContext } from '@/types/ai-context';

export interface ContextAnalysis {
  workloadLevel: 'light' | 'moderate' | 'heavy' | 'overwhelming';
  urgencyScore: number; // 0-100
  focusArea: 'tasks' | 'projects' | 'planning' | 'review' | 'maintenance';
  recommendedActions: string[];
  attentionPoints: string[];
  situationSummary: string;
  contextQuality: number; // 0-100
}

export interface SituationMetrics {
  overdueTasks: number;
  urgentTasks: number;
  completionRate: number;
  workSessionGap: number; // hours since last work
  projectDeadlines: number; // projects with deadlines within 7 days
}

export class ContextAnalyzer {
  static analyzeSituation(context: ExtendedAIContext): ContextAnalysis {
    const metrics = this.calculateSituationMetrics(context);
    const workloadLevel = this.determineWorkloadLevel(context, metrics);
    const urgencyScore = this.calculateUrgencyScore(metrics);
    const focusArea = this.determineFocusArea(context, metrics);
    const contextQuality = this.assessContextQuality(context);

    return {
      workloadLevel,
      urgencyScore,
      focusArea,
      recommendedActions: this.generateRecommendedActions(workloadLevel, focusArea, metrics),
      attentionPoints: this.identifyAttentionPoints(context, metrics),
      situationSummary: this.generateSituationSummary(workloadLevel, urgencyScore, focusArea),
      contextQuality,
    };
  }

  private static calculateSituationMetrics(context: ExtendedAIContext): SituationMetrics {
    const now = new Date();
    const today = now.toDateString();

    // Analizar tareas vencidas
    const overdueTasks = context.recentTasks.filter(task => {
      if (!task.updated_at) return false;
      const taskDate = new Date(task.updated_at);
      return taskDate < now && task.status !== 'completed';
    }).length;

    // Tareas urgentes
    const urgentTasks = context.recentTasks.filter(task => 
      task.priority === 'urgent' && task.status !== 'completed'
    ).length;

    // Tasa de completado
    const totalTasks = context.userInfo.totalTasks;
    const completionRate = totalTasks > 0 ? 
      (context.userInfo.completedTasks / totalTasks) * 100 : 0;

    // Gap desde última actividad
    const lastActivity = context.recentActivity.lastTaskUpdate;
    const workSessionGap = lastActivity ? 
      Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)) : 24;

    // Proyectos con deadlines próximos
    const projectDeadlines = context.recentProjects.filter(project => {
      // Simulamos que algunos proyectos tienen deadlines próximos
      return project.status === 'active' && project.progress < 80;
    }).length;

    return {
      overdueTasks,
      urgentTasks,
      completionRate,
      workSessionGap,
      projectDeadlines,
    };
  }

  private static determineWorkloadLevel(
    context: ExtendedAIContext, 
    metrics: SituationMetrics
  ): ContextAnalysis['workloadLevel'] {
    const pendingTasks = context.userInfo.pendingTasks;
    const activeProjects = context.recentProjects.filter(p => p.status === 'active').length;

    if (pendingTasks > 20 || metrics.urgentTasks > 5 || activeProjects > 8) {
      return 'overwhelming';
    }
    if (pendingTasks > 10 || metrics.urgentTasks > 2 || activeProjects > 4) {
      return 'heavy';
    }
    if (pendingTasks > 5 || metrics.urgentTasks > 0 || activeProjects > 2) {
      return 'moderate';
    }
    return 'light';
  }

  private static calculateUrgencyScore(metrics: SituationMetrics): number {
    let score = 0;

    // Tareas vencidas (mayor peso)
    score += metrics.overdueTasks * 25;

    // Tareas urgentes
    score += metrics.urgentTasks * 15;

    // Baja tasa de completado
    if (metrics.completionRate < 50) score += 20;
    else if (metrics.completionRate < 70) score += 10;

    // Gap de trabajo largo
    if (metrics.workSessionGap > 48) score += 15;
    else if (metrics.workSessionGap > 24) score += 8;

    // Deadlines de proyectos
    score += metrics.projectDeadlines * 10;

    return Math.min(score, 100);
  }

  private static determineFocusArea(
    context: ExtendedAIContext, 
    metrics: SituationMetrics
  ): ContextAnalysis['focusArea'] {
    // Si hay tareas vencidas o urgentes, foco en tareas
    if (metrics.overdueTasks > 0 || metrics.urgentTasks > 2) {
      return 'tasks';
    }

    // Si hay proyectos con deadlines próximos
    if (metrics.projectDeadlines > 0) {
      return 'projects';
    }

    // Si no hay actividad reciente, foco en planificación
    if (metrics.workSessionGap > 24) {
      return 'planning';
    }

    // Si la tasa de completado es alta, foco en revisión
    if (metrics.completionRate > 80) {
      return 'review';
    }

    // Si hay muchas tareas pendientes pero no urgentes
    if (context.userInfo.pendingTasks > 10) {
      return 'maintenance';
    }

    return 'tasks';
  }

  private static generateRecommendedActions(
    workloadLevel: ContextAnalysis['workloadLevel'],
    focusArea: ContextAnalysis['focusArea'],
    metrics: SituationMetrics
  ): string[] {
    const actions: string[] = [];

    // Acciones basadas en carga de trabajo
    switch (workloadLevel) {
      case 'overwhelming':
        actions.push('Prioriza solo tareas críticas hoy');
        actions.push('Considera delegar o postergar tareas no esenciales');
        actions.push('Bloquea tiempo específico para trabajo enfocado');
        break;
      case 'heavy':
        actions.push('Organiza tareas por prioridad');
        actions.push('Usa técnicas de time-blocking');
        break;
      case 'moderate':
        actions.push('Mantén un ritmo constante de trabajo');
        actions.push('Revisa progreso de proyectos activos');
        break;
      case 'light':
        actions.push('Aprovecha para planificar trabajo futuro');
        actions.push('Considera iniciar nuevos proyectos');
        break;
    }

    // Acciones basadas en área de foco
    switch (focusArea) {
      case 'tasks':
        if (metrics.overdueTasks > 0) {
          actions.push(`Atiende ${metrics.overdueTasks} tareas vencidas primero`);
        }
        if (metrics.urgentTasks > 0) {
          actions.push(`Completa ${metrics.urgentTasks} tareas urgentes hoy`);
        }
        break;
      case 'projects':
        actions.push('Revisa deadlines de proyectos activos');
        actions.push('Actualiza el progreso de proyectos');
        break;
      case 'planning':
        actions.push('Crear plan de trabajo para los próximos días');
        actions.push('Revisar y actualizar objetivos');
        break;
      case 'review':
        actions.push('Hacer retrospectiva del trabajo completado');
        actions.push('Identificar mejoras en procesos');
        break;
      case 'maintenance':
        actions.push('Organizar y clasificar tareas pendientes');
        actions.push('Limpiar tareas obsoletas o completadas');
        break;
    }

    return actions.slice(0, 4); // Máximo 4 acciones
  }

  private static identifyAttentionPoints(
    context: ExtendedAIContext, 
    metrics: SituationMetrics
  ): string[] {
    const points: string[] = [];

    if (metrics.overdueTasks > 0) {
      points.push(`⚠️ ${metrics.overdueTasks} tareas vencidas requieren atención inmediata`);
    }

    if (metrics.urgentTasks > 3) {
      points.push(`🔥 Muchas tareas urgentes (${metrics.urgentTasks}) - considera repriorizar`);
    }

    if (metrics.completionRate < 30) {
      points.push('📉 Baja tasa de completado - revisar estrategia de trabajo');
    }

    if (metrics.workSessionGap > 48) {
      points.push('⏰ Mucho tiempo sin actividad - considera retomar rutina de trabajo');
    }

    if (context.userInfo.pendingTasks > 30) {
      points.push('📚 Muchas tareas pendientes - considera dividir en sprints más pequeños');
    }

    return points;
  }

  private static generateSituationSummary(
    workloadLevel: ContextAnalysis['workloadLevel'],
    urgencyScore: number,
    focusArea: ContextAnalysis['focusArea']
  ): string {
    const workloadDesc = {
      light: 'carga de trabajo ligera',
      moderate: 'carga de trabajo moderada',
      heavy: 'carga de trabajo pesada',
      overwhelming: 'carga de trabajo abrumadora'
    };

    const focusDesc = {
      tasks: 'completar tareas pendientes',
      projects: 'avanzar proyectos activos',
      planning: 'planificar trabajo futuro',
      review: 'revisar progreso',
      maintenance: 'organizar y mantener sistema'
    };

    const urgencyLevel = urgencyScore > 70 ? 'alta' : urgencyScore > 40 ? 'media' : 'baja';

    return `Tienes ${workloadDesc[workloadLevel]} con urgencia ${urgencyLevel}. ` +
           `El foco principal debería ser ${focusDesc[focusArea]}.`;
  }

  private static assessContextQuality(context: ExtendedAIContext): number {
    let quality = 100;

    // Penalizar por falta de datos
    if (!context.userInfo.id) quality -= 20;
    if (context.recentTasks.length === 0) quality -= 15;
    if (context.recentProjects.length === 0) quality -= 10;
    if (!context.recentActivity.lastTaskUpdate) quality -= 10;

    // Bonificar por datos ricos
    if (context.productivity) quality += 5;
    if (context.workPatterns) quality += 5;

    return Math.max(quality, 0);
  }
}
