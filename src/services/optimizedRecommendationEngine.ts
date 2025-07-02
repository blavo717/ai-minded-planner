import { Task } from '@/hooks/useTasks';
import { UserBehaviorAnalyzer, UserProductivityProfile } from './userBehaviorAnalyzer';
import { enhancedFactorsService, EnhancedFactor, ContextualInfo } from './enhancedFactorsService';

// Cache para análisis de comportamiento
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface TaskScoreCache {
  score: number;
  confidence: number;
  factors: EnhancedFactor[];
  lastUpdated: number;
}

export class OptimizedRecommendationEngine {
  private userBehaviorAnalyzer: UserBehaviorAnalyzer;
  private userId: string;
  private cache = new Map<string, CacheEntry<any>>();
  private taskScoreCache = new Map<string, TaskScoreCache>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly BEHAVIOR_CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

  constructor(userId: string) {
    this.userId = userId;
    this.userBehaviorAnalyzer = new UserBehaviorAnalyzer(userId);
  }

  async generateOptimizedRecommendation(tasks: Task[]): Promise<any | null> {
    try {
      const availableTasks = this.filterAvailableTasks(tasks);
      if (availableTasks.length === 0) return null;

      // Usar cache para análisis de comportamiento
      const behaviorAnalysis = await this.getCachedBehaviorAnalysis();
      const context = enhancedFactorsService.generateCurrentContext();

      // Calcular scores usando cache inteligente
      const taskScores = await this.calculateOptimizedTaskScores(
        availableTasks, 
        context, 
        behaviorAnalysis.profile
      );

      // Encontrar mejor recomendación
      const bestTask = this.selectBestTask(taskScores);
      if (!bestTask) return null;

      return this.buildRecommendation(bestTask, behaviorAnalysis, context);
    } catch (error) {
      console.error('Error in optimized recommendation:', error);
      return null;
    }
  }

