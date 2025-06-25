
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface LLMConfiguration {
  id: string;
  user_id: string;
  provider: string;
  api_key_name: string;
  model_name: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const OPENROUTER_MODELS = [
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Más potente y multimodal' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Rápido y económico' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Excelente para razonamiento' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', description: 'Open source potente' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'Mistral', description: 'Multilenguaje eficiente' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', description: 'Contexto largo' },
];

export const useLLMConfigurations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ['llm-configurations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('llm_configurations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LLMConfiguration[];
    },
    enabled: !!user,
  });

  const createConfigurationMutation = useMutation({
    mutationFn: async (config: Partial<LLMConfiguration>) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('llm_configurations')
        .insert({
          user_id: user.id,
          ...config,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-configurations'] });
      toast({
        title: "Configuración creada",
        description: "La configuración del LLM ha sido guardada exitosamente.",
      });
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async ({ id, ...config }: Partial<LLMConfiguration> & { id: string }) => {
      const { error } = await supabase
        .from('llm_configurations')
        .update(config)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-configurations'] });
      toast({
        title: "Configuración actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    },
  });

  const deleteConfigurationMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { error } = await supabase
        .from('llm_configurations')
        .delete()
        .eq('id', configId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-configurations'] });
      toast({
        title: "Configuración eliminada",
        description: "La configuración ha sido eliminada exitosamente.",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (configId: string) => {
      const { data, error } = await supabase.functions.invoke('test-llm-connection', {
        body: { configId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Conexión exitosa",
        description: "La configuración del LLM funciona correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el modelo configurado.",
        variant: "destructive",
      });
    },
  });

  const activeConfiguration = configurations.find(config => config.is_active);

  return {
    configurations,
    activeConfiguration,
    isLoading,
    createConfiguration: createConfigurationMutation.mutate,
    updateConfiguration: updateConfigurationMutation.mutate,
    deleteConfiguration: deleteConfigurationMutation.mutate,
    testConnection: testConnectionMutation.mutate,
    isCreating: createConfigurationMutation.isPending,
    isUpdating: updateConfigurationMutation.isPending,
    isDeleting: deleteConfigurationMutation.isPending,
    isTesting: testConnectionMutation.isPending,
  };
};
