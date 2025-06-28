
import { AIInsight, UserContext } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';
import { getHours } from 'date-fns';
import { InsightGenerator, InsightGenerationContext, InsightGeneratorResult } from './types';

export class ProductivityInsightsGenerator implements InsightGenerator {
  generateInsights(context: InsightGenerationContext): InsightGeneratorResult {
    const { analysis, userContext, existingInsights } = context;
    const insights: AIInsight[] = [];
    const patternsUsed: string[] = [];

    const temporalPatterns = analysis.patterns.filter(p => p.type === 'temporal');
    const currentHour = getHours(userContext.currentTime);

    // Insight sobre horario óptimo
    const bestHours = temporalPatterns
      .filter(p => p.data.productivity_score >= 4)
      .sort((a, b) => b.data.productivity_score - a.data.productivity_score);

    if (bestHours.length > 0 && !this.hasExistingInsight(existingInsights, 'optimal-hours')) {
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
        createdAt: userContext.currentTime,
        expiresAt: new Date(userContext.currentTime.getTime() + 4 * 60 * 60 * 1000), // 4 horas
      });

      patternsUsed.push(bestHour.id);
    }

    // Insight sobre productividad actual vs promedio
    const currentPattern = temporalPatterns.find(p => p.data.hour === currentHour);
    if (currentPattern && !this.hasExistingInsight(existingInsights, 'current-productivity')) {
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
          createdAt: userContext.currentTime,
          expiresAt: new Date(userContext.currentTime.getTime() + 2 * 60 * 60 * 1000), // 2 horas
        });

        patternsUsed.push(currentPattern.id);
      }
    }

    return { insights, patternsUsed };
  }

  private hasExistingInsight(existing: AIInsight[], type: string): boolean {
    return existing.some(insight => insight.id.includes(type));
  }
}
