import { Task } from '@/hooks/useTasks';
import { UserBehaviorAnalyzer, UserProductivityProfile, BehaviorInsight } from './userBehaviorAnalyzer';
import { enhancedFactorsService, EnhancedFactor, ContextualInfo } from './enhancedFactorsService';

export interface TaskScore {
  task: Task;
  score: number;
  reasons: RecommendationReason[];
  confidence: number;
  timing: TimingRecommendation;
  energy: EnergyRecommendation;
}

export interface RecommendationReason {
  type: 'urgency' | 'context' | 'pattern' | 'momentum' | 'learning';
  title: string;
  description: string;
  weight: number;
  icon: string;
}

export interface TimingRecommendation {
  isOptimalNow: boolean;
  optimalTime?: string;
  reasoning: string;
}

export interface EnergyRecommendation {
  required: 'high' | 'medium' | 'low';
  available: 'high' | 'medium' | 'low';
  match: 'excellent' | 'good' | 'poor';
  suggestion: string;
}

export interface EnhancedSmartRecommendation {
  task: Task;
  score: number;
  confidence: number;
  successProbability: number;
  factors: EnhancedFactor[];
  context: ContextualInfo;
  reasoning: string;
  estimatedDuration: number;
  energyMatch: 'high' | 'medium' | 'low';
  alternatives: Task[];
  userProfile: UserProductivityProfile;
  insights: BehaviorInsight[];
  timing: TimingRecommendation;
  energy: EnergyRecommendation;
}

