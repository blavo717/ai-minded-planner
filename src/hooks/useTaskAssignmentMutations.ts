
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateTaskAssignmentData } from './useTaskAssignments';

export const useTaskAssignmentMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createTaskAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: CreateTaskAssignmentData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          ...assignmentData,
          assigned_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_assignments', user?.id] });
      toast({
        title: "Asignación creada",
        description: "La tarea se ha asignado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al asignar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('task_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_assignments', user?.id] });
      toast({
        title: "Asignación eliminada",
        description: "La asignación se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar asignación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createTaskAssignment: createTaskAssignmentMutation.mutate,
    deleteTaskAssignment: deleteTaskAssignmentMutation.mutate,
    isCreatingTaskAssignment: createTaskAssignmentMutation.isPending,
    isDeletingTaskAssignment: deleteTaskAssignmentMutation.isPending,
  };
};
