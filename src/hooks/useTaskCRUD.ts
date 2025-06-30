
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateTaskData, UpdateTaskData } from './useTasks';
import { useTaskLogMutations } from './useTaskLogMutations';

export const useTaskCRUD = () => {
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
      
      if (oldTask && data) {
        if (oldTask.status !== data.status) {
          createAutoLog(
            data.id,
            'status_change',
            'Estado actualizado',
            `Estado cambiado de "${oldTask.status}" a "${data.status}"`,
            { from: oldTask.status, to: data.status }
          );
        }
        
        if (oldTask.priority !== data.priority) {
          createAutoLog(
            data.id,
            'update',
            'Prioridad actualizada',
            `Prioridad cambiada de "${oldTask.priority}" a "${data.priority}"`,
            { from: oldTask.priority, to: data.priority, field: 'priority' }
          );
        }
        
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

  return {
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isCreatingTask: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
