
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateProjectData, UpdateProjectData } from './useProjects';

export const useProjectMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          color: projectData.color || '#3B82F6',
          priority: projectData.priority || 'medium',
          progress: projectData.progress || 0,
          budget_used: 0,
          actual_hours: 0,
          custom_fields: projectData.custom_fields || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: UpdateProjectData) => {
      const { id, ...updateData } = projectData;
      
      // Si hay un cambio de estado, registrar el timestamp
      if (updateData.status) {
        updateData.last_status_change = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Registrar en el historial si es necesario
      if (user) {
        await supabase
          .from('project_history')
          .insert({
            project_id: id,
            user_id: user.id,
            change_type: 'update',
            new_values: updateData,
            notes: updateData.change_reason || 'Proyecto actualizado',
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      // Primero, desasociar todas las tareas del proyecto (ponerlas como project_id = null)
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ project_id: null })
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Ahora eliminar el proyecto
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado exitosamente. Las tareas asociadas se mantuvieron sin proyecto asignado.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  };
};
