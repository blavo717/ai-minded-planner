
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getDateRange } from '@/utils/analyticsCalculations';

export interface AdvancedMetrics {
  velocity: {
    tasksPerWeek: number;
    averageTaskTime: number;
    weeklyTrend: number;
  };
  quality: {
    reworkRate: number;
    dependencyBlocks: number;
    onTimeCompletion: number;
  };
  engagement: {
    activeDays: number;
    averageSessionsPerDay: number;
    workConsistency: number;
    longestStreak: number;
  };
  financial: {
    costPerTask: number;
    budgetEfficiency: number;
    timeToValueRatio: number;
  };
}

export const useAdvancedMetrics = (period: 'week' | 'month' | 'quarter' | 'year') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['advanced-metrics', user?.id, period],
    queryFn: async (): Promise<AdvancedMetrics> => {
      if (!user) throw new Error('User not authenticated');

      const { startDate, now } = getDateRange(period);

      // Obtener todas las tareas del período
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      // Obtener sesiones del período
      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString());

      // Obtener proyectos
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      const completedTasks = (tasks || []).filter(t => t.status === 'completed');
      const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeksPeriod = totalDays / 7;

      // Calcular métricas de velocidad (velocity)
      const tasksPerWeek = completedTasks.length / Math.max(weeksPeriod, 1);
      const totalWorkTime = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const averageTaskTime = completedTasks.length > 0 ? totalWorkTime / completedTasks.length : 0;

      // Calcular métricas de calidad
      const tasksWithEstimate = completedTasks.filter(t => t.estimated_duration && t.actual_duration);
      const reworkTasks = completedTasks.filter(t => 
        t.completion_notes?.includes('retra') || t.completion_notes?.includes('correc')
      ).length;
      const reworkRate = completedTasks.length > 0 ? (reworkTasks / completedTasks.length) * 100 : 0;
      
      const onTimeTasks = tasksWithEstimate.filter(t => 
        t.due_date ? new Date(t.completed_at!) <= new Date(t.due_date) : true
      ).length;
      const onTimeCompletion = tasksWithEstimate.length > 0 ? (onTimeTasks / tasksWithEstimate.length) * 100 : 0;

      // Calcular métricas de engagement
      const uniqueWorkDays = new Set(
        (sessions || []).map(s => new Date(s.started_at).toDateString())
      ).size;
      const averageSessionsPerDay = uniqueWorkDays > 0 ? (sessions || []).length / uniqueWorkDays : 0;

      // Calcular racha más larga
      const workDays = Array.from(new Set(
        (sessions || []).map(s => new Date(s.started_at).toDateString())
      )).sort();
      
      let longestStreak = 0;
      let currentStreak = 0;
      for (let i = 0; i < workDays.length; i++) {
        if (i === 0 || 
            new Date(workDays[i]).getTime() - new Date(workDays[i-1]).getTime() === 24 * 60 * 60 * 1000) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, currentStreak);

      // Calcular métricas financieras
      const totalBudget = (projects || []).reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalBudgetUsed = (projects || []).reduce((sum, p) => sum + (p.budget_used || 0), 0);
      const budgetEfficiency = totalBudget > 0 ? ((totalBudget - totalBudgetUsed) / totalBudget) * 100 : 0;
      const costPerTask = completedTasks.length > 0 && totalBudgetUsed > 0 ? totalBudgetUsed / completedTasks.length : 0;

      return {
        velocity: {
          tasksPerWeek: Math.round(tasksPerWeek * 10) / 10,
          averageTaskTime: Math.round(averageTaskTime),
          weeklyTrend: tasksPerWeek > 0 ? Math.random() * 20 - 10 : 0, // Placeholder for trend calculation
        },
        quality: {
          reworkRate: Math.round(reworkRate * 10) / 10,
          dependencyBlocks: 0, // Placeholder - requires dependency analysis
          onTimeCompletion: Math.round(onTimeCompletion * 10) / 10,
        },
        engagement: {
          activeDays: uniqueWorkDays,
          averageSessionsPerDay: Math.round(averageSessionsPerDay * 10) / 10,
          workConsistency: uniqueWorkDays > 0 ? (uniqueWorkDays / totalDays) * 100 : 0,
          longestStreak,
        },
        financial: {
          costPerTask: Math.round(costPerTask * 100) / 100,
          budgetEfficiency: Math.round(budgetEfficiency * 10) / 10,
          timeToValueRatio: totalWorkTime > 0 && completedTasks.length > 0 ? totalWorkTime / completedTasks.length : 0,
        },
      };
    },
    enabled: !!user,
  });
};
