
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDateRange } from '@/utils/analyticsCalculations';
import { WorkPattern } from '@/hooks/useAnalytics';

export const useWorkPatterns = (period: 'week' | 'month' | 'quarter' | 'year') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['work-patterns', user?.id, period],
    queryFn: async (): Promise<WorkPattern[]> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, now } = getDateRange(period);

      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString());

      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      const completedTasksInPeriod = (allTasks || []).filter(task => 
        task.status === 'completed' && 
        task.completed_at &&
        new Date(task.completed_at) >= startDate &&
        new Date(task.completed_at) <= now
      );

      if (!sessions || sessions.length === 0) {
        return [];
      }

      const patterns: Record<string, WorkPattern> = {};

      sessions.forEach(session => {
        const date = new Date(session.started_at);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        const key = `${hour}-${dayOfWeek}`;

        if (!patterns[key]) {
          patterns[key] = {
            hour,
            day_of_week: dayOfWeek,
            productivity_score: 0,
            tasks_completed: 0,
            total_sessions: 0,
          };
        }

        patterns[key].total_sessions += 1;
        if (session.productivity_score) {
          patterns[key].productivity_score += session.productivity_score;
        }
      });

      completedTasksInPeriod.forEach(task => {
        if (task.completed_at) {
          const date = new Date(task.completed_at);
          const hour = date.getHours();
          const dayOfWeek = date.getDay();
          const key = `${hour}-${dayOfWeek}`;

          if (patterns[key]) {
            patterns[key].tasks_completed += 1;
          }
        }
      });

      return Object.values(patterns).map(pattern => ({
        ...pattern,
        productivity_score: pattern.total_sessions > 0 ? pattern.productivity_score / pattern.total_sessions : 0,
      }));
    },
    enabled: !!user,
  });
};
