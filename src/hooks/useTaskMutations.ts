import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateTaskData, UpdateTaskData } from './useTasks';
import { useTaskLogMutations } from './useTaskLogMutations';

export const useTaskMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createAutoLog } = useTaskLogMutations();

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('User not authenticated');
      
      let taskLevel = 1;
      
      if (taskData.parent_task_id) {
        const { data: parentTask, error: parentError } = await supabase
          .from('tasks')
          .select('task_level')
          .eq('id', taskData.parent_task_id)
          .single();
        
        if (parentError) throw parentError;
        
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
      
      // Crear log automático de creación
      createAutoLog(
        data.id,
        'creation',
        `${taskLevel === 1 ? 'Tarea' : taskLevel === 2 ? 'Subtarea' : 'Microtarea'} creada: ${data.title}`,
        `Se ha creado una nueva ${taskLevel === 1 ? 'tarea' : taskLevel === 2 ? 'subtarea' : 'microtarea'} con prioridad ${data.priority}`,
        {
          task_level: taskLevel,
          initial_status: data.status,
          initial_priority: data.priority
        }
      );
      
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
      
      // Obtener el estado anterior para el log
      const { data: previousTask } = await supabase
        .from('tasks')
        .select('status, priority, title')
        .eq('id', id)
        .single();
      
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
      
      // Crear log automático si cambió el status
      if (previousTask && updateData.status && previousTask.status !== updateData.status) {
        createAutoLog(
          id,
          'status_change',
          `Estado cambiado: ${previousTask.status} → ${updateData.status}`,
          `El estado de la tarea "${previousTask.title}" ha cambiado de "${previousTask.status}" a "${updateData.status}"`,
          {
            previous_status: previousTask.status,
            new_status: updateData.status,
            changed_at: new Date().toISOString()
          }
        );
      }
      
      // Crear log automático si cambió la prioridad
      if (previousTask && updateData.priority && previousTask.priority !== updateData.priority) {
        createAutoLog(
          id,
          'update',
          `Prioridad cambiada: ${previousTask.priority} → ${updateData.priority}`,
          `La prioridad de la tarea "${previousTask.title}" ha cambiado de "${previousTask.priority}" a "${updateData.priority}"`,
          {
            previous_priority: previousTask.priority,
            new_priority: updateData.priority,
            changed_at: new Date().toISOString()
          }
        );
      }
      
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
      
      // Crear log automático de completado
      createAutoLog(
        taskId,
        'completion',
        `Tarea completada: ${data.title}`,
        completionNotes || 'Tarea marcada como completada',
        {
          completed_at: data.completed_at,
          completion_notes: completionNotes
        }
      );
      
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
      console.log('🗑️ Iniciando eliminación completa de tarea:', taskId);
      
      // Obtener información de la tarea antes de eliminarla
      const { data: taskToDelete } = await supabase
        .from('tasks')
        .select('title, task_level')
        .eq('id', taskId)
        .single();
      
      try {
        // 1. Eliminar task_sessions relacionadas
        console.log('🔄 Eliminando task_sessions...');
        const { error: sessionsError } = await supabase
          .from('task_sessions')
          .delete()
          .eq('task_id', taskId);

        if (sessionsError) {
          console.error('❌ Error al eliminar task_sessions:', sessionsError);
          throw new Error(`Error eliminando sesiones: ${sessionsError.message}`);
        }

        // 2. Eliminar ai_task_monitoring relacionados
        console.log('🔄 Eliminando ai_task_monitoring...');
        const { error: monitoringError } = await supabase
          .from('ai_task_monitoring')
          .delete()
          .eq('task_id', taskId);

        if (monitoringError) {
          console.error('❌ Error al eliminar ai_task_monitoring:', monitoringError);
          throw new Error(`Error eliminando monitoreo: ${monitoringError.message}`);
        }

        // 3. Eliminar task_assignments relacionadas
        console.log('🔄 Eliminando task_assignments...');
        const { error: assignmentsError } = await supabase
          .from('task_assignments')
          .delete()
          .eq('task_id', taskId);

        if (assignmentsError) {
          console.error('❌ Error al eliminar task_assignments:', assignmentsError);
          throw new Error(`Error eliminando asignaciones: ${assignmentsError.message}`);
        }

        // 4. Eliminar task_dependencies (tanto como dependencia como dependiente)
        console.log('🔄 Eliminando task_dependencies...');
        const { error: deps1Error } = await supabase
          .from('task_dependencies')
          .delete()
          .eq('task_id', taskId);

        if (deps1Error) {
          console.error('❌ Error al eliminar task_dependencies (task_id):', deps1Error);
          throw new Error(`Error eliminando dependencias: ${deps1Error.message}`);
        }

        const { error: deps2Error } = await supabase
          .from('task_dependencies')
          .delete()
          .eq('depends_on_task_id', taskId);

        if (deps2Error) {
          console.error('❌ Error al eliminar task_dependencies (depends_on_task_id):', deps2Error);
          throw new Error(`Error eliminando dependencias inversas: ${deps2Error.message}`);
        }

        // 5. Obtener todas las subtareas y microtareas en jerarquía
        console.log('🔄 Obteniendo jerarquía de tareas...');
        const { data: subtasks, error: subtasksError } = await supabase
          .from('tasks')
          .select('id')
          .eq('parent_task_id', taskId);

        if (subtasksError) {
          console.error('❌ Error al obtener subtareas:', subtasksError);
          throw new Error(`Error obteniendo subtareas: ${subtasksError.message}`);
        }

        console.log(`📋 Encontradas ${subtasks.length} subtareas`);

        // 6. Para cada subtarea, eliminar sus microtareas y registros relacionados
        for (const subtask of subtasks) {
          console.log('🔄 Procesando subtarea:', subtask.id);
          
          // Eliminar registros relacionados de la subtarea
          await Promise.all([
            supabase.from('task_sessions').delete().eq('task_id', subtask.id),
            supabase.from('ai_task_monitoring').delete().eq('task_id', subtask.id),
            supabase.from('task_assignments').delete().eq('task_id', subtask.id),
            supabase.from('task_dependencies').delete().eq('task_id', subtask.id),
            supabase.from('task_dependencies').delete().eq('depends_on_task_id', subtask.id)
          ]);

          // Eliminar microtareas de esta subtarea
          const { error: microtasksError } = await supabase
            .from('tasks')
            .delete()
            .eq('parent_task_id', subtask.id)
            .eq('task_level', 3);

          if (microtasksError) {
            console.error('❌ Error al eliminar microtareas:', microtasksError);
            throw new Error(`Error eliminando microtareas: ${microtasksError.message}`);
          }
        }

        // 7. Eliminar todas las subtareas
        console.log('🔄 Eliminando subtareas...');
        const { error: subtasksDeleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('parent_task_id', taskId);

        if (subtasksDeleteError) {
          console.error('❌ Error al eliminar subtareas:', subtasksDeleteError);
          throw new Error(`Error eliminando subtareas: ${subtasksDeleteError.message}`);
        }

        // 8. Finalmente eliminar la tarea principal
        console.log('🔄 Eliminando tarea principal...');
        const { error: taskError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (taskError) {
          console.error('❌ Error al eliminar tarea principal:', taskError);
          throw new Error(`Error eliminando tarea principal: ${taskError.message}`);
        }

        console.log('✅ Eliminación completa exitosa:', taskId);

      } catch (error) {
        console.error('💥 Error durante la eliminación:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🎉 Eliminación exitosa, invalidando queries...');
      // Usar invalidación más específica y optimizada
      queryClient.invalidateQueries({ 
        queryKey: ['tasks', user?.id],
        refetchType: 'active' // Solo refetch de queries activas
      });
      queryClient.invalidateQueries({ 
        queryKey: ['archived-tasks', user?.id],
        refetchType: 'active'
      });
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado exitosamente junto con todos sus registros relacionados.",
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
