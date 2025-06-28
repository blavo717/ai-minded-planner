
import { AIInsight, InsightGenerationConfig, UserContext, InsightGenerationResult, InsightAction } from '@/types/ai-insights';
import { PatternAnalysisResult, WorkPattern, PatternInsight, PatternRecommendation } from '@/types/ai-patterns';
import { Task } from '@/hooks/useTasks';
import { format, isWithinInterval, startOfDay, endOfDay, getHours, differenceInHours, differenceInDays } from 'date-fns';

export class InsightGenerator {
  private config: InsightGenerationConfig;

  constructor(config: Partial<InsightGenerationConfig> = {}) {
    this.config = {
      enableProductivityInsights: true,
      enableTaskHealthInsights: true,
      enableTimingInsights: true,
      enableRecommendations: true,
      minConfidenceThreshold: 0.6,
      maxInsightsPerSession: 5,
      insightLifespanHours: 24,
      ...config,
    };
  }

  /**
   * Genera insights basados en patrones de trabajo y contexto actual
   */
  public async generateInsights(
    patternAnalysis: PatternAnalysisResult,
    userContext: UserContext,
    existingInsights: AIInsight[] = []
  ): Promise<InsightGenerationResult> {
    const startTime = Date.now();
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    try {
      // Filtrar insights existentes válidos (no expirados ni desestimados)
      const validExistingInsights = this.filterValidInsights(existingInsights);

      // Generar insights de productividad
      if (this.config.enableProductivityInsights) {
        const productivityInsights = this.generateProductivityInsights(
          patternAnalysis,
          userContext,
          validExistingInsights
        );
        insights.push(...productivityInsights.insights);
        patternsUsed.push(...productivityInsights.patternsUsed);
      }

      // Generar insights de salud de tareas
      if (this.config.enableTaskHealthInsights) {
        const healthInsights = this.generateTaskHealthInsights(
          patternAnalysis,
          userContext,
          validExistingInsights
        );
        insights.push(...healthInsights.insights);
        patternsUsed.push(...healthInsights.patternsUsed);
      }

      // Generar insights de timing
      if (this.config.enableTimingInsights) {
        const timingInsights = this.generateTimingInsights(
          patternAnalysis,
          userContext,
          validExistingInsights
        );
        insights.push(...timingInsights.insights);
        patternsUsed.push(...timingInsights.patternsUsed);
      }

      // Generar recomendaciones generales
      if (this.config.enableRecommendations) {
        const recommendationInsights = this.generateRecommendationInsights(
          patternAnalysis,
          userContext,
          validExistingInsights
        );
        insights.push(...recommendationInsights.insights);
        patternsUsed.push(...recommendationInsights.patternsUsed);
      }

      // Filtrar por confianza y limitar cantidad
      const filteredInsights = this.filterAndPrioritizeInsights(insights);
      const confidence = this.calculateOverallConfidence(filteredInsights, patternAnalysis);

      const processingTime = Date.now() - startTime;

      return {
        insights: filteredInsights,
        meta: {
          totalGenerated: insights.length,
          confidence,
          processingTime,
          patternsUsed: Array.from(new Set(patternsUsed)),
        },
      };

    } catch (error) {
      console.error('Error generating insights:', error);
      return {
        insights: [],
        meta: {
          totalGenerated: 0,
          confidence: 0,
          processingTime: Date.now() - startTime,
          patternsUsed: [],
        },
      };
    }
  }

