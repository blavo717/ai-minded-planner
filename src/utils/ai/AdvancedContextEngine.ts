
import { AIInsight } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { Task } from '@/hooks/useTasks';
import { TaskSession } from '@/hooks/useTaskSessions';
import { ContextualData } from '@/types/contextual-data';

export interface AdvancedContextConfig {
  enableDeepAnalysis: boolean;
  enablePredictiveModeling: boolean;
  enableCrossPatternAnalysis: boolean;
  contextDepth: 'shallow' | 'medium' | 'deep';
  analysisWindowDays: number;
  confidenceThreshold: number;
}

export interface ContextualRecommendation {
  id: string;
  type: 'task_optimization' | 'workflow_improvement' | 'time_management' | 'productivity_boost';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  confidence: number;
  basedOnPatterns: string[];
  actionItems: string[];
  estimatedTimeToImplement: number; // minutes
  expectedResults: string[];
  createdAt: Date;
}

export interface AdvancedContext {
  userBehaviorProfile: {
    workingHours: [number, number];
    peakProductivityHours: number[];
    preferredTaskTypes: string[];
    averageTaskDuration: number;
    multitaskingTendency: number;
    procrastinationPatterns: Array<{ trigger: string; frequency: number }>;
    motivationalFactors: string[];
  };
  workflowEfficiency: {
    overallScore: number;
    bottlenecks: Array<{ area: string; severity: number; suggestions: string[] }>;
    optimizationOpportunities: Array<{ area: string; potential: number; description: string }>;
    completionPatterns: Record<string, number>;
  };
  predictiveInsights: {
    taskCompletionProbability: Record<string, number>;
    estimatedProductivityTrends: Array<{ date: string; score: number }>;
    recommendedFocusAreas: string[];
    riskFactors: Array<{ factor: string; probability: number; mitigation: string }>;
  };
  contextualRecommendations: ContextualRecommendation[];
}

export class AdvancedContextEngine {
  private config: AdvancedContextConfig;

  constructor(config: Partial<AdvancedContextConfig> = {}) {
    this.config = {
      enableDeepAnalysis: true,
      enablePredictiveModeling: true,
      enableCrossPatternAnalysis: true,
      contextDepth: 'deep',
      analysisWindowDays: 30,
      confidenceThreshold: 0.7,
      ...config,
    };
  }

  /**
   * Genera contexto avanzado basado en datos históricos y patrones
   */
  public async generateAdvancedContext(
    tasks: Task[],
    sessions: TaskSession[],
    patterns: PatternAnalysisResult,
    contextualData: ContextualData,
    insights: AIInsight[]
  ): Promise<AdvancedContext> {
    const userProfile = this.analyzeUserBehaviorProfile(tasks, sessions, patterns);
    const workflowEfficiency = this.analyzeWorkflowEfficiency(tasks, sessions, patterns);
    const predictiveInsights = this.generatePredictiveInsights(tasks, sessions, patterns, contextualData);
    const recommendations = this.generateContextualRecommendations(
      userProfile,
      workflowEfficiency,
      predictiveInsights,
      patterns
    );

    return {
      userBehaviorProfile: userProfile,
      workflowEfficiency,
      predictiveInsights,
      contextualRecommendations: recommendations,
    };
  }

  private analyzeUserBehaviorProfile(
    tasks: Task[],
    sessions: TaskSession[],
    patterns: PatternAnalysisResult
  ) {
    // Análisis de horas de trabajo
    const workingSessions = sessions.filter(s => s.ended_at);
    const workingHours = this.extractWorkingHours(workingSessions);
    
    // Horas de pico de productividad
    const peakHours = this.identifyPeakProductivityHours(sessions, patterns);
    
    // Tipos de tareas preferidas
    const taskTypePreferences = this.analyzeTaskTypePreferences(tasks, sessions);
    
    // Duración promedio de tareas
    const avgTaskDuration = this.calculateAverageTaskDuration(tasks);
    
    // Tendencia al multitasking
    const multitaskingTendency = this.calculateMultitaskingTendency(sessions);
    
    // Patrones de procrastinación
    const procrastinationPatterns = this.identifyProcrastinationPatterns(tasks, patterns);
    
    // Factores motivacionales
    const motivationalFactors = this.identifyMotivationalFactors(tasks, sessions, patterns);

    return {
      workingHours,
      peakProductivityHours: peakHours,
      preferredTaskTypes: taskTypePreferences,
      averageTaskDuration: avgTaskDuration,
      multitaskingTendency,
      procrastinationPatterns,
      motivationalFactors,
    };
  }

