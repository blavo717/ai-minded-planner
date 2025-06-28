
import { AIInsight, InsightGenerationConfig } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';

export class InsightUtils {
  /**
   * Filtra insights válidos (no expirados ni desestimados)
   */
  static filterValidInsights(insights: AIInsight[]): AIInsight[] {
    const now = new Date();
    return insights.filter(insight => {
      // Filtrar insights expirados
      if (insight.expiresAt && insight.expiresAt < now) return false;
      // Filtrar insights desestimados
      if (insight.dismissedAt) return false;
      return true;
    });
  }

  /**
   * Verifica si existe un insight de un tipo específico
   */
  static hasExistingInsight(existing: AIInsight[], type: string): boolean {
    return existing.some(insight => insight.id.includes(type));
  }

  /**
   * Filtra y prioriza insights basado en configuración
   */
  static filterAndPrioritizeInsights(
    insights: AIInsight[], 
    config: InsightGenerationConfig
  ): AIInsight[] {
    // Filtrar por confianza mínima
    const filtered = insights.filter(insight => insight.confidence >= config.minConfidenceThreshold);
    
    // Ordenar por prioridad y confianza
    filtered.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.confidence - a.confidence;
    });

    // Limitar cantidad
    return filtered.slice(0, config.maxInsightsPerSession);
  }

  /**
   * Calcula la confianza general del análisis
   */
  static calculateOverallConfidence(insights: AIInsight[], analysis: PatternAnalysisResult): number {
    if (insights.length === 0) return 0;
    
    const avgInsightConfidence = insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length;
    const analysisConfidence = analysis.confidence;
    
    // Promedio ponderado: 60% insights, 40% análisis
    return avgInsightConfidence * 0.6 + analysisConfidence * 0.4;
  }
}
