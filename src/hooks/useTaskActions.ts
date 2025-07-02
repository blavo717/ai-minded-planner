
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useTaskLogMutations } from './useTaskLogMutations';

export const useTaskActions = () => {
  const queryClient = useQueryClient();
  const { createAutoLog } = useTaskLogMutations();

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

  const markInProgressMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'in_progress',
          last_worked_at: new Date().toISOString(),
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
      
      createAutoLog(
        data.id,
        'status_change',
        'Marcada en progreso',
        'Tarea marcada como en progreso desde modo trabajo activo'
      );
      
      toast({
        title: "Tarea en progreso",
        description: "La tarea se ha marcado como en progreso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar estado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    completeTask: completeTaskMutation.mutate,
    archiveTask: archiveTaskMutation.mutate,
    unarchiveTask: unarchiveTaskMutation.mutate,
    markInProgress: markInProgressMutation.mutate,
    isCompletingTask: completeTaskMutation.isPending,
    isArchivingTask: archiveTaskMutation.isPending,
    isUnarchivingTask: unarchiveTaskMutation.isPending,
    isMarkingInProgress: markInProgressMutation.isPending,
  };
};
