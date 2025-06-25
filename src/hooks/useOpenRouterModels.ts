
import { useQuery } from '@tanstack/react-query';
import { fetchOpenRouterModels, groupModelsByProvider, OpenRouterModel, GroupedModels } from '@/services/openRouterService';

export const useOpenRouterModels = () => {
  const { data: models = [], isLoading, error } = useQuery({
    queryKey: ['openrouter-models'],
    queryFn: fetchOpenRouterModels,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 2,
  });

  const groupedModels = groupModelsByProvider(models);

  return {
    models,
    groupedModels,
    isLoading,
    error,
  };
};