  private analyzeWorkflowEfficiency(
    tasks: Task[],
    sessions: TaskSession[],
    patterns: PatternAnalysisResult
  ) {
    // Calcular score general de eficiencia
    const overallScore = this.calculateOverallEfficiencyScore(tasks, sessions, patterns);
    
    // Identificar cuellos de botella
    const bottlenecks = this.identifyBottlenecks(tasks, sessions, patterns);
    
    // Encontrar oportunidades de optimización
    const optimizationOpportunities = this.findOptimizationOpportunities(tasks, sessions, patterns);
    
    // Analizar patrones de completitud
    const completionPatterns = this.analyzeCompletionPatterns(tasks);

    return {
      overallScore,
      bottlenecks,
      optimizationOpportunities,
      completionPatterns,
    };
  }

  private generatePredictiveInsights(
    tasks: Task[],
    sessions: TaskSession[],
    patterns: PatternAnalysisResult,
    contextualData: ContextualData
  ) {
    // Probabilidad de completar tareas
    const taskCompletionProbability = this.predictTaskCompletionProbability(tasks, patterns);
    
    // Tendencias de productividad estimadas
    const productivityTrends = this.predictProductivityTrends(sessions, patterns, contextualData);
    
    // Áreas de enfoque recomendadas
    const focusAreas = this.recommendFocusAreas(tasks, patterns);
    
    // Factores de riesgo
    const riskFactors = this.identifyRiskFactors(tasks, sessions, patterns);

    return {
      taskCompletionProbability,
      estimatedProductivityTrends: productivityTrends,
      recommendedFocusAreas: focusAreas,
      riskFactors,
    };
  }

  private generateContextualRecommendations(
    userProfile: any,
    efficiency: any,
    predictive: any,
    patterns: PatternAnalysisResult
  ): ContextualRecommendation[] {
    const recommendations: ContextualRecommendation[] = [];

    // Recomendaciones basadas en eficiencia del flujo de trabajo
    if (efficiency.overallScore < 0.7) {
      recommendations.push({
        id: `workflow-opt-${Date.now()}`,
        type: 'workflow_improvement',
        title: 'Optimizar flujo de trabajo',
        description: 'Tu eficiencia general está por debajo del 70%. Considera reorganizar tus procesos.',
        impact: 'high',
        effort: 'medium',
        confidence: 0.85,
        basedOnPatterns: patterns.patterns.slice(0, 3).map(p => p.id),
        actionItems: [
          'Identificar tareas que toman más tiempo del esperado',
          'Establecer bloques de tiempo específicos para tipos de tareas similares',
          'Reducir interrupciones durante el trabajo profundo'
        ],
        estimatedTimeToImplement: 60,
        expectedResults: [
          'Aumento del 15-25% en productividad',
          'Reducción del estrés relacionado con gestión del tiempo',
          'Mayor satisfacción con el trabajo realizado'
        ],
        createdAt: new Date(),
      });
    }

    // Recomendaciones basadas en horas de pico
    if (userProfile.peakProductivityHours.length > 0) {
      const peakHour = userProfile.peakProductivityHours[0];
      recommendations.push({
        id: `peak-hours-${Date.now()}`,
        type: 'time_management',
        title: 'Aprovechar horas de máxima productividad',
        description: `Tus horas más productivas son alrededor de las ${peakHour}:00. Programa tareas importantes en este horario.`,
        impact: 'high',
        effort: 'low',
        confidence: 0.9,
        basedOnPatterns: patterns.patterns.filter(p => p.type === 'temporal').map(p => p.id),
        actionItems: [
          `Bloquear el horario ${peakHour}:00-${peakHour + 2}:00 para trabajo profundo`,
          'Mover reuniones y tareas administrativas fuera de este horario',
          'Preparar el entorno de trabajo antes de tu hora pico'
        ],
        estimatedTimeToImplement: 30,
        expectedResults: [
          'Mayor calidad en el trabajo realizado',
          'Completar tareas complejas más rápidamente',
          'Reducir la fatiga mental'
        ],
        createdAt: new Date(),
      });
    }

    return recommendations;
  }

