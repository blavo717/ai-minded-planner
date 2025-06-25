
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface TaskDependency {
  id: string;
  task_id: string;
  depends_on_task_id: string;
  dependency_type: 'blocks' | 'requires' | 'follows';
  created_at: string;
}

export interface CreateTaskDependencyData {
  task_id: string;
  depends_on_task_id: string;
  dependency_type?: 'blocks' | 'requires' | 'follows';
}

export const useTaskDependencies = (taskId?: string) => {
  const { user } = useAuth();

  const { data: dependencies = [], isLoading } = useQuery({
    queryKey: ['task-dependencies', taskId, user?.id],
    queryFn: async () => {
      if (!user || !taskId) return [];
      
      const { data, error } = await supabase
        .from('task_dependencies')
        .select(`
          *,
          depends_on_task:tasks!task_dependencies_depends_on_task_id_fkey(id, title, status)
        `)
        .eq('task_id', taskId);

      if (error) throw error;
      return data as TaskDependency[];
    },
    enabled: !!user && !!taskId,
  });

  const queryClient = useQueryClient();

  const createDependency = useMutation({
    mutationFn: async (data: CreateTaskDependencyData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: result, error } = await supabase
        .from('task_dependencies')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      toast({
        title: "Dependencia creada",
        description: "La dependencia se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear dependencia",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDependency = useMutation({
    mutationFn: async (dependencyId: string) => {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] });
      toast({
        title: "Dependencia eliminada",
        description: "La dependencia se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar dependencia",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    dependencies,
    isLoading,
    createDependency: createDependency.mutate,
    deleteDependency: deleteDependency.mutate,
    isCreating: createDependency.isPending,
    isDeleting: deleteDependency.isPending,
  };
};
