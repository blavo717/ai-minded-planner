import { Task } from '@/hooks/useTasks';

export interface TimeBasedRecommendation {
  task: Task;
  estimatedDuration: number;
  urgencyScore: number;
  specificReason: string;
  actionSteps?: string[];
}

export interface TaskCategorization {
  urgentToday: Task[];
  vencidas: Task[];
  quickWins: Task[];
  inProgress: Task[];
  byDuration: {
    short: Task[]; // <= 15 min
    medium: Task[]; // 16-60 min
    long: Task[]; // > 60 min
  };
}

/**
 * ✅ CHECKPOINT 1.2.2: Motor de Recomendaciones Temporal
 * Genera recomendaciones específicas basadas en tiempo disponible y datos reales
 */
export class TimeBasedRecommendationEngine {
  
  /**
   * Generar recomendaciones específicas según tiempo disponible
   */
  generateTimeBasedRecommendations(
    tasks: Task[], 
    availableMinutes: number
  ): TimeBasedRecommendation[] {
    const categorizedTasks = this.categorizeTasks(tasks);
    const recommendations: TimeBasedRecommendation[] = [];

    // 1. Priorizar tareas urgentes que caben en el tiempo
    const urgentMatches = categorizedTasks.urgentToday
      .filter(task => this.estimateTaskDuration(task) <= availableMinutes)
      .map(task => ({
        task,
        estimatedDuration: this.estimateTaskDuration(task),
        urgencyScore: 95,
        specificReason: `Vence hoy - tiempo perfecto para completarla`,
        actionSteps: this.generateActionSteps(task)
      }));

    recommendations.push(...urgentMatches);

    // 2. Tareas vencidas que se pueden hacer rápido
    const overdueMatches = categorizedTasks.vencidas
      .filter(task => this.estimateTaskDuration(task) <= availableMinutes)
      .map(task => ({
        task,
        estimatedDuration: this.estimateTaskDuration(task),
        urgencyScore: 90,
        specificReason: `Está vencida - ${this.getDaysOverdue(task)} días de retraso`,
        actionSteps: this.generateActionSteps(task)
      }));

    recommendations.push(...overdueMatches);

    // 3. Tareas en progreso (continuar momentum)
    const inProgressMatches = categorizedTasks.inProgress
      .filter(task => this.estimateTaskDuration(task) <= availableMinutes)
      .map(task => ({
        task,
        estimatedDuration: this.estimateTaskDuration(task),
        urgencyScore: 85,
        specificReason: `Ya está en progreso - mantienes el momentum`,
        actionSteps: this.generateActionSteps(task)
      }));

    recommendations.push(...inProgressMatches);

    // 4. Quick wins según tiempo disponible
    if (availableMinutes <= 15) {
      const quickWins = categorizedTasks.byDuration.short
        .filter(task => !categorizedTasks.urgentToday.includes(task))
        .map(task => ({
          task,
          estimatedDuration: this.estimateTaskDuration(task),
          urgencyScore: 70,
          specificReason: `Quick win perfecto para ${availableMinutes} minutos`,
          actionSteps: this.generateActionSteps(task)
        }));
      
      recommendations.push(...quickWins);
    } else if (availableMinutes <= 60) {
      const mediumTasks = categorizedTasks.byDuration.medium
        .filter(task => this.estimateTaskDuration(task) <= availableMinutes)
        .map(task => ({
          task,
          estimatedDuration: this.estimateTaskDuration(task),
          urgencyScore: 75,
          specificReason: `Tiempo ideal para hacer avances significativos`,
          actionSteps: this.generateActionSteps(task)
        }));
      
      recommendations.push(...mediumTasks);
    }

    // Ordenar por urgencia y devolver top 3
    return recommendations
      .sort((a, b) => b.urgencyScore - a.urgencyScore)
      .slice(0, 3);
  }

