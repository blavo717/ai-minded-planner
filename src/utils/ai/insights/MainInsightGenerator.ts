
import { AIInsight, InsightGenerationConfig, UserContext, InsightGenerationResult } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { ProductivityInsightsGenerator } from './ProductivityInsightsGenerator';
import { TaskHealthInsightsGenerator } from './TaskHealthInsightsGenerator';
import { TimingInsightsGenerator } from './TimingInsightsGenerator';
import { RecommendationInsightsGenerator } from './RecommendationInsightsGenerator';
import { InsightUtils } from './InsightUtils';
import { InsightGenerationContext } from './types';

export class MainInsightGenerator {
  private config: InsightGenerationConfig;
  private productivityGenerator: ProductivityInsightsGenerator;
  private taskHealthGenerator: TaskHealthInsightsGenerator;
  private timingGenerator: TimingInsightsGenerator;
  private recommendationGenerator: RecommendationInsightsGenerator;

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

    this.productivityGenerator = new ProductivityInsightsGenerator();
    this.taskHealthGenerator = new TaskHealthInsightsGenerator();
    this.timingGenerator = new TimingInsightsGenerator();
    this.recommendationGenerator = new RecommendationInsightsGenerator();
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
      const validExistingInsights = InsightUtils.filterValidInsights(existingInsights);
      
      const context: InsightGenerationContext = {
        analysis: patternAnalysis,
        userContext,
        existingInsights: validExistingInsights,
      };

      // Generar insights de productividad
      if (this.config.enableProductivityInsights) {
        const productivityResult = this.productivityGenerator.generateInsights(context);
        insights.push(...productivityResult.insights);
        patternsUsed.push(...productivityResult.patternsUsed);
      }

      // Generar insights de salud de tareas
      if (this.config.enableTaskHealthInsights) {
        const healthResult = this.taskHealthGenerator.generateInsights(context);
        insights.push(...healthResult.insights);
        patternsUsed.push(...healthResult.patternsUsed);
      }

      // Generar insights de timing
      if (this.config.enableTimingInsights) {
        const timingResult = this.timingGenerator.generateInsights(context);
        insights.push(...timingResult.insights);
        patternsUsed.push(...timingResult.patternsUsed);
      }

      // Generar recomendaciones generales
      if (this.config.enableRecommendations) {
        const recommendationResult = this.recommendationGenerator.generateInsights(context);
        insights.push(...recommendationResult.insights);
        patternsUsed.push(...recommendationResult.patternsUsed);
      }

      // Filtrar por confianza y limitar cantidad
      const filteredInsights = InsightUtils.filterAndPrioritizeInsights(insights, this.config);
      const confidence = InsightUtils.calculateOverallConfidence(filteredInsights, patternAnalysis);

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
}
