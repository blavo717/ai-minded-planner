
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PatternData {
  pattern_type: string;
  pattern_data: any;
  confidence_score?: number;
}

export const usePatternTracking = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const trackPatternMutation = useMutation({
    mutationFn: async (patternData: PatternData) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_patterns')
        .insert({
          user_id: user.id,
          pattern_type: patternData.pattern_type,
          pattern_data: patternData.pattern_data,
          confidence_score: patternData.confidence_score || 0.5,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-patterns'] });
    },
  });

  const trackTaskCompletion = (taskId: string, durationMinutes: number) => {
    trackPatternMutation.mutate({
      pattern_type: 'task_completion',
      pattern_data: {
        task_id: taskId,
        duration_minutes: durationMinutes,
        completed_at: new Date().toISOString(),
      },
    });
  };

  const trackWorkSession = (startTime: Date, endTime: Date, productivity: number) => {
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    trackPatternMutation.mutate({
      pattern_type: 'work_session',
      pattern_data: {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        productivity_score: productivity,
      },
    });
  };

  const trackTaskCreation = (priority: string, estimatedDuration?: number) => {
    trackPatternMutation.mutate({
      pattern_type: 'task_creation',
      pattern_data: {
        priority,
        estimated_duration: estimatedDuration,
        created_at: new Date().toISOString(),
      },
    });
  };

  return {
    trackTaskCompletion,
    trackWorkSession,
    trackTaskCreation,
    isTracking: trackPatternMutation.isPending,
  };
};
