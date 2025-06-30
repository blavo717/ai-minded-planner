
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateTaskData, UpdateTaskData, Task } from './useTasks';
import { useTaskLogMutations } from './useTaskLogMutations';

export const useTaskMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createAutoLog } = useTaskLogMutations();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          task_level: taskData.task_level || 1,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // ✅ Log automático de creación
      createAutoLog(
        data.id, 
        'creation', 
        'Tarea creada', 
        `Nueva ${data.task_level === 1 ? 'tarea' : data.task_level === 2 ? 'subtarea' : 'microtarea'} creada: ${data.title}`,
        { task_level: data.task_level }
      );
      
      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: UpdateTaskData) => {
      // ✅ Obtener tarea anterior para comparar cambios
      const { data: oldTask } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskData.id)
        .single();

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...taskData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskData.id)
        .select()
        .single();

      if (error) throw error;
      
      // ✅ Crear logs automáticos para cambios importantes
      if (oldTask && data) {
        // Log de cambio de estado
        if (oldTask.status !== data.status) {
          createAutoLog(
            data.id,
            'status_change',
            'Estado actualizado',
            `Estado cambiado de "${oldTask.status}" a "${data.status}"`,
            { from: oldTask.status, to: data.status }
          );
        }
        
        // Log de cambio de prioridad
        if (oldTask.priority !== data.priority) {
          createAutoLog(
            data.id,
            'update',
            'Prioridad actualizada',
            `Prioridad cambiada de "${oldTask.priority}" a "${data.priority}"`,
            { from: oldTask.priority, to: data.priority, field: 'priority' }
          );
        }
        
        // Log de completado
        if (oldTask.status !== 'completed' && data.status === 'completed') {
          createAutoLog(
            data.id,
            'completion',
            'Tarea completada',
            `${data.task_level === 1 ? 'Tarea' : data.task_level === 2 ? 'Subtarea' : 'Microtarea'} completada exitosamente`,
            { 
              completion_date: data.completed_at,
              completion_notes: data.completion_notes 
            }
          );
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, completionNotes }: { taskId: string; completionNotes?: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completion_notes: completionNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // ✅ Log automático de completado
      createAutoLog(
        data.id,
        'completion',
        'Tarea completada',
        `${data.task_level === 1 ? 'Tarea' : data.task_level === 2 ? 'Subtarea' : 'Microtarea'} completada exitosamente`,
        { 
          completion_date: data.completed_at,
          completion_notes: data.completion_notes 
        }
      );
      
      toast({
        title: "Tarea completada",
        description: "La tarea se ha completado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al completar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const archiveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          is_archived: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks'] });
      toast({
        title: "Tarea archivada",
        description: "La tarea se ha archivado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al archivar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unarchiveTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          is_archived: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks'] });
      toast({
        title: "Tarea restaurada",
        description: "La tarea se ha restaurado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al restaurar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createSubtaskMutation = useMutation({
    mutationFn: async ({ parentTaskId, title }: { parentTaskId: string; title: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          user_id: user.id,
          parent_task_id: parentTaskId,
          task_level: 2,
          status: 'pending',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // ✅ Log automático de creación de subtarea
      createAutoLog(
        data.id,
        'creation',
        'Subtarea creada',
        `Nueva subtarea creada: ${data.title}`,
        { parent_task_id: data.parent_task_id }
      );
    },
    onError: (error) => {
      toast({
        title: "Error al crear subtarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createMicrotaskMutation = useMutation({
    mutationFn: async ({ parentSubtaskId, title }: { parentSubtaskId: string; title: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title,
          user_id: user.id,
          parent_task_id: parentSubtaskId,
          task_level: 3,
          status: 'pending',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // ✅ Log automático de creación de microtarea
      createAutoLog(
        data.id,
        'creation',
        'Microtarea creada',
        `Nueva microtarea creada: ${data.title}`,
        { parent_task_id: data.parent_task_id }
      );
    },
    onError: (error) => {
      toast({
        title: "Error al crear microtarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    archiveTask: archiveTaskMutation.mutate,
    unarchiveTask: unarchiveTaskMutation.mutate,
    createSubtask: createSubtaskMutation.mutate,
    createMicrotask: createMicrotaskMutation. mutate,
    isCreating: createTaskMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isArchivingTask: archiveTaskMutation.isPending,
    isUnarchivingTask: unarchiveTaskMutation.isPending,
  };
};