  /**
   * Genera insights de productividad basados en patrones temporales
   */
  private generateProductivityInsights(
    analysis: PatternAnalysisResult,
    context: UserContext,
    existing: AIInsight[]
  ): { insights: AIInsight[]; patternsUsed: string[] } {
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    const temporalPatterns = analysis.patterns.filter(p => p.type === 'temporal');
    const currentHour = getHours(context.currentTime);

    // Insight sobre horario óptimo
    const bestHours = temporalPatterns
      .filter(p => p.data.productivity_score >= 4)
      .sort((a, b) => b.data.productivity_score - a.data.productivity_score);

    if (bestHours.length > 0 && !this.hasExistingInsight(existing, 'optimal-hours')) {
      const bestHour = bestHours[0];
      const isCurrentlyOptimal = Math.abs(currentHour - bestHour.data.hour) <= 1;

      insights.push({
        id: `optimal-hours-${Date.now()}`,
        type: 'productivity',
        category: isCurrentlyOptimal ? 'positive' : 'suggestion',
        title: isCurrentlyOptimal ? '¡Momento óptimo para trabajar!' : 'Optimiza tu horario de trabajo',
        description: isCurrentlyOptimal 
          ? `Estás en tu horario más productivo (${bestHour.data.hour}:00). Aprovecha para tareas importantes.`
          : `Tu mejor horario de productividad es a las ${bestHour.data.hour}:00. Considera programar tareas importantes entonces.`,
        actionable: true,
        priority: isCurrentlyOptimal ? 1 : 2,
        confidence: bestHour.confidence,
        data: { optimalHour: bestHour.data.hour, currentHour },
        actions: isCurrentlyOptimal ? [] : [{
          id: 'schedule-important-tasks',
          label: 'Programar tareas importantes',
          type: 'navigate',
          target: '/tasks'
        }],
        createdAt: context.currentTime,
        expiresAt: new Date(context.currentTime.getTime() + 4 * 60 * 60 * 1000), // 4 horas
      });

      patternsUsed.push(bestHour.id);
    }

    // Insight sobre productividad actual vs promedio
    const currentPattern = temporalPatterns.find(p => p.data.hour === currentHour);
    if (currentPattern && !this.hasExistingInsight(existing, 'current-productivity')) {
      const avgProductivity = temporalPatterns.reduce((sum, p) => sum + p.data.productivity_score, 0) / temporalPatterns.length;
      const currentScore = currentPattern.data.productivity_score;

      if (currentScore > avgProductivity + 0.5) {
        insights.push({
          id: `current-productivity-${Date.now()}`,
          type: 'productivity',
          category: 'positive',
          title: 'Momento de alta productividad',
          description: `Tu productividad actual está por encima del promedio (${currentScore.toFixed(1)} vs ${avgProductivity.toFixed(1)}). ¡Aprovecha este impulso!`,
          actionable: true,
          priority: 1,
          confidence: currentPattern.confidence,
          data: { currentScore, avgProductivity },
          actions: [{
            id: 'tackle-complex-tasks',
            label: 'Ver tareas complejas',
            type: 'navigate',
            target: '/tasks?priority=high'
          }],
          createdAt: context.currentTime,
          expiresAt: new Date(context.currentTime.getTime() + 2 * 60 * 60 * 1000), // 2 horas
        });

        patternsUsed.push(currentPattern.id);
      }
    }

    return { insights, patternsUsed };
  }

  /**
   * Genera insights sobre salud de tareas
   */
  private generateTaskHealthInsights(
    analysis: PatternAnalysisResult,
    context: UserContext,
    existing: AIInsight[]
  ): { insights: AIInsight[]; patternsUsed: string[] } {
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    const blockagePatterns = analysis.patterns.filter(p => p.type === 'blockage');

    // Insight sobre tareas estancadas
    blockagePatterns.forEach(pattern => {
      if (pattern.frequency >= 3 && !this.hasExistingInsight(existing, `blockage-${pattern.id}`)) {
        const severity = pattern.frequency > 5 ? 'critical' : 'warning';
        
        insights.push({
          id: `blockage-${pattern.id}-${Date.now()}`,
          type: 'health',
          category: severity,
          title: `${pattern.frequency} tareas necesitan atención`,
          description: `Tienes tareas que llevan mucho tiempo sin actualizarse. Esto puede indicar bloqueos o falta de claridad.`,
          actionable: true,
          priority: severity === 'critical' ? 1 : 2,
          confidence: pattern.confidence,
          data: { blockedCount: pattern.frequency, blockers: pattern.data.common_blockers },
          actions: [
            {
              id: 'review-stuck-tasks',
              label: 'Revisar tareas estancadas',
              type: 'navigate',
              target: '/tasks?filter=stuck'
            },
            {
              id: 'break-down-tasks',
              label: 'Dividir tareas grandes',
              type: 'navigate',
              target: '/tasks'
            }
          ],
          createdAt: context.currentTime,
          expiresAt: new Date(context.currentTime.getTime() + 12 * 60 * 60 * 1000), // 12 horas
        });

        patternsUsed.push(pattern.id);
      }
    });

    return { insights, patternsUsed };
  }

