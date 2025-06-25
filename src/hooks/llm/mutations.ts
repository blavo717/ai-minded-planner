
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { llmConfigApi } from './api';
import { LLMConfiguration } from './types';

export const useLLMConfigurationMutations = (userId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createConfigurationMutation = useMutation({
    mutationFn: async (config: Partial<LLMConfiguration>) => {
      if (!userId) throw new Error('User not authenticated');
      return llmConfigApi.createConfiguration(userId, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-configurations'] });
      toast({
        title: "Configuración creada",
        description: "La configuración del LLM ha sido guardada exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al crear la configuración",
        variant: "destructive",
      });
    },
  });

  const updateConfigurationMutation = useMutation({
    mutationFn: async ({ id, ...config }: Partial<LLMConfiguration> & { id: string }) => {
      return llmConfigApi.updateConfiguration(id, config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-configurations'] });
      toast({
        title: "Configuración actualizada",
        description: "Los cambios han sido guardados exitosamente.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Error al actualizar la configuración",
        variant: "destructive",
      });
    },
  });

  const deleteConfigurationMutation = useMutation({
    mutationFn: llmConfigApi.deleteConfiguration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-configurations'] });
      toast({
        title: "Configuración eliminada",
        description: "La configuración ha sido eliminada exitosamente.",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: llmConfigApi.testConnection,
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

  return {
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
