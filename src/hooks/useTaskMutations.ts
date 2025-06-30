import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateTaskData, UpdateTaskData } from './useTasks';

export const useTaskMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('User not authenticated');
      
      // Determinar task_level basado en parent_task_id
      let taskLevel = 1; // Por defecto, tarea principal
      
      if (taskData.parent_task_id) {
        // Obtener la tarea padre para determinar el nivel
        const { data: parentTask, error: parentError } = await supabase
          .from('tasks')
          .select('task_level')
          .eq('id', taskData.parent_task_id)
          .single();
        
        if (parentError) throw parentError;
        
        // El nivel es el del padre + 1 (máximo 3)
        taskLevel = Math.min(parentTask.task_level + 1, 3) as 1 | 2 | 3;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
          task_level: taskLevel,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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
      const { id, ...updateData } = taskData;
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, completionNotes }: { taskId: string; completionNotes: string }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks', user?.id] });
      toast({
        title: "Tarea desarchivada",
        description: "La tarea se ha restaurado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al desarchivar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      console.log('🗑️ Iniciando eliminación de tarea:', taskId);
      
      try {
        // Primero eliminar todas las microtareas (task_level = 3) de las subtareas de esta tarea
        const { data: subtasks, error: subtasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('parent_task_id', taskId)
          .eq('task_level', 2);

        if (subtasksError) {
          console.error('❌ Error al obtener subtareas:', subtasksError);
          throw subtasksError;
        }

        console.log('📋 Subtareas encontradas:', subtasks.length);

        // Eliminar microtareas de cada subtarea
        for (const subtask of subtasks) {
          console.log('🔄 Eliminando microtareas de subtarea:', subtask.id);
          const { error: microtasksError } = await supabase
            .from('tasks')
            .delete()
            .eq('parent_task_id', subtask.id)
            .eq('task_level', 3);

          if (microtasksError) {
            console.error('❌ Error al eliminar microtareas:', microtasksError);
            throw microtasksError;
          }
        }

        // Luego eliminar todas las subtareas (task_level = 2)
        console.log('🔄 Eliminando subtareas...');
        const { error: subtasksDeleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('parent_task_id', taskId)
          .eq('task_level', 2);

        if (subtasksDeleteError) {
          console.error('❌ Error al eliminar subtareas:', subtasksDeleteError);
          throw subtasksDeleteError;
        }

        // Finalmente eliminar la tarea principal
        console.log('🔄 Eliminando tarea principal...');
        const { error: taskError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (taskError) {
          console.error('❌ Error al eliminar tarea principal:', taskError);
          throw taskError;
        }

        console.log('✅ Tarea eliminada completamente:', taskId);
      } catch (error) {
        console.error('💥 Error durante la eliminación:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Eliminación exitosa, invalidando queries...');
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['archived-tasks', user?.id] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('💥 Error en la mutación:', error);
      toast({
        title: "Error al eliminar tarea",
        description: error.message || "No se pudo eliminar la tarea",
        variant: "destructive",
      });
    },
  });

  // Nueva función para crear microtareas
  const createMicrotask = (subtaskId: string, title: string, description?: string) => {
    createTaskMutation.mutate({
      title,
      description,
      parent_task_id: subtaskId,
      status: 'pending',
      priority: 'medium',
      task_level: 3,
    });
  };

  return {
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    archiveTask: archiveTaskMutation.mutate,
    unarchiveTask: unarchiveTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    createMicrotask,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isCompletingTask: completeTaskMutation.isPending,
    isArchivingTask: archiveTaskMutation.isPending,
    isUnarchivingTask: unarchiveTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
  };
};
