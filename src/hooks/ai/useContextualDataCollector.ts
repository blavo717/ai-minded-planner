
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ContextualData, 
  ContextualDataConfig, 
  DataAggregationResult, 
  ContextualDataQuery 
} from '@/types/contextual-data';
import { ContextualDataCollector } from '@/utils/ai/ContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

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

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tasks } = useTasks();
  const { sessions } = useTaskSessions();
  const { projects } = useProjects();

  const [contextualData, setContextualData] = useState<ContextualData[]>([]);
  const [lastCollection, setLastCollection] = useState<Date | null>(null);
  const [dataCollector] = useState(() => new ContextualDataCollector(config));

  // Mutation para recopilar datos contextuales
  const collectDataMutation = useMutation({
    mutationFn: async (context?: Record<string, any>) => {
      console.log('Collecting contextual data...');
      return await dataCollector.collectContextualData(tasks, sessions, projects, context);
    },
    onSuccess: (newData) => {
      setContextualData(prev => {
        // Combinar con datos existentes, evitando duplicados
        const existingIds = prev.map(d => d.id);
        const uniqueNew = newData.filter(d => !existingIds.includes(d.id));
        
        // Mantener solo los más recientes
        const combined = [...prev, ...uniqueNew];
        const maxItems = 500; // Limitar a 500 elementos
        
        if (combined.length > maxItems) {
          return combined
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, maxItems);
        }
        
        return combined;
      });
      
      setLastCollection(new Date());
      
      if (newData.length > 0) {
        console.log(`Collected ${newData.length} contextual data points`);
      }
    },
    onError: (error) => {
      console.error('Error collecting contextual data:', error);
      toast({
        title: 'Error recopilando datos contextuales',
        description: 'No se pudieron recopilar los datos contextuales.',
        variant: 'destructive',
      });
    },
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

  // Función para recopilar datos manualmente
  const collectData = useCallback(async (context?: Record<string, any>) => {
    await collectDataMutation.mutateAsync(context);
  }, [collectDataMutation]);

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

  // Auto-recolección de datos
  useEffect(() => {
    if (!autoCollect) return;

    const interval = setInterval(() => {
      if (!collectDataMutation.isPending) {
        collectData();
      }
    }, collectionInterval);

    return () => clearInterval(interval);
  }, [autoCollect, collectionInterval, collectData, collectDataMutation.isPending]);

  // Recolección inicial
  useEffect(() => {
    if (autoCollect && tasks.length > 0 && !lastCollection) {
      collectData();
    }
  }, [autoCollect, tasks.length, lastCollection, collectData]);

  // Funciones para gestionar configuración
  const updateConfig = useCallback((newConfig: Partial<ContextualDataConfig>) => {
    dataCollector.updateConfig(newConfig);
    toast({
      title: 'Configuración actualizada',
      description: 'La configuración del recopilador de datos ha sido actualizada.',
    });
  }, [dataCollector, toast]);

  const clearAllData = useCallback(() => {
    dataCollector.clearAllData();
    setContextualData([]);
    toast({
      title: 'Datos limpiados',
      description: 'Todos los datos contextuales han sido eliminados.',
    });
  }, [dataCollector, toast]);

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

  // Agregaciones útiles
  const getProductivityTrends = useCallback((days: number = 7): DataAggregationResult => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    
    return aggregateData('productivity_metrics', { start, end });
  }, [aggregateData]);

  const getUserBehaviorTrends = useCallback((days: number = 7): DataAggregationResult => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    
    return aggregateData('user_behavior', { start, end });
  }, [aggregateData]);

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
    config: dataCollector.getConfig(),
    
    // Estados
    isCollecting: collectDataMutation.isPending,
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
    
    // Error
    error: collectDataMutation.error,
  };
};
