
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
  openrouter_api_key?: string; // Campo temporal para el formulario
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

      // Si hay una API key, la guardamos en Supabase Secrets primero
      if (config.openrouter_api_key) {
        const { error: secretError } = await supabase.functions.invoke('store-api-key', {
          body: { 
            apiKey: config.openrouter_api_key,
            userId: user.id 
          }
        });
        
        if (secretError) {
          console.error('Error storing API key:', secretError);
          throw new Error('Error al guardar la API key');
        }
      }

      // Remover la API key del objeto antes de guardar en la base de datos
      const { openrouter_api_key, ...configData } = config;

      const { error } = await supabase
        .from('llm_configurations')
        .insert({
          user_id: user.id,
          ...configData,
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
      // Si hay una API key, la actualizamos en Supabase Secrets
      if (config.openrouter_api_key) {
        const { error: secretError } = await supabase.functions.invoke('store-api-key', {
          body: { 
            apiKey: config.openrouter_api_key,
            userId: user?.id 
          }
        });
        
        if (secretError) {
          console.error('Error updating API key:', secretError);
          throw new Error('Error al actualizar la API key');
        }
      }

      // Remover la API key del objeto antes de actualizar en la base de datos
      const { openrouter_api_key, ...configData } = config;

      const { error } = await supabase
        .from('llm_configurations')
        .update(configData)
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