  // Métodos auxiliares (implementaciones simplificadas para el ejemplo)
  private extractWorkingHours(sessions: TaskSession[]): [number, number] {
    if (sessions.length === 0) return [9, 17];
    
    const hours = sessions.map(s => new Date(s.started_at).getHours());
    const earliestHour = Math.min(...hours);
    const latestHour = Math.max(...hours);
    
    return [earliestHour, latestHour];
  }

  private identifyPeakProductivityHours(sessions: TaskSession[], patterns: PatternAnalysisResult): number[] {
    const temporalPatterns = patterns.patterns.filter(p => p.type === 'temporal');
    return temporalPatterns
      .filter(p => p.data.productivity_score >= 4)
      .map(p => p.data.hour)
      .slice(0, 3);
  }

  private analyzeTaskTypePreferences(tasks: Task[], sessions: TaskSession[]): string[] {
    const taskTypeCount: Record<string, number> = {};
    
    tasks.forEach(task => {
      const category = task.tags?.[0] || 'general';
      taskTypeCount[category] = (taskTypeCount[category] || 0) + 1;
    });
    
    return Object.entries(taskTypeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type]) => type);
  }

  private calculateAverageTaskDuration(tasks: Task[]): number {
    const completedTasks = tasks.filter(t => t.actual_duration);
    if (completedTasks.length === 0) return 0;
    
    const totalDuration = completedTasks.reduce((sum, t) => sum + (t.actual_duration || 0), 0);
    return totalDuration / completedTasks.length;
  }

  private calculateMultitaskingTendency(sessions: TaskSession[]): number {
    // Simplificado: calcular basado en cambios frecuentes de tareas
    const sessionsByDay = sessions.reduce((acc, session) => {
      const day = new Date(session.started_at).toDateString();
      if (!acc[day]) acc[day] = [];
      acc[day].push(session);
      return acc;
    }, {} as Record<string, TaskSession[]>);

    let totalSwitches = 0;
    let totalDays = 0;

    Object.values(sessionsByDay).forEach(daySessions => {
      if (daySessions.length > 1) {
        const switches = daySessions.length - 1;
        totalSwitches += switches;
        totalDays++;
      }
    });

    return totalDays > 0 ? totalSwitches / totalDays : 0;
  }

  private identifyProcrastinationPatterns(tasks: Task[], patterns: PatternAnalysisResult) {
    const blockagePatterns = patterns.patterns.filter(p => p.type === 'blockage');
    return blockagePatterns.map(pattern => ({
      trigger: pattern.data.common_blockers?.[0] || 'Tarea compleja',
      frequency: pattern.frequency
    }));
  }

  private identifyMotivationalFactors(tasks: Task[], sessions: TaskSession[], patterns: PatternAnalysisResult): string[] {
    const factors = [];
    
    // Analizar patrones de completitud exitosa
    const completedTasks = tasks.filter(t => t.status === 'completed');
    if (completedTasks.length > 0) {
      factors.push('Sensación de logro al completar tareas');
    }
    
    // Analizar patrones temporales positivos
    const productivePatterns = patterns.patterns.filter(p => 
      p.type === 'temporal' && p.data.productivity_score >= 4
    );
    if (productivePatterns.length > 0) {
      factors.push('Trabajo en horarios óptimos');
    }
    
    return factors;
  }

  private calculateOverallEfficiencyScore(tasks: Task[], sessions: TaskSession[], patterns: PatternAnalysisResult): number {
    const completionRate = tasks.filter(t => t.status === 'completed').length / Math.max(tasks.length, 1);
    const avgConfidence = patterns.confidence;
    return (completionRate + avgConfidence) / 2;
  }

  private identifyBottlenecks(tasks: Task[], sessions: TaskSession[], patterns: PatternAnalysisResult) {
    const bottlenecks = [];
    
    const blockagePatterns = patterns.patterns.filter(p => p.type === 'blockage');
    if (blockagePatterns.length > 0) {
      bottlenecks.push({
        area: 'Gestión de tareas bloqueadas',
        severity: blockagePatterns[0].frequency / 10,
        suggestions: [
          'Dividir tareas complejas en subtareas más pequeñas',
          'Identificar dependencias antes de comenzar',
          'Establecer checkpoints regulares'
        ]
      });
    }
    
    return bottlenecks;
  }

  private findOptimizationOpportunities(tasks: Task[], sessions: TaskSession[], patterns: PatternAnalysisResult) {
    const opportunities = [];
    
    const durationPatterns = patterns.patterns.filter(p => p.type === 'duration');
    if (durationPatterns.some(p => p.data.estimated_vs_actual > 1.5)) {
      opportunities.push({
        area: 'Estimación de tiempo',
        potential: 0.8,
        description: 'Mejorar la precisión en estimaciones puede reducir el estrés y mejorar la planificación'
      });
    }
    
    return opportunities;
  }

  private analyzeCompletionPatterns(tasks: Task[]): Record<string, number> {
    const patterns: Record<string, number> = {
      'completed_on_time': 0,
      'completed_early': 0,
      'completed_late': 0,
      'not_completed': 0,
    };
    
    tasks.forEach(task => {
      if (task.status === 'completed') {
        if (task.due_date && task.completed_at) {
          const dueDate = new Date(task.due_date);
          const completedDate = new Date(task.completed_at);
          
          if (completedDate <= dueDate) {
            patterns.completed_on_time++;
          } else {
            patterns.completed_late++;
          }
        } else {
          patterns.completed_on_time++;
        }
      } else {
        patterns.not_completed++;
      }
    });
    
    return patterns;
  }

  private predictTaskCompletionProbability(tasks: Task[], patterns: PatternAnalysisResult): Record<string, number> {
    const probabilities: Record<string, number> = {};
    
    tasks.filter(t => t.status !== 'completed').forEach(task => {
      let probability = 0.5; // Base probability
      
      // Ajustar basado en prioridad
      if (task.priority === 'high' || task.priority === 'urgent') {
        probability += 0.2;
      } else if (task.priority === 'low') {
        probability -= 0.1;
      }
      
      // Ajustar basado en fecha límite
      if (task.due_date) {
        const daysUntilDue = (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        if (daysUntilDue < 1) probability += 0.3;
        else if (daysUntilDue < 3) probability += 0.1;
        else if (daysUntilDue > 7) probability -= 0.1;
      }
      
      probabilities[task.id] = Math.max(0.1, Math.min(0.9, probability));
    });
    
    return probabilities;
  }

  private predictProductivityTrends(
    sessions: TaskSession[], 
    patterns: PatternAnalysisResult, 
    contextualData: ContextualData
  ) {
    const trends = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      let score = 0.5; // Base score
      
      // Ajustar basado en patrones temporales
      const dayOfWeek = date.getDay();
      const temporalPatterns = patterns.patterns.filter(p => p.type === 'temporal');
      const dayPattern = temporalPatterns.find(p => p.data.day_of_week === dayOfWeek);
      
      if (dayPattern) {
        score = dayPattern.data.productivity_score / 5;
      }
      
      trends.push({
        date: date.toISOString().split('T')[0],
        score: Math.max(0.1, Math.min(1.0, score))
      });
    }
    
    return trends;
  }

  private recommendFocusAreas(tasks: Task[], patterns: PatternAnalysisResult): string[] {
    const areas = [];
    
    // Analizar tareas pendientes por categoría
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    const categoryCount: Record<string, number> = {};
    
    pendingTasks.forEach(task => {
      const category = task.tags?.[0] || 'general';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
    // Recomendar las categorías con más tareas pendientes
    const sortedCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);
    
    areas.push(...sortedCategories);
    
    return areas;
  }

  private identifyRiskFactors(tasks: Task[], sessions: TaskSession[], patterns: PatternAnalysisResult) {
    const risks = [];
    
    // Riesgo de burnout basado en sesiones largas
    const longSessions = sessions.filter(s => (s.duration_minutes || 0) > 240); // >4 horas
    if (longSessions.length > sessions.length * 0.3) {
      risks.push({
        factor: 'Riesgo de burnout por sesiones muy largas',
        probability: 0.7,
        mitigation: 'Implementar descansos regulares cada 90-120 minutos'
      });
    }
    
    // Riesgo de acumulación de tareas
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    );
    if (overdueTasks.length > 3) {
      risks.push({
        factor: 'Acumulación de tareas vencidas',
        probability: 0.8,
        mitigation: 'Revisar y repriorizar tareas, considerar delegar o eliminar algunas'
      });
    }
    
    return risks;
  }
}

// Instancia por defecto
export const defaultAdvancedContextEngine = new AdvancedContextEngine();
