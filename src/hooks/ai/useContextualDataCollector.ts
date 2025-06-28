
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ContextualDataConfig } from '@/types/contextual-data';
import { ContextualDataCollector } from '@/utils/ai/ContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { 
  useContextualDataCollection,
  useContextualDataQueries,
  useContextualDataAggregations,
  useContextualDataConfig,
  useContextualDataAutoCollection
} from './contextual-data';

interface UseContextualDataCollectorOptions {
  config?: Partial<ContextualDataConfig>;
  autoCollect?: boolean;
  collectionInterval?: number; // ms
}

export const useContextualDataCollector = (options: UseContextualDataCollectorOptions = {}) => {
  const {
    config = {},
    autoCollect = true,
    collectionInterval = 5 * 60 * 1000, // 5 minutos por defecto
  } = options;

  const { tasks } = useTasks();
  const [dataCollector] = useState(() => new ContextualDataCollector(config));

  // Usar los hooks modulares
  const {
    contextualData,
    lastCollection,
    isCollecting,
    collectData,
    error,
  } = useContextualDataCollection(dataCollector);

  const {
    queryData,
    aggregateData,
    getRecentData,
    getHighRelevanceData,
    getDataByType,
  } = useContextualDataQueries(dataCollector);

  const {
    getProductivityTrends,
    getUserBehaviorTrends,
    getTaskPatternTrends,
    getEnvironmentalTrends,
  } = useContextualDataAggregations(dataCollector);

  const {
    updateConfig,
    clearAllData,
    getConfig,
  } = useContextualDataConfig(dataCollector);

  // Auto-recolección
  useContextualDataAutoCollection({
    autoCollect,
    collectionInterval,
    collectData,
    isCollecting,
    tasksLength: tasks.length,
    lastCollection,
  });

  // Query para obtener resumen de datos almacenados
  const {
    data: dataSummary,
    isLoading: isLoadingSummary,
  } = useQuery({
    queryKey: ['contextual-data-summary'],
    queryFn: () => dataCollector.getStoredDataSummary(),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      dataCollector.destroy();
    };
  }, [dataCollector]);

  return {
    // Datos
    contextualData,
    dataSummary,
    config: getConfig(),
    
    // Estados
    isCollecting,
    isLoadingSummary,
    lastCollection,
    
    // Acciones principales
    collectData,
    queryData,
    aggregateData,
    
    // Configuración
    updateConfig,
    clearAllData,
    
    // Consultas predefinidas
    getRecentData,
    getHighRelevanceData,
    getDataByType,
    
    // Agregaciones
    getProductivityTrends,
    getUserBehaviorTrends,
    getTaskPatternTrends,
    getEnvironmentalTrends,
    
    // Error
    error,
  };
};
