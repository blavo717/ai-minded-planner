
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDateRange } from '@/utils/analyticsCalculations';
import { format } from 'date-fns';
import { TimeDistribution } from '@/hooks/useAnalytics';

export const useTimeDistribution = (period: 'week' | 'month' | 'quarter' | 'year') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['time-distribution', user?.id, period],
    queryFn: async (): Promise<TimeDistribution[]> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, now } = getDateRange(period);

      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', now.toISOString());

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

      // If no sessions but have completed tasks, create basic distribution
      if (!sessions || sessions.length === 0) {
        if (completedTasksInPeriod.length > 0) {
          const dailyData: Record<string, TimeDistribution> = {};
          
          completedTasksInPeriod.forEach(task => {
            if (task.completed_at) {
              const date = format(new Date(task.completed_at), 'yyyy-MM-dd');
              if (!dailyData[date]) {
                dailyData[date] = {
                  date,
                  work_time: 0,
                  tasks_completed: 0,
                  productivity_score: 0
                };
              }
              dailyData[date].tasks_completed += 1;
            }
          });

          return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
        }
        return [];
      }

      // Group by day using sessions and tasks data
      const dailyData: Record<string, TimeDistribution> = {};

      sessions.forEach(session => {
        const date = format(new Date(session.started_at), 'yyyy-MM-dd');
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            work_time: 0,
            tasks_completed: 0,
            productivity_score: 0
          };
        }
        dailyData[date].work_time += session.duration_minutes || 0;
        if (session.productivity_score) {
          dailyData[date].productivity_score += session.productivity_score;
        }
      });

      completedTasksInPeriod.forEach(task => {
        if (task.completed_at) {
          const date = format(new Date(task.completed_at), 'yyyy-MM-dd');
          if (!dailyData[date]) {
            dailyData[date] = {
              date,
              work_time: 0,
              tasks_completed: 0,
              productivity_score: 0
            };
          }
          dailyData[date].tasks_completed += 1;
        }
      });

      // Calculate average productivity per day
      Object.values(dailyData).forEach(day => {
        const sessionsInDay = sessions.filter(s => 
          format(new Date(s.started_at), 'yyyy-MM-dd') === day.date &&
          s.productivity_score
        );
        if (sessionsInDay.length > 0) {
          day.productivity_score = day.productivity_score / sessionsInDay.length;
        }
      });

      return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!user,
  });
};
