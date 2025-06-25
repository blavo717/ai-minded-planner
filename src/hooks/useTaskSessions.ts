
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface TaskSession {
  id: string;
  user_id: string;
  task_id: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  productivity_score: number | null;
  notes: string | null;
  location_id: string | null;
  created_at: string;
}

export const useTaskSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['task-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data as TaskSession[];
    },
    enabled: !!user,
  });

  const startSessionMutation = useMutation({
    mutationFn: async (taskId?: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('task_sessions')
        .insert({
          user_id: user.id,
          task_id: taskId || null,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-sessions'] });
      toast({
        title: "Sesión iniciada",
        description: "Se ha iniciado una nueva sesión de trabajo.",
      });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async ({ sessionId, productivityScore, notes }: {
      sessionId: string;
      productivityScore?: number;
      notes?: string;
    }) => {
      const endTime = new Date();
      
      // Obtener la sesión para calcular duración
      const { data: session, error: fetchError } = await supabase
        .from('task_sessions')
        .select('started_at')
        .eq('id', sessionId)
        .single();

      if (fetchError) throw fetchError;

      const startTime = new Date(session.started_at);
      const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('task_sessions')
        .update({
          ended_at: endTime.toISOString(),
          duration_minutes: durationMinutes,
          productivity_score: productivityScore || null,
          notes: notes || null,
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-sessions'] });
      toast({
        title: "Sesión finalizada",
        description: "La sesión de trabajo ha sido guardada.",
      });
    },
  });

  const activeSession = sessions.find(session => !session.ended_at);

  return {
    sessions,
    activeSession,
    isLoading,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
  };
};
