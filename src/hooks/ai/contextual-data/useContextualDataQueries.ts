
import { useCallback } from 'react';
import { ContextualData, ContextualDataQuery, DataAggregationResult } from '@/types/contextual-data';
import { ContextualDataCollector } from '@/utils/ai/ContextualDataCollector';

export const useContextualDataQueries = (dataCollector: ContextualDataCollector) => {
  // Función para consultar datos contextuales
  const queryData = useCallback((query: ContextualDataQuery): ContextualData[] => {
    return dataCollector.queryContextualData(query);
  }, [dataCollector]);

  // Función para agregar datos
  const aggregateData = useCallback((
    type: ContextualData['type'],
    timeRange: { start: Date; end: Date }
  ): DataAggregationResult => {
    return dataCollector.aggregateContextualData(type, timeRange);
  }, [dataCollector]);

  // Consultas predefinidas útiles
  const getRecentData = useCallback((hours: number = 24): ContextualData[] => {
    const end = new Date();
    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
    
    return queryData({
      timeRange: { start, end },
      orderBy: 'timestamp',
      orderDirection: 'desc',
    });
  }, [queryData]);

  const getHighRelevanceData = useCallback((minScore: number = 0.7): ContextualData[] => {
    return queryData({
      minRelevanceScore: minScore,
      orderBy: 'relevanceScore',
      orderDirection: 'desc',
      limit: 50,
    });
  }, [queryData]);

  const getDataByType = useCallback((type: ContextualData['type']): ContextualData[] => {
    return queryData({
      types: [type],
      orderBy: 'timestamp',
      orderDirection: 'desc',
    });
  }, [queryData]);

  return {
    queryData,
    aggregateData,
    getRecentData,
    getHighRelevanceData,
    getDataByType,
  };
};
