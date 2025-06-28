
import { useAuth } from '@/hooks/useAuth';
import { useLLMConfigurationQueries } from './llm/queries';
import { useLLMConfigurationMutations } from './llm/mutations';

export * from './llm/types';

export const useLLMConfigurations = () => {
  const { user } = useAuth();
  
  const {
    configurations,
    activeConfiguration,
    isLoading,
  } = useLLMConfigurationQueries(user?.id);

  const {
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
  } = useLLMConfigurationMutations(user?.id);

  return {
    configurations,
    activeConfiguration,
    isLoading,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    testConnection,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
    hasActiveConfiguration: !!activeConfiguration,
  };
};
