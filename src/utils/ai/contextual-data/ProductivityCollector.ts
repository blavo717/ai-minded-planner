
import { ContextualData } from '@/types/contextual-data';
import { TaskSession } from '@/hooks/useTaskSessions';
import { getHours } from 'date-fns';

export class ProductivityCollector {
  static collectProductivityMetrics(sessions: TaskSession[], timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    if (sessions.length === 0) return data;

    // Métricas de productividad por hora del día
    const hourlyProductivity = this.calculateHourlyProductivity(sessions);
    
    data.push({
      id: `productivity-hourly-${timestamp.getTime()}`,
      type: 'productivity_metrics',
      category: 'historical',
      data: {
        hourlyProductivity,
        peakHours: this.findPeakProductivityHours(hourlyProductivity),
        averageProductivity: Object.values(hourlyProductivity).reduce((a, b) => a + b, 0) / 24,
      },
      timestamp,
      relevanceScore: 0.9,
      source: 'productivity_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 0.85,
        dataSources: ['task_sessions'],
      },
    });

    return data;
  }

  private static calculateHourlyProductivity(sessions: TaskSession[]): Record<number, number> {
    const hourlyData: Record<number, number[]> = {};
    
    // Inicializar todas las horas
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = [];
    }
    
    sessions.forEach(session => {
      if (session.productivity_score !== null) {
        const hour = getHours(new Date(session.started_at));
        hourlyData[hour].push(session.productivity_score);
      }
    });
    
    // Calcular promedio por hora
    const hourlyProductivity: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      const scores = hourlyData[i];
      hourlyProductivity[i] = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
    }
    
    return hourlyProductivity;
  }

  private static findPeakProductivityHours(hourlyProductivity: Record<number, number>): number[] {
    const entries = Object.entries(hourlyProductivity);
    const avgProductivity = entries.reduce((sum, [_, score]) => sum + score, 0) / entries.length;
    
    return entries
      .filter(([_, score]) => score > avgProductivity * 1.2)
      .map(([hour, _]) => parseInt(hour))
      .sort((a, b) => hourlyProductivity[b] - hourlyProductivity[a]);
  }
}
