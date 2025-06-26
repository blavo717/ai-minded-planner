
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDateRange, sanitizeNumber } from '@/utils/analyticsCalculations';
import { ProjectPerformance } from '@/hooks/useAnalytics';

export const useProjectPerformance = (period: 'week' | 'month' | 'quarter' | 'year') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['project-performance', user?.id, period],
    queryFn: async (): Promise<ProjectPerformance[]> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, now } = getDateRange(period);

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      const { data: allTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString());

      if (!projects || projects.length === 0) {
        return [];
      }

      return projects.map(project => {
        const projectTasks = (allTasks || []).filter(t => t.project_id === project.id);
        
        const completedTasks = projectTasks.filter(t => 
          t.status === 'completed' && 
          t.completed_at &&
          new Date(t.completed_at) >= startDate &&
          new Date(t.completed_at) <= now
        ).length;
        
        const totalTasks = projectTasks.length;

        const projectSessions = (sessions || []).filter(s => {
          const task = projectTasks.find(t => t.id === s.task_id);
          return task?.project_id === project.id;
        });

        const totalTime = projectSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        
        const tasksWithDuration = projectTasks.filter(t => 
          t.estimated_duration && 
          t.actual_duration && 
          t.actual_duration > 0 &&
          t.estimated_duration > 0
        );
        
        let efficiency = 0;
        if (tasksWithDuration.length > 0) {
          const efficiencySum = tasksWithDuration.reduce((sum, t) => 
            sum + (t.estimated_duration! / t.actual_duration!), 0);
          efficiency = Math.min((efficiencySum / tasksWithDuration.length) * 100, 200);
        }

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        return {
          project_id: project.id,
          project_name: project.name,
          tasks_completed: completedTasks,
          total_time: totalTime,
          efficiency: sanitizeNumber(efficiency),
          completion_rate: sanitizeNumber(completionRate),
        };
      }).filter(project => 
        project.tasks_completed > 0 || project.total_time > 0 || project.completion_rate > 0
      );
    },
    enabled: !!user,
  });
};
