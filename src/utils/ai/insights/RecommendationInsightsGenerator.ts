
import { AIInsight, UserContext } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { InsightGenerator, InsightGenerationContext, InsightGeneratorResult } from './types';

export class RecommendationInsightsGenerator implements InsightGenerator {
  generateInsights(context: InsightGenerationContext): InsightGeneratorResult {
    const { analysis, userContext, existingInsights } = context;
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    // Convertir recomendaciones de patrones en insights
    analysis.recommendations.forEach(rec => {
      if (!this.hasExistingInsight(existingInsights, `rec-${rec.id}`)) {
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
          createdAt: userContext.currentTime,
          expiresAt: new Date(userContext.currentTime.getTime() + 48 * 60 * 60 * 1000), // 48 horas
        });

        patternsUsed.push(...rec.basedOnPatterns);
      }
    });

    return { insights, patternsUsed };
  }

  private hasExistingInsight(existing: AIInsight[], type: string): boolean {
    return existing.some(insight => insight.id.includes(type));
  }
}
