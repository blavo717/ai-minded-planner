
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
          provider: 'openrouter',
          api_key_name: 'OPENROUTER_API_KEY',
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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la configuración",
        variant: "destructive",
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
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la configuración",
        variant: "destructive",
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
      
      if (!data?.success) {
        throw new Error(data?.error || 'Connection test failed');
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Conexión exitosa",
        description: `El modelo ${data.model} está funcionando correctamente.`,
      });
    },
    onError: (error: any) => {
      let errorMessage = "No se pudo conectar con el modelo configurado.";
      
      if (error.message.includes('Invalid API key')) {
        errorMessage = "La API key no es válida. Verifica tu configuración en OpenRouter.";
      } else if (error.message.includes('not found')) {
        errorMessage = "El modelo seleccionado no está disponible.";
      } else if (error.message.includes('Rate limit')) {
        errorMessage = "Has excedido el límite de solicitudes. Intenta más tarde.";
      }
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
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
