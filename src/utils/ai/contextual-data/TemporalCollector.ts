
import { ContextualData } from '@/types/contextual-data';
import { getHours, getDay } from 'date-fns';

export class TemporalCollector {
  static collectTemporalData(timestamp: Date): ContextualData[] {
    const data: ContextualData[] = [];

    const temporalInfo = {
      hour: getHours(timestamp),
      dayOfWeek: getDay(timestamp),
      isWeekend: getDay(timestamp) === 0 || getDay(timestamp) === 6,
      isBusinessHours: getHours(timestamp) >= 9 && getHours(timestamp) < 17,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      quarterOfDay: Math.floor(getHours(timestamp) / 6), // 0-3
    };

    data.push({
      id: `temporal-${timestamp.getTime()}`,
      type: 'temporal',
      category: 'real_time',
      data: temporalInfo,
      timestamp,
      relevanceScore: 0.7,
      source: 'temporal_analysis',
      metadata: {
        collectionMethod: 'automatic',
        confidence: 1.0,
        dataSources: ['system_time'],
      },
    });

    return data;
  }
}
