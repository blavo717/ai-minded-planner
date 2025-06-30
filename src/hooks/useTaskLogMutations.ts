
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateTaskLogData, UpdateTaskLogData } from '@/types/taskLogs';

export const useTaskLogMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createLogMutation = useMutation({
    mutationFn: async (logData: CreateTaskLogData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('🔄 Creating task log:', logData);
      
      try {
        const { data, error } = await supabase
          .from('task_logs')
          .insert({
            ...logData,
            user_id: user.id,
            log_type: logData.log_type || 'manual',
            metadata: logData.metadata || {},
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating task log:', error);
          throw error;
        }
        
        console.log('✅ Task log created successfully:', data);
        return data;
      } catch (error) {
        console.error('❌ Task log creation failed:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['task-logs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['hierarchical-logs', user?.id] });
      toast({
        title: "Log registrado",
        description: "El registro se ha añadido exitosamente.",
      });
    },
    onError: (error) => {
      console.error('❌ Task log mutation error:', error);
      toast({
        title: "Error al crear log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateLogMutation = useMutation({
    mutationFn: async (logData: UpdateTaskLogData) => {
      console.log('🔄 Updating task log:', logData.id);
      
      try {
        const { id, ...updateData } = logData;
        const { data, error } = await supabase
          .from('task_logs')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('❌ Error updating task log:', error);
          throw error;
        }
        
        console.log('✅ Task log updated successfully:', data);
        return data;
      } catch (error) {
        console.error('❌ Task log update failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-logs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['hierarchical-logs', user?.id] });
      toast({
        title: "Log actualizado",
        description: "El registro se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('❌ Task log update error:', error);
      toast({
        title: "Error al actualizar log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (logId: string) => {
      console.log('🔄 Deleting task log:', logId);
      
      try {
        const { error } = await supabase
          .from('task_logs')
          .delete()
          .eq('id', logId);

        if (error) {
          console.error('❌ Error deleting task log:', error);
          throw error;
        }
        
        console.log('✅ Task log deleted successfully');
      } catch (error) {
        console.error('❌ Task log deletion failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-logs', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['hierarchical-logs', user?.id] });
      toast({
        title: "Log eliminado",
        description: "El registro se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('❌ Task log deletion error:', error);
      toast({
        title: "Error al eliminar log",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Función helper para crear logs automáticos
  const createAutoLog = (taskId: string, logType: CreateTaskLogData['log_type'], title: string, content?: string, metadata?: Record<string, any>) => {
    console.log('🔄 Creating auto log:', { taskId, logType, title });
    createLogMutation.mutate({
      task_id: taskId,
      log_type: logType,
      title,
      content,
      metadata
    });
  };

  return {
    createLog: createLogMutation.mutate,
    updateLog: updateLogMutation.mutate,
    deleteLog: deleteLogMutation.mutate,
    createAutoLog,
    isCreatingLog: createLogMutation.isPending,
    isUpdatingLog: updateLogMutation.isPending,
    isDeletingLog: deleteLogMutation.isPending,
  };
};
