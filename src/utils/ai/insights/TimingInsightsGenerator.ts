
import { AIInsight, UserContext } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { InsightGenerator, InsightGenerationContext, InsightGeneratorResult } from './types';

export class TimingInsightsGenerator implements InsightGenerator {
  generateInsights(context: InsightGenerationContext): InsightGeneratorResult {
    const { analysis, userContext, existingInsights } = context;
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    const durationPatterns = analysis.patterns.filter(p => p.type === 'duration');

    // Insight sobre estimaciones
    const underestimatedPatterns = durationPatterns.filter(p => p.data.estimated_vs_actual > 1.3);
    
    if (underestimatedPatterns.length > 0 && !this.hasExistingInsight(existingInsights, 'estimation-accuracy')) {
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
        createdAt: userContext.currentTime,
        expiresAt: new Date(userContext.currentTime.getTime() + 24 * 60 * 60 * 1000), // 24 horas
      });

      patternsUsed.push(worstPattern.id);
    }

    return { insights, patternsUsed };
  }

  private hasExistingInsight(existing: AIInsight[], type: string): boolean {
    return existing.some(insight => insight.id.includes(type));
  }
}
