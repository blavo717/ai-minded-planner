
import { ContextualData, DataAggregationResult, DataTrend } from '@/types/contextual-data';
import { differenceInHours } from 'date-fns';

export class DataAggregator {
  /**
   * Performs data aggregation on contextual data
   */
  static performDataAggregation(data: ContextualData[]): Record<string, any> {
    const aggregated: Record<string, any> = {};
    
    // Agrupar por claves comunes
    const commonKeys = new Set<string>();
    data.forEach(item => {
      Object.keys(item.data).forEach(key => commonKeys.add(key));
    });
    
    commonKeys.forEach(key => {
      const values = data
        .map(item => item.data[key])
        .filter(value => value !== undefined && value !== null);
      
      if (values.length > 0) {
        // Calcular estadísticas según el tipo de dato
        if (typeof values[0] === 'number') {
          aggregated[key] = {
            avg: values.reduce((sum, val) => sum + val, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values),
            count: values.length,
          };
        } else if (typeof values[0] === 'object') {
          // Para objetos, mantener el más reciente
          aggregated[key] = values[values.length - 1];
        } else {
          // Para strings u otros tipos, contar frecuencias
          const frequency: Record<string, number> = {};
          values.forEach(val => {
            const strVal = String(val);
            frequency[strVal] = (frequency[strVal] || 0) + 1;
          });
          aggregated[key] = frequency;
        }
      }
    });
    
    return aggregated;
  }

  /**
   * Calculates trends from contextual data
   */
  static calculateTrends(
    data: ContextualData[], 
    timeRange: { start: Date; end: Date }
  ): DataTrend[] {
    const trends: DataTrend[] = [];
    
    // Analizar tendencias básicas
    const numericKeys = new Set<string>();
    data.forEach(item => {
      Object.entries(item.data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          numericKeys.add(key);
        }
      });
    });
    
    numericKeys.forEach(key => {
      const values = data
        .map(item => ({ value: item.data[key], timestamp: item.timestamp }))
        .filter(item => typeof item.value === 'number')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      
      if (values.length >= 2) {
        const firstValue = values[0].value;
        const lastValue = values[values.length - 1].value;
        const change = ((lastValue - firstValue) / firstValue) * 100;
        
        trends.push({
          metric: key,
          direction: change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable',
          magnitude: Math.abs(change),
          confidence: Math.min(values.length / 10, 1),
          timespan: differenceInHours(timeRange.end, timeRange.start),
        });
      }
    });
    
    return trends;
  }
}
