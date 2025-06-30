
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useTaskLogMutations } from './useTaskLogMutations';

export const useTaskHierarchy = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createAutoLog } = useTaskLogMutations();

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
    createSubtask: createSubtaskMutation.mutate,
    createMicrotask: createMicrotaskMutation.mutate,
  };
};
