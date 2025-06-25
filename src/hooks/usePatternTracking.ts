
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

      // Llamar a la Edge Function para procesar el patrón
      const { data, error } = await supabase.functions.invoke('pattern-tracker', {
        body: {
          pattern_type: patternData.pattern_type,
          pattern_data: patternData.pattern_data,
        }
      });

      if (error) throw error;
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['user-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      
      console.log('Pattern tracked successfully:', data);
    },
    onError: (error) => {
      console.error('Error tracking pattern:', error);
    },
  });

  const trackTaskCompletion = (taskId: string, durationMinutes: number, taskTitle?: string, taskPriority?: string) => {
    trackPatternMutation.mutate({
      pattern_type: 'task_completion',
      pattern_data: {
        task_id: taskId,
        task_title: taskTitle,
        task_priority: taskPriority,
        duration_minutes: durationMinutes,
        completed_at: new Date().toISOString(),
        day_of_week: new Date().getDay(),
        hour_of_day: new Date().getHours(),
      },
      confidence_score: 0.8,
    });
  };

  const trackWorkSession = (startTime: Date, endTime: Date, productivity: number, taskId?: string, location?: string) => {
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    trackPatternMutation.mutate({
      pattern_type: 'work_session',
      pattern_data: {
        task_id: taskId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        productivity_score: productivity,
        location: location,
        day_of_week: startTime.getDay(),
        hour_of_day: startTime.getHours(),
        session_quality: productivity >= 4 ? 'high' : productivity >= 3 ? 'medium' : 'low',
      },
      confidence_score: 0.9,
    });
  };

  const trackTaskCreation = (priority: string, estimatedDuration?: number, projectId?: string, category?: string) => {
    trackPatternMutation.mutate({
      pattern_type: 'task_creation',
      pattern_data: {
        priority,
        estimated_duration: estimatedDuration,
        project_id: projectId,
        category: category,
        created_at: new Date().toISOString(),
        day_of_week: new Date().getDay(),
        hour_of_day: new Date().getHours(),
      },
      confidence_score: 0.6,
    });
  };

  const trackFocusSession = (focusMinutes: number, distractions: number, taskType?: string) => {
    trackPatternMutation.mutate({
      pattern_type: 'focus_session',
      pattern_data: {
        focus_duration: focusMinutes,
        distraction_count: distractions,
        task_type: taskType,
        focus_quality: distractions === 0 ? 'excellent' : distractions <= 2 ? 'good' : 'poor',
        timestamp: new Date().toISOString(),
        day_of_week: new Date().getDay(),
        hour_of_day: new Date().getHours(),
      },
      confidence_score: 0.7,
    });
  };

  return {
    trackTaskCompletion,
    trackWorkSession,
    trackTaskCreation,
    trackFocusSession,
    isTracking: trackPatternMutation.isPending,
  };
};
