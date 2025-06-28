
import { ContextualData, DataCollectionRule } from '@/types/contextual-data';
import { addHours } from 'date-fns';

export class DataCollectionUtils {
  /**
   * Stores collected data in the provided storage map
   */
  static storeCollectedData(
    data: ContextualData[], 
    storage: Map<string, ContextualData[]>,
    maxDataPointsPerType: number
  ): void {
    data.forEach(item => {
      const typeKey = item.type;
      
      if (!storage.has(typeKey)) {
        storage.set(typeKey, []);
      }
      
      const typeData = storage.get(typeKey)!;
      typeData.push(item);
      
      // Limitar número de datos por tipo
      if (typeData.length > maxDataPointsPerType) {
        typeData.splice(0, typeData.length - maxDataPointsPerType);
      }
    });
  }

  /**
   * Cleans expired data from storage
   */
  static cleanExpiredData(
    storage: Map<string, ContextualData[]>,
    defaultRetentionHours: number
  ): void {
    const now = new Date();
    
    for (const [type, dataPoints] of storage.entries()) {
      const validData = dataPoints.filter(data => {
        if (data.expiresAt) {
          return data.expiresAt > now;
        }
        // Usar retención por defecto
        const expiryTime = addHours(data.timestamp, defaultRetentionHours);
        return expiryTime > now;
      });
      
      storage.set(type, validData);
    }
  }

  /**
   * Generates default collection rules
   */
  static createDefaultRules(): DataCollectionRule[] {
    return [
      {
        id: 'user-behavior-periodic',
        name: 'Comportamiento del usuario periódico',
        type: 'user_behavior',
        isActive: true,
        frequency: 'periodic',
        interval: 15 * 60 * 1000, // 15 minutos
        conditions: [],
        priority: 2,
        maxDataPoints: 100,
        retentionHours: 48,
        createdAt: new Date(),
      },
      {
        id: 'productivity-realtime',
        name: 'Métricas de productividad en tiempo real',
        type: 'productivity_metrics',
        isActive: true,
        frequency: 'real_time',
        conditions: [],
        priority: 1,
        maxDataPoints: 200,
        retentionHours: 72,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * Starts periodic collection based on rules
   */
  static startPeriodicCollection(
    rules: DataCollectionRule[],
    intervals: Map<string, NodeJS.Timeout>
  ): void {
    rules
      .filter(rule => rule.isActive && rule.frequency === 'periodic' && rule.interval)
      .forEach(rule => {
        const interval = setInterval(() => {
          console.log(`Executing periodic collection for rule: ${rule.name}`);
        }, rule.interval!);
        
        intervals.set(rule.id, interval);
      });
  }
}
