
import { useCallback } from 'react';
import { ContextualDataConfig } from '@/types/contextual-data';
import { ContextualDataCollector } from '@/utils/ai/ContextualDataCollector';
import { useToast } from '@/hooks/use-toast';

export const useContextualDataConfig = (dataCollector: ContextualDataCollector) => {
  const { toast } = useToast();

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
    toast({
      title: 'Datos limpiados',
      description: 'Todos los datos contextuales han sido eliminados.',
    });
  }, [dataCollector, toast]);

  const getConfig = useCallback(() => {
    return dataCollector.getConfig();
  }, [dataCollector]);

  return {
    updateConfig,
    clearAllData,
    getConfig,
  };
};