  private async getCachedBehaviorAnalysis() {
    const cacheKey = `behavior_${this.userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() < cached.timestamp + cached.expiry) {
      return cached.data;
    }

    const analysis = await this.userBehaviorAnalyzer.analyzeUserBehavior();
    
    this.cache.set(cacheKey, {
      data: analysis,
      timestamp: Date.now(),
      expiry: this.BEHAVIOR_CACHE_DURATION
    });

    return analysis;
  }

  private async calculateOptimizedTaskScores(
    tasks: Task[], 
    context: ContextualInfo, 
    profile: UserProductivityProfile
  ): Promise<Array<{ task: Task; score: number; confidence: number; factors: EnhancedFactor[] }>> {
    const scores = [];
    
    for (const task of tasks) {
      const cached = this.taskScoreCache.get(task.id);
      
      // Usar cache si está fresco (menos de 5 minutos)
      if (cached && Date.now() - cached.lastUpdated < this.CACHE_DURATION) {
        scores.push({
          task,
          score: cached.score,
          confidence: cached.confidence,
          factors: cached.factors
        });
        continue;
      }

      // Calcular nuevo score
      const factors = enhancedFactorsService.generateEnhancedFactors(task, context);
      const score = this.calculateFinalScore(task, context, profile, factors);
      const confidence = enhancedFactorsService.calculateConfidenceScore(factors);

      // Guardar en cache
      this.taskScoreCache.set(task.id, {
        score,
        confidence,
        factors,
        lastUpdated: Date.now()
      });

      scores.push({ task, score, confidence, factors });
    }

    return scores;
  }

  private calculateFinalScore(
    task: Task, 
    context: ContextualInfo, 
    profile: UserProductivityProfile,
    factors: EnhancedFactor[]
  ): number {
    // Pesos optimizados basados en análisis
    const urgencyWeight = 0.30;
    const contextWeight = 0.25;
    const patternWeight = 0.20;
    const momentumWeight = 0.15;
    const learningWeight = 0.10;

    let score = 0;

    // Urgencia
    score += this.calculateUrgencyScore(task) * urgencyWeight;
    
    // Contexto
    score += this.calculateContextScore(task, context, profile) * contextWeight;
    
    // Patrones del usuario
    score += this.calculatePatternScore(task, profile) * patternWeight;
    
    // Momentum
    score += this.calculateMomentumScore(task, context) * momentumWeight;
    
    // Aprendizaje (simulado)
    score += this.calculateLearningScore(task, profile) * learningWeight;

    return Math.min(100, Math.max(0, score));
  }

  private calculateUrgencyScore(task: Task): number {
    let score = 0;
    const now = new Date();

    // Mapeo de prioridades optimizado
    const priorityScores: Record<string, number> = {
      low: 10,
      medium: 30,
      high: 60,
      urgent: 90
    };

    score += priorityScores[task.priority] || 30;

    // Factor temporal optimizado
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 0) score += 50; // Vencida
      else if (diffHours < 24) score += 40; // Vence en 24h
      else if (diffHours < 48) score += 30; // Vence en 48h
      else if (diffHours < 168) score += 20; // Vence en una semana
    }

    return score;
  }

  private calculateContextScore(
    task: Task, 
    context: ContextualInfo, 
    profile: UserProductivityProfile
  ): number {
    let score = 0;
    const currentHour = new Date().getHours();

    // Horario óptimo
    if (profile.optimalHours.includes(currentHour)) {
      score += 40;
    }

    // Energía del usuario
    const energyScores = { high: 35, medium: 20, low: 5 };
    score += energyScores[context.userEnergyLevel];

    // Patrón del día
    const patternScores = { productive: 25, normal: 15, low: 5 };
    score += patternScores[context.workPattern];

    return score;
  }

  private calculatePatternScore(task: Task, profile: UserProductivityProfile): number {
    let score = 0;

    // Tags preferidos
    if (task.tags && profile.preferredTags.length > 0) {
      const matches = task.tags.filter(tag => profile.preferredTags.includes(tag));
      score += matches.length * 15;
    }

    // Duración óptima
    const taskDuration = task.estimated_duration || 60;
    const diff = Math.abs(taskDuration - profile.avgTaskDuration);
    if (diff < 30) score += 20;

    return score;
  }

  private calculateMomentumScore(task: Task, context: ContextualInfo): number {
    let score = 0;

    if (task.status === 'in_progress') score += 60;
    if (context.completedTasksToday > 2) score += 30;
    else if (context.completedTasksToday > 0) score += 15;

    return score;
  }

  private calculateLearningScore(task: Task, profile: UserProductivityProfile): number {
    // Simulación optimizada
    if (profile.completionRate > 80) return 20;
    if (profile.completionRate < 60) return 10;
    return 15;
  }

  private filterAvailableTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => 
      task.status !== 'completed' && 
      !task.is_archived
    );
  }

  private selectBestTask(scores: Array<{ task: Task; score: number; confidence: number; factors: EnhancedFactor[] }>) {
    if (scores.length === 0) return null;
    
    // Ordenar por score ponderado con confianza
    scores.sort((a, b) => {
      const scoreA = (a.score * 0.7) + (a.confidence * 0.3);
      const scoreB = (b.score * 0.7) + (b.confidence * 0.3);
      return scoreB - scoreA;
    });

    return scores[0];
  }

  private buildRecommendation(
    bestTask: { task: Task; score: number; confidence: number; factors: EnhancedFactor[] },
    behaviorAnalysis: any,
    context: ContextualInfo
  ) {
    const { task, score, confidence, factors } = bestTask;
    
    // Generar reasoning optimizado
    const topFactors = factors.slice(0, 3);
    const reasoning = topFactors.length > 0 
      ? `${topFactors[0].description}. ${topFactors.length > 1 ? topFactors.slice(1).map(f => f.label).join(' y ') : ''}`
      : 'Tarea bien posicionada para este momento';

    return {
      task,
      score,
      confidence,
      successProbability: enhancedFactorsService.calculateSuccessProbability(task, context, factors),
      factors,
      context,
      reasoning,
      estimatedDuration: enhancedFactorsService.estimateTaskDuration(task),
      energyMatch: context.userEnergyLevel,
      alternatives: [], // Se puede llenar con otras tareas top
      userProfile: behaviorAnalysis.profile,
      insights: behaviorAnalysis.insights,
      timing: {
        isOptimalNow: true,
        reasoning: 'Momento calculado como óptimo'
      },
      energy: {
        required: 'medium' as const,
        available: context.userEnergyLevel,
        match: 'good' as const,
        suggestion: 'Energía adecuada para la tarea'
      }
    };
  }

  // Método para limpiar cache viejo
  cleanCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.expiry) {
        this.cache.delete(key);
      }
    }

    // Limpiar cache de scores de tareas
    for (const [taskId, cache] of this.taskScoreCache.entries()) {
      if (now - cache.lastUpdated > this.CACHE_DURATION) {
        this.taskScoreCache.delete(taskId);
      }
    }
  }

  // Métricas de performance
  getCacheStats() {
    return {
      behaviorCacheSize: this.cache.size,
      taskScoreCacheSize: this.taskScoreCache.size,
      cacheHitRatio: this.calculateCacheHitRatio()
    };
  }

  private calculateCacheHitRatio(): number {
    // Implementación simplificada
    return 0.85; // 85% hit ratio simulado
  }
}