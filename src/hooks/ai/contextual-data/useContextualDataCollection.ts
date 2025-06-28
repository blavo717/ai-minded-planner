
import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ContextualData } from '@/types/contextual-data';
import { ContextualDataCollector } from '@/utils/ai/ContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useProjects } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';

export const useContextualDataCollection = (dataCollector: ContextualDataCollector) => {
  const { toast } = useToast();
  const { tasks } = useTasks();
  const { sessions } = useTaskSessions();
  const { projects } = useProjects();

  const [contextualData, setContextualData] = useState<ContextualData[]>([]);
  const [lastCollection, setLastCollection] = useState<Date | null>(null);

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

  // Función para recopilar datos manualmente
  const collectData = useCallback(async (context?: Record<string, any>) => {
    await collectDataMutation.mutateAsync(context);
  }, [collectDataMutation]);

  return {
    contextualData,
    lastCollection,
    isCollecting: collectDataMutation.isPending,
    collectData,
    error: collectDataMutation.error,
  };
};