  /**
   * Categorizar tareas por urgencia y duración
   */
  private categorizeTasks(tasks: Task[]): TaskCategorization {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const urgentToday = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate <= today;
    });

    const vencidas = tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate < today;
    });

    const inProgress = tasks.filter(task => 
      task.status === 'in_progress' && !task.is_archived
    );

    const quickWins = tasks.filter(task => 
      task.status === 'pending' && 
      !task.is_archived && 
      this.estimateTaskDuration(task) <= 15
    );

    // Categorizar por duración
    const activeTasks = tasks.filter(task => 
      task.status !== 'completed' && !task.is_archived
    );

    const byDuration = {
      short: activeTasks.filter(task => this.estimateTaskDuration(task) <= 15),
      medium: activeTasks.filter(task => {
        const duration = this.estimateTaskDuration(task);
        return duration > 15 && duration <= 60;
      }),
      long: activeTasks.filter(task => this.estimateTaskDuration(task) > 60)
    };

    return {
      urgentToday,
      vencidas,
      quickWins,
      inProgress,
      byDuration
    };
  }

  /**
   * Estimar duración de tarea basada en datos reales
   */
  private estimateTaskDuration(task: Task): number {
    // 1. Si tiene duración estimada, usarla
    if (task.estimated_duration) {
      return task.estimated_duration;
    }

    // 2. Si tiene duración real de trabajos anteriores, usar promedio
    if (task.actual_duration) {
      return task.actual_duration;
    }

    // 3. Estimación inteligente basada en características
    let estimatedMinutes = 30; // Base

    // Ajustar por prioridad
    if (task.priority === 'high') estimatedMinutes += 20;
    if (task.priority === 'low') estimatedMinutes -= 10;

    // Ajustar por contenido de título/descripción
    const content = `${task.title} ${task.description || ''}`.toLowerCase();
    
    // Palabras que indican tareas rápidas
    const quickWords = ['llamar', 'enviar', 'revisar', 'confirmar', 'verificar'];
    if (quickWords.some(word => content.includes(word))) {
      estimatedMinutes = Math.min(estimatedMinutes, 15);
    }

    // Palabras que indican tareas largas
    const longWords = ['desarrollar', 'crear', 'diseñar', 'implementar', 'planificar'];
    if (longWords.some(word => content.includes(word))) {
      estimatedMinutes += 30;
    }

    return Math.max(5, Math.min(estimatedMinutes, 120)); // Entre 5 min y 2 horas
  }

  /**
   * Generar pasos de acción específicos para una tarea
   */
  private generateActionSteps(task: Task): string[] {
    const steps: string[] = [];
    const content = `${task.title} ${task.description || ''}`.toLowerCase();

    // Patrones comunes de acción
    if (content.includes('enviar') || content.includes('email')) {
      steps.push('Redactar mensaje');
      steps.push('Verificar destinatarios');
      steps.push('Enviar y marcar como completada');
    } else if (content.includes('llamar') || content.includes('contactar')) {
      steps.push('Buscar información de contacto');
      steps.push('Realizar llamada');
      steps.push('Documentar resultado');
    } else if (content.includes('revisar') || content.includes('verificar')) {
      steps.push('Abrir documento/sistema');
      steps.push('Hacer revisión detallada');
      steps.push('Anotar observaciones');
    } else {
      // Pasos genéricos pero útiles
      steps.push('Preparar materiales necesarios');
      steps.push('Ejecutar tarea principal');
      steps.push('Verificar completitud');
    }

    return steps;
  }

  /**
   * Calcular días de retraso para tareas vencidas
   */
  private getDaysOverdue(task: Task): number {
    if (!task.due_date) return 0;
    
    const dueDate = new Date(task.due_date);
    const today = new Date();
    const diffTime = today.getTime() - dueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  /**
   * Detectar intención temporal en mensaje del usuario
   */
  detectTimeIntention(userMessage: string): { hasTimeIntention: boolean; minutes?: number } {
    const message = userMessage.toLowerCase();
    
    // Patrones de tiempo específico
    const timePatterns = [
      { pattern: /(\d+)\s*minutos?/i, multiplier: 1 },
      { pattern: /(\d+)\s*horas?/i, multiplier: 60 },
      { pattern: /media\s*hora/i, fixed: 30 },
      { pattern: /un\s*cuarto/i, fixed: 15 },
      { pattern: /\d+\s*min/i, multiplier: 1 }
    ];

    for (const { pattern, multiplier, fixed } of timePatterns) {
      const match = message.match(pattern);
      if (match) {
        if (fixed) {
          return { hasTimeIntention: true, minutes: fixed };
        } else if (multiplier && match[1]) {
          return { hasTimeIntention: true, minutes: parseInt(match[1]) * multiplier };
        }
      }
    }

    // Frases que indican disponibilidad de tiempo
    const timeKeywords = [
      'tiempo libre', 'hueco', 'rato libre', 'tengo tiempo',
      'qué hago', 'en qué trabajo', 'recomendación'
    ];

    const hasTimeIntention = timeKeywords.some(keyword => message.includes(keyword));
    
    return { hasTimeIntention };
  }
}