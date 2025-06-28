
import { AIInsight, UserContext } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { InsightGenerator, InsightGenerationContext, InsightGeneratorResult } from './types';

export class TaskHealthInsightsGenerator implements InsightGenerator {
  generateInsights(context: InsightGenerationContext): InsightGeneratorResult {
    const { analysis, userContext, existingInsights } = context;
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    const blockagePatterns = analysis.patterns.filter(p => p.type === 'blockage');

    // Insight sobre tareas estancadas
    blockagePatterns.forEach(pattern => {
      if (pattern.frequency >= 3 && !this.hasExistingInsight(existingInsights, `blockage-${pattern.id}`)) {
        const severity = pattern.frequency > 5 ? 'critical' : 'warning';
        
        insights.push({
          id: `blockage-${pattern.id}-${Date.now()}`,
          type: 'task_management',
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
          createdAt: userContext.currentTime,
          expiresAt: new Date(userContext.currentTime.getTime() + 12 * 60 * 60 * 1000), // 12 horas
        });

        patternsUsed.push(pattern.id);
      }
    });

    return { insights, patternsUsed };
  }

  private hasExistingInsight(existing: AIInsight[], type: string): boolean {
    return existing.some(insight => insight.id.includes(type));
  }
}
