
import { useQuery } from '@tanstack/react-query';
import { llmConfigApi } from './api';
import { LLMConfiguration } from './types';

export const useLLMConfigurationQueries = (userId: string | undefined) => {
  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['llm-configurations', userId],
    queryFn: async () => {
      if (!userId) return [];
      return llmConfigApi.getConfigurations(userId);
    },
    enabled: !!userId,
  });

  const activeConfiguration = configurations.find(config => config.is_active);

  return {
    configurations,
    activeConfiguration,
    isLoading,
  };
};
