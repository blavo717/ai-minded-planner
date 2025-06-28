
import { useCallback } from 'react';
import { DataAggregationResult } from '@/types/contextual-data';
import { ContextualDataCollector } from '@/utils/ai/ContextualDataCollector';

export const useContextualDataAggregations = (dataCollector: ContextualDataCollector) => {
  // Agregaciones útiles
  const getProductivityTrends = useCallback((days: number = 7): DataAggregationResult => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    
    return dataCollector.aggregateContextualData('productivity_metrics', { start, end });
  }, [dataCollector]);

  const getUserBehaviorTrends = useCallback((days: number = 7): DataAggregationResult => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    
    return dataCollector.aggregateContextualData('user_behavior', { start, end });
  }, [dataCollector]);

  const getTaskPatternTrends = useCallback((days: number = 7): DataAggregationResult => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    
    return dataCollector.aggregateContextualData('task_patterns', { start, end });
  }, [dataCollector]);

  const getEnvironmentalTrends = useCallback((days: number = 7): DataAggregationResult => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    
    return dataCollector.aggregateContextualData('environmental', { start, end });
  }, [dataCollector]);

  return {
    getProductivityTrends,
    getUserBehaviorTrends,
    getTaskPatternTrends,
    getEnvironmentalTrends,
  };
};
