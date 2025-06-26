
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDateRange, calculateProductivityMetrics } from '@/utils/analyticsCalculations';
import { ProductivityMetrics } from '@/hooks/useAnalytics';

export const useProductivityMetrics = (period: 'week' | 'month' | 'quarter' | 'year') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['productivity-metrics', user?.id, period],
    queryFn: async (): Promise<ProductivityMetrics> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, previousStartDate, now } = getDateRange(period);

      // Get all tasks
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      // Filter completed tasks by completion date
      const completedTasksInPeriod = (allTasks || []).filter(task => 
        task.status === 'completed' && 
        task.completed_at &&
        new Date(task.completed_at) >= startDate &&
        new Date(task.completed_at) <= now
      );

      const completedTasksPreviousPeriod = (allTasks || []).filter(task =>
        task.status === 'completed' && 
        task.completed_at &&
        new Date(task.completed_at) >= previousStartDate &&
        new Date(task.completed_at) < startDate
      );

      // Get sessions for current period
      const { data: currentSessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', now.toISOString());

      return calculateProductivityMetrics(
        allTasks || [],
        currentSessions || [],
        completedTasksInPeriod,
        completedTasksPreviousPeriod
      );
    },
    enabled: !!user,
  });
};