  /**
   * Genera insights sobre timing y duración
   */
  private generateTimingInsights(
    analysis: PatternAnalysisResult,
    context: UserContext,
    existing: AIInsight[]
  ): { insights: AIInsight[]; patternsUsed: string[] } {
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    const durationPatterns = analysis.patterns.filter(p => p.type === 'duration');

    // Insight sobre estimaciones
    const underestimatedPatterns = durationPatterns.filter(p => p.data.estimated_vs_actual > 1.3);
    
    if (underestimatedPatterns.length > 0 && !this.hasExistingInsight(existing, 'estimation-accuracy')) {
      const worstPattern = underestimatedPatterns.sort((a, b) => b.data.estimated_vs_actual - a.data.estimated_vs_actual)[0];
      const overrunPercentage = Math.round((worstPattern.data.estimated_vs_actual - 1) * 100);

      insights.push({
        id: `estimation-accuracy-${Date.now()}`,
        type: 'task_management',
        category: 'suggestion',
        title: 'Mejora tus estimaciones de tiempo',
        description: `Tus tareas de tipo "${worstPattern.data.task_type}" toman un ${overrunPercentage}% más tiempo del estimado. Considera ajustar tus estimaciones.`,
        actionable: true,
        priority: 2,
        confidence: worstPattern.confidence,
        data: { taskType: worstPattern.data.task_type, overrunPercentage },
        actions: [{
          id: 'adjust-estimates',
          label: 'Revisar estimaciones',
          type: 'navigate',
          target: '/tasks'
        }],
        createdAt: context.currentTime,
        expiresAt: new Date(context.currentTime.getTime() + 24 * 60 * 60 * 1000), // 24 horas
      });

      patternsUsed.push(worstPattern.id);
    }

    return { insights, patternsUsed };
  }

  /**
   * Genera insights basados en recomendaciones de patrones
   */
  private generateRecommendationInsights(
    analysis: PatternAnalysisResult,
    context: UserContext,
    existing: AIInsight[]
  ): { insights: AIInsight[]; patternsUsed: string[] } {
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    // Convertir recomendaciones de patrones en insights
    analysis.recommendations.forEach(rec => {
      if (!this.hasExistingInsight(existing, `rec-${rec.id}`)) {
        const priority = rec.expectedImpact === 'high' ? 1 : rec.expectedImpact === 'medium' ? 2 : 3;
        
        insights.push({
          id: `rec-${rec.id}-${Date.now()}`,
          type: 'recommendation',
          category: 'suggestion',
          title: rec.title,
          description: rec.description,
          actionable: true,
          priority,
          confidence: 0.8, // Las recomendaciones del análisis tienen alta confianza
          data: { 
            expectedImpact: rec.expectedImpact,
            effort: rec.effort,
            basedOnPatterns: rec.basedOnPatterns 
          },
          createdAt: context.currentTime,
          expiresAt: new Date(context.currentTime.getTime() + 48 * 60 * 60 * 1000), // 48 horas
        });

        patternsUsed.push(...rec.basedOnPatterns);
      }
    });

    return { insights, patternsUsed };
  }

  /**
   * Métodos auxiliares
   */
  private filterValidInsights(insights: AIInsight[]): AIInsight[] {
    const now = new Date();
    return insights.filter(insight => {
      // Filtrar insights expirados
      if (insight.expiresAt && insight.expiresAt < now) return false;
      // Filtrar insights desestimados
      if (insight.dismissedAt) return false;
      return true;
    });
  }

  private hasExistingInsight(existing: AIInsight[], type: string): boolean {
    return existing.some(insight => insight.id.includes(type));
  }

  private filterAndPrioritizeInsights(insights: AIInsight[]): AIInsight[] {
    // Filtrar por confianza mínima
    const filtered = insights.filter(insight => insight.confidence >= this.config.minConfidenceThreshold);
    
    // Ordenar por prioridad y confianza
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.confidence - a.confidence;
    });

    // Limitar cantidad
    return filtered.slice(0, this.config.maxInsightsPerSession);
  }

  private calculateOverallConfidence(insights: AIInsight[], analysis: PatternAnalysisResult): number {
    if (insights.length === 0) return 0;
    
    const avgInsightConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
    const analysisConfidence = analysis.confidence;
    
    // Promedio ponderado: 60% insights, 40% análisis
    return avgInsightConfidence * 0.6 + analysisConfidence * 0.4;
  }
}

// Instancia por defecto
export const defaultInsightGenerator = new InsightGenerator();