export class SmartRecommendationEngine {
  private userBehaviorAnalyzer: UserBehaviorAnalyzer;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
    this.userBehaviorAnalyzer = new UserBehaviorAnalyzer(userId);
  }

  async generateSmartRecommendation(tasks: Task[]): Promise<EnhancedSmartRecommendation | null> {
    try {
      const availableTasks = tasks.filter(task => 
        task.status !== 'completed' && 
        !task.is_archived
      );

      if (availableTasks.length === 0) return null;

      // Obtener análisis del usuario
      const behaviorAnalysis = await this.userBehaviorAnalyzer.analyzeUserBehavior();
      const context = enhancedFactorsService.generateCurrentContext();

      // Calcular scores para todas las tareas
      const taskScores = await Promise.all(
        availableTasks.map(task => this.calculateEnhancedTaskScore(task, context, behaviorAnalysis.profile))
      );

      // Ordenar por score y tomar la mejor
      taskScores.sort((a, b) => b.score - a.score);
      const bestScore = taskScores[0];

      if (!bestScore) return null;

      // Generar recomendación completa
      const factors = enhancedFactorsService.generateEnhancedFactors(bestScore.task, context);
      const confidence = this.calculateAdvancedConfidence(bestScore, behaviorAnalysis.profile);
      const successProbability = this.calculateAdvancedSuccessProbability(bestScore.task, context, behaviorAnalysis.profile);
      
      return {
        task: bestScore.task,
        score: bestScore.score,
        confidence,
        successProbability,
        factors,
        context,
        reasoning: this.generateAdvancedReasoning(bestScore, behaviorAnalysis.profile),
        estimatedDuration: enhancedFactorsService.estimateTaskDuration(bestScore.task),
        energyMatch: bestScore.energy.match as 'high' | 'medium' | 'low',
        alternatives: taskScores.slice(1, 4).map(ts => ts.task),
        userProfile: behaviorAnalysis.profile,
        insights: behaviorAnalysis.insights,
        timing: bestScore.timing,
        energy: bestScore.energy
      };
    } catch (error) {
      console.error('Error generating smart recommendation:', error);
      return null;
    }
  }

  private async calculateEnhancedTaskScore(
    task: Task, 
    context: ContextualInfo, 
    profile: UserProductivityProfile
  ): Promise<TaskScore> {
    // Factores principales con pesos adaptativos
    const urgencyScore = this.calculateUrgencyScore(task) * 0.30;
    const contextScore = this.calculateContextScore(task, context, profile) * 0.25;
    const patternScore = this.calculatePatternScore(task, profile) * 0.20;
    const momentumScore = this.calculateMomentumScore(task, context) * 0.15;
    const learningScore = this.calculateLearningScore(task, profile) * 0.10;

    const totalScore = urgencyScore + contextScore + patternScore + momentumScore + learningScore;

    // Generar razones detalladas
    const reasons = this.generateDetailedReasons(task, context, profile);
    
    // Generar recomendaciones de timing y energía
    const timing = this.generateTimingRecommendation(task, context, profile);
    const energy = this.generateEnergyRecommendation(task, context, profile);

    return {
      task,
      score: Math.min(100, Math.max(0, totalScore)),
      reasons,
      confidence: this.calculateTaskConfidence(task, profile),
      timing,
      energy
    };
  }

  private calculateUrgencyScore(task: Task): number {
    let score = 0;
    const now = new Date();

    // Prioridad base
    const priorityScores = { low: 10, medium: 30, high: 60, urgent: 90 };
    score += priorityScores[task.priority] || 30;

    // Factor de vencimiento
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays < 0) score += 50; // Vencida
      else if (diffDays < 1) score += 40; // Vence hoy
      else if (diffDays < 2) score += 30; // Vence mañana
      else if (diffDays < 7) score += 20; // Vence esta semana
    }

    return score;
  }

  private calculateContextScore(task: Task, context: ContextualInfo, profile: UserProductivityProfile): number {
    let score = 0;
    const currentHour = new Date().getHours();

    // Horario óptimo del usuario
    if (profile.optimalHours.includes(currentHour)) {
      score += 40;
    }

    // Día óptimo del usuario
    const currentDay = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    if (profile.optimalDays.includes(currentDay)) {
      score += 30;
    }

    // Nivel de energía
    if (context.userEnergyLevel === 'high') score += 35;
    else if (context.userEnergyLevel === 'medium') score += 20;
    else score += 5;

    // Patrón de trabajo del día
    if (context.workPattern === 'productive') score += 25;
    else if (context.workPattern === 'normal') score += 15;

    return score;
  }

  private calculatePatternScore(task: Task, profile: UserProductivityProfile): number {
    let score = 0;

    // Tags preferidos
    if (task.tags && profile.preferredTags.length > 0) {
      const matchingTags = task.tags.filter(tag => profile.preferredTags.includes(tag));
      score += matchingTags.length * 15;
    }

    // Duración vs preferencia del usuario
    const taskDuration = task.estimated_duration || 60;
    const userAvgDuration = profile.avgTaskDuration;
    
    if (Math.abs(taskDuration - userAvgDuration) < 30) {
      score += 20; // Duración similar a su promedio
    }

    // Evitar triggers de procrastinación
    const hasTriggers = this.checkProcrastinationTriggers(task, profile);
    if (hasTriggers) {
      score -= 30;
    }

    return score;
  }

  private calculateMomentumScore(task: Task, context: ContextualInfo): number {
    let score = 0;

    // Tarea en progreso
    if (task.status === 'in_progress') {
      score += 60;
    }

    // Momentum del día
    if (context.completedTasksToday > 2) {
      score += 30;
    } else if (context.completedTasksToday > 0) {
      score += 15;
    }

    // Patrón productivo
    if (context.workPattern === 'productive') {
      score += 25;
    }

    return score;
  }

  private calculateLearningScore(task: Task, profile: UserProductivityProfile): number {
    // Simulación de aprendizaje - en el futuro usará datos reales de feedback
    let score = 0;

    // Basado en tasa de completación general
    if (profile.completionRate > 80) {
      score += 20; // Usuario consistente, puede manejar tareas complejas
    } else if (profile.completionRate < 60) {
      score += 10; // Usuario necesita tareas más simples
    }

    return score;
  }

  private generateDetailedReasons(task: Task, context: ContextualInfo, profile: UserProductivityProfile): RecommendationReason[] {
    const reasons: RecommendationReason[] = [];

    // Razones de urgencia
    if (task.priority === 'urgent' || task.priority === 'high') {
      reasons.push({
        type: 'urgency',
        title: 'Alta Prioridad',
        description: `Tarea marcada como ${task.priority}`,
        weight: 70,
        icon: '🔥'
      });
    }

    // Razones de contexto
    const currentHour = new Date().getHours();
    if (profile.optimalHours.includes(currentHour)) {
      reasons.push({
        type: 'context',
        title: 'Horario Óptimo',
        description: 'Estás en tu horario más productivo',
        weight: 40,
        icon: '⏰'
      });
    }

    // Razones de patrón
    if (task.tags && profile.preferredTags.length > 0) {
      const matchingTags = task.tags.filter(tag => profile.preferredTags.includes(tag));
      if (matchingTags.length > 0) {
        reasons.push({
          type: 'pattern',
          title: 'Área de Fortaleza',
          description: `Tienes buen historial en: ${matchingTags.join(', ')}`,
          weight: 35,
          icon: '🎯'
        });
      }
    }

    return reasons.sort((a, b) => b.weight - a.weight);
  }

  private generateTimingRecommendation(task: Task, context: ContextualInfo, profile: UserProductivityProfile): TimingRecommendation {
    const currentHour = new Date().getHours();
    const isOptimalNow = profile.optimalHours.includes(currentHour);

    if (isOptimalNow) {
      return {
        isOptimalNow: true,
        reasoning: 'Estás en tu horario de mayor productividad'
      };
    } else {
      const nextOptimalHour = profile.optimalHours.find(h => h > currentHour) || profile.optimalHours[0];
      return {
        isOptimalNow: false,
        optimalTime: `${nextOptimalHour}:00`,
        reasoning: `Tu próximo horario óptimo es a las ${nextOptimalHour}:00`
      };
    }
  }

  private generateEnergyRecommendation(task: Task, context: ContextualInfo, profile: UserProductivityProfile): EnergyRecommendation {
    const taskEnergyRequired = this.estimateTaskEnergyRequirement(task);
    const userEnergyAvailable = context.userEnergyLevel;

    const energyLevels = { low: 1, medium: 2, high: 3 };
    const requiredLevel = energyLevels[taskEnergyRequired];
    const availableLevel = energyLevels[userEnergyAvailable];

    let match: 'excellent' | 'good' | 'poor';
    let suggestion: string;

    if (availableLevel >= requiredLevel) {
      match = availableLevel === requiredLevel ? 'good' : 'excellent';
      suggestion = 'Perfecto momento para trabajar en esta tarea';
    } else {
      match = 'poor';
      suggestion = 'Considera una tarea que requiera menos energía o toma un descanso';
    }

    return {
      required: taskEnergyRequired,
      available: userEnergyAvailable,
      match,
      suggestion
    };
  }

  private calculateAdvancedConfidence(taskScore: TaskScore, profile: UserProductivityProfile): number {
    let confidence = taskScore.confidence;

    // Ajustar por patrones del usuario
    if (profile.completionRate > 80) confidence += 10;
    if (profile.optimalHours.length > 3) confidence += 5;
    
    // Ajustar por calidad de los factores
    const strongReasons = taskScore.reasons.filter(r => r.weight > 50);
    confidence += strongReasons.length * 5;

    return Math.min(100, Math.max(0, confidence));
  }

  private calculateAdvancedSuccessProbability(task: Task, context: ContextualInfo, profile: UserProductivityProfile): number {
    let probability = profile.completionRate; // Base del historial del usuario

    // Ajustes contextuales
    if (context.userEnergyLevel === 'high') probability += 15;
    if (context.workPattern === 'productive') probability += 10;
    
    // Ajustes por características de la tarea
    if (task.status === 'in_progress') probability += 20;
    if (task.estimated_duration && task.estimated_duration <= profile.avgTaskDuration) probability += 10;

    return Math.min(95, Math.max(10, probability));
  }

  private generateAdvancedReasoning(taskScore: TaskScore, profile: UserProductivityProfile): string {
    const topReasons = taskScore.reasons.slice(0, 2);
    if (topReasons.length === 0) return 'Tarea bien posicionada para este momento';

    let reasoning = topReasons[0].description;
    if (topReasons.length > 1) {
      reasoning += ` y ${topReasons[1].description.toLowerCase()}`;
    }

    return reasoning;
  }

  private calculateTaskConfidence(task: Task, profile: UserProductivityProfile): number {
    let confidence = 50; // Base

    // Factores que aumentan confianza
    if (task.priority === 'high' || task.priority === 'urgent') confidence += 20;
    if (task.status === 'in_progress') confidence += 25;
    if (profile.completionRate > 75) confidence += 15;

    return Math.min(100, Math.max(0, confidence));
  }

  private checkProcrastinationTriggers(task: Task, profile: UserProductivityProfile): boolean {
    // Verificar si la tarea tiene triggers conocidos de procrastinación
    if (!task.due_date && profile.procrastinationTriggers.includes('Tareas sin fecha límite')) {
      return true;
    }

    if (task.estimated_duration && task.estimated_duration > 120 && 
        profile.procrastinationTriggers.includes('Tareas con duración estimada alta')) {
      return true;
    }

    return false;
  }

  private estimateTaskEnergyRequirement(task: Task): 'high' | 'medium' | 'low' {
    if (task.priority === 'urgent' || task.priority === 'high') return 'high';
    if (task.estimated_duration && task.estimated_duration > 90) return 'medium';
    return 'low';
  }
}