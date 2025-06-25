
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface UpdateActivityData {
  taskId: string;
  communicationType?: 'email' | 'phone' | 'meeting' | 'whatsapp' | 'chat' | 'video_call' | 'in_person' | 'other';
  communicationNotes?: string;
  markAsWorked?: boolean;
  needsFollowup?: boolean;
}

export const useTaskActivity = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateActivityMutation = useMutation({
    mutationFn: async (data: UpdateActivityData) => {
      const now = new Date().toISOString();
      const updateData: Record<string, any> = {
        updated_at: now,
      };

      if (data.markAsWorked) {
        updateData.last_worked_at = now;
      }

      if (data.communicationType) {
        updateData.last_communication_at = now;
        updateData.communication_type = data.communicationType;
      }

      if (data.communicationNotes) {
        updateData.communication_notes = data.communicationNotes;
      }

      if (data.needsFollowup !== undefined) {
        updateData.needs_followup = data.needsFollowup;
      }

      const { data: result, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', data.taskId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Actividad actualizada",
        description: "La actividad de la tarea se ha registrado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar actividad",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsWorked = (taskId: string, notes?: string) => {
    updateActivityMutation.mutate({
      taskId,
      markAsWorked: true,
      communicationNotes: notes,
    });
  };

  const recordCommunication = (
    taskId: string, 
    type: 'email' | 'phone' | 'meeting' | 'whatsapp' | 'chat' | 'video_call' | 'in_person' | 'other',
    notes?: string,
    needsFollowup?: boolean
  ) => {
    updateActivityMutation.mutate({
      taskId,
      communicationType: type,
      communicationNotes: notes,
      needsFollowup,
    });
  };

  const toggleFollowup = (taskId: string, needsFollowup: boolean) => {
    updateActivityMutation.mutate({
      taskId,
      needsFollowup,
    });
  };

  return {
    markAsWorked,
    recordCommunication,
    toggleFollowup,
    updateActivity: updateActivityMutation.mutate,
    isUpdating: updateActivityMutation.isPending,
  };
};
