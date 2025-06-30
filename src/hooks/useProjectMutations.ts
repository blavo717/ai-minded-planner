
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
      console.log('Iniciando eliminación del proyecto:', projectId);
      
      // Primero obtener todas las tareas asociadas al proyecto
      const { data: projectTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id')
        .eq('project_id', projectId);

      if (fetchError) {
        console.error('Error al obtener tareas del proyecto:', fetchError);
        throw fetchError;
      }

      console.log('Tareas encontradas:', projectTasks?.length || 0);

      if (projectTasks && projectTasks.length > 0) {
        const taskIds = projectTasks.map(task => task.id);
        
        // Eliminar dependencias de tareas
        const { error: depsError } = await supabase
          .from('task_dependencies')
          .delete()
          .or(`task_id.in.(${taskIds.join(',')}),depends_on_task_id.in.(${taskIds.join(',')})`);

        if (depsError) {
          console.error('Error al eliminar dependencias:', depsError);
          throw depsError;
        }

        // Eliminar asignaciones de tareas
        const { error: assignmentsError } = await supabase
          .from('task_assignments')
          .delete()
          .in('task_id', taskIds);

        if (assignmentsError) {
          console.error('Error al eliminar asignaciones:', assignmentsError);
          throw assignmentsError;
        }

        // Eliminar sesiones de tareas
        const { error: sessionsError } = await supabase
          .from('task_sessions')
          .delete()
          .in('task_id', taskIds);

        if (sessionsError) {
          console.error('Error al eliminar sesiones:', sessionsError);
          throw sessionsError;
        }

        // Eliminar monitoreo de tareas AI
        const { error: monitoringError } = await supabase
          .from('ai_task_monitoring')
          .delete()
          .in('task_id', taskIds);

        if (monitoringError) {
          console.error('Error al eliminar monitoreo AI:', monitoringError);
          throw monitoringError;
        }

        // Eliminar recordatorios inteligentes
        const { error: remindersError } = await supabase
          .from('smart_reminders')
          .delete()
          .in('task_id', taskIds);

        if (remindersError) {
          console.error('Error al eliminar recordatorios:', remindersError);
          throw remindersError;
        }
      }

      // Ahora eliminar todas las tareas del proyecto
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId);

      if (tasksError) {
        console.error('Error al eliminar tareas:', tasksError);
        throw tasksError;
      }

      // Eliminar historial del proyecto
      const { error: historyError } = await supabase
        .from('project_history')
        .delete()
        .eq('project_id', projectId);

      if (historyError) {
        console.error('Error al eliminar historial:', historyError);
        throw historyError;
      }

      // Finalmente eliminar el proyecto
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error al eliminar proyecto:', error);
        throw error;
      }

      console.log('Proyecto eliminado exitosamente');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto y todas sus tareas asociadas se han eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error en la eliminación del proyecto:', error);
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
