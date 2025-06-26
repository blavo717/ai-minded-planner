import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, format } from 'date-fns';

export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalWorkTime: number;
  averageTaskTime: number;
  efficiency: number;
  productivity: number;
  trend: 'up' | 'down' | 'stable';
  previousPeriodComparison: number;
  hasSessionData: boolean;
}

export interface TimeDistribution {
  date: string;
  work_time: number;
  tasks_completed: number;
  productivity_score: number;
}

export interface ProjectPerformance {
  project_id: string;
  project_name: string;
  tasks_completed: number;
  total_time: number;
  efficiency: number;
  completion_rate: number;
}

export interface WorkPattern {
  hour: number;
  day_of_week: number;
  productivity_score: number;
  tasks_completed: number;
  total_sessions: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const getProductivityMetrics = (period: 'week' | 'month' | 'quarter' | 'year') => {
    return useQuery({
      queryKey: ['productivity-metrics', user?.id, period],
      queryFn: async (): Promise<ProductivityMetrics> => {
        if (!user) throw new Error('User not authenticated');

        const now = new Date();
        let startDate: Date;
        let previousStartDate: Date;

        switch (period) {
          case 'week':
            startDate = subWeeks(now, 1);
            previousStartDate = subWeeks(startDate, 1);
            break;
          case 'month':
            startDate = subMonths(now, 1);
            previousStartDate = subMonths(startDate, 1);
            break;
          case 'quarter':
            startDate = subMonths(now, 3);
            previousStartDate = subMonths(startDate, 3);
            break;
          case 'year':
            startDate = subYears(now, 1);
            previousStartDate = subYears(startDate, 1);
            break;
        }

        // Obtener TODAS las tareas del usuario (no filtrar por fecha de creación)
        const { data: allTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        // Filtrar tareas completadas por fecha de completado (no de creación)
        const completedTasksInPeriod = (allTasks || []).filter(task => 
          task.status === 'completed' && 
          task.completed_at &&
          new Date(task.completed_at) >= startDate &&
          new Date(task.completed_at) <= now
        );

        // Obtener tareas del período anterior para comparación
        const completedTasksPreviousPeriod = (allTasks || []).filter(task =>
          task.status === 'completed' && 
          task.completed_at &&
          new Date(task.completed_at) >= previousStartDate &&
          new Date(task.completed_at) < startDate
        );

        // Obtener sesiones del período actual
        const { data: currentSessions } = await supabase
          .from('task_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', startDate.toISOString())
          .lte('started_at', now.toISOString());

        const sessions = currentSessions || [];
        const completedTasks = completedTasksInPeriod.length;
        const totalTasksInSystem = (allTasks || []).length;
        
        // Métricas básicas (siempre disponibles)
        const completionRate = totalTasksInSystem > 0 ? (completedTasks / totalTasksInSystem) * 100 : 0;

        // Métricas avanzadas (requieren sesiones)
        const hasSessionData = sessions.length > 0;
        const totalWorkTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
        const averageTaskTime = completedTasks > 0 && hasSessionData ? totalWorkTime / completedTasks : 0;

        // Calcular eficiencia solo con datos reales
        const tasksWithEstimate = completedTasksInPeriod.filter(t => 
          t.estimated_duration && 
          t.actual_duration && 
          t.actual_duration > 0 &&
          t.estimated_duration > 0
        );
        const efficiency = tasksWithEstimate.length > 0 
          ? Math.min(tasksWithEstimate.reduce((sum, t) => 
              sum + (t.estimated_duration! / t.actual_duration!), 0) / tasksWithEstimate.length * 100, 200)
          : 0;

        // Calcular productividad promedio de sesiones reales
        const productivitySessions = sessions.filter(s => s.productivity_score && s.productivity_score > 0);
        const productivity = productivitySessions.length > 0
          ? productivitySessions.reduce((sum, s) => sum + s.productivity_score!, 0) / productivitySessions.length
          : 0;

        // Comparar con período anterior
        const previousCompletedTasks = completedTasksPreviousPeriod.length;
        const previousCompletionRate = previousCompletedTasks;

        const previousPeriodComparison = previousCompletedTasks > 0 
          ? ((completedTasks - previousCompletedTasks) / previousCompletedTasks) * 100 
          : completedTasks > 0 ? 100 : 0;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (previousPeriodComparison > 10) trend = 'up';
        else if (previousPeriodComparison < -10) trend = 'down';

        return {
          totalTasks: totalTasksInSystem,
          completedTasks,
          completionRate: isNaN(completionRate) ? 0 : completionRate,
          totalWorkTime: isNaN(totalWorkTime) ? 0 : totalWorkTime,
          averageTaskTime: isNaN(averageTaskTime) ? 0 : averageTaskTime,
          efficiency: isNaN(efficiency) ? 0 : efficiency,
          productivity: isNaN(productivity) ? 0 : productivity,
          trend,
          previousPeriodComparison: isNaN(previousPeriodComparison) ? 0 : previousPeriodComparison,
          hasSessionData,
        };
      },
      enabled: !!user,
    });
  };

  const getTimeDistribution = (period: 'week' | 'month' | 'quarter' | 'year') => {
    return useQuery({
      queryKey: ['time-distribution', user?.id, period],
      queryFn: async (): Promise<TimeDistribution[]> => {
        if (!user) throw new Error('User not authenticated');

        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'week':
            startDate = subWeeks(now, 1);
            break;
          case 'month':
            startDate = subMonths(now, 1);
            break;
          case 'quarter':
            startDate = subMonths(now, 3);
            break;
          case 'year':
            startDate = subYears(now, 1);
            break;
        }

        const { data: sessions } = await supabase
          .from('task_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('started_at', startDate.toISOString())
          .lte('started_at', now.toISOString());

        // Obtener tareas completadas en el período
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

        // Si no hay sesiones pero hay tareas completadas, crear distribución básica
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

        // Agrupar por día usando datos de sesiones y tareas
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

        // Calcular productividad promedio por día
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

  const getProjectPerformance = (period: 'week' | 'month' | 'quarter' | 'year') => {
    return useQuery({
      queryKey: ['project-performance', user?.id, period],
      queryFn: async (): Promise<ProjectPerformance[]> => {
        if (!user) throw new Error('User not authenticated');

        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'week':
            startDate = subWeeks(now, 1);
            break;
          case 'month':
            startDate = subMonths(now, 1);
            break;
          case 'quarter':
            startDate = subMonths(now, 3);
            break;
          case 'year':
            startDate = subYears(now, 1);
            break;
        }

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
          
          // Filtrar tareas completadas por fecha de completado
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

          // Asegurar que total_time nunca sea null/undefined
          const totalTime = projectSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
          
          const tasksWithDuration = projectTasks.filter(t => 
            t.estimated_duration && 
            t.actual_duration && 
            t.actual_duration > 0 &&
            t.estimated_duration > 0
          );
          
          // Calcular eficiencia con validación
          let efficiency = 0;
          if (tasksWithDuration.length > 0) {
            const efficiencySum = tasksWithDuration.reduce((sum, t) => 
              sum + (t.estimated_duration! / t.actual_duration!), 0);
            efficiency = Math.min((efficiencySum / tasksWithDuration.length) * 100, 200);
          }

          // Calcular completion_rate con validación
          const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return {
            project_id: project.id,
            project_name: project.name,
            tasks_completed: completedTasks,
            total_time: totalTime, // Asegurar que sea un número
            efficiency: isNaN(efficiency) ? 0 : efficiency,
            completion_rate: isNaN(completionRate) ? 0 : completionRate,
          };
        }).filter(project => 
          // Filtrar proyectos que tengan al menos algún dato relevante
          project.tasks_completed > 0 || project.total_time > 0 || project.completion_rate > 0
        );
      },
      enabled: !!user,
    });
  };

  const getWorkPatterns = (period: 'week' | 'month' | 'quarter' | 'year') => {
    return useQuery({
      queryKey: ['work-patterns', user?.id, period],
      queryFn: async (): Promise<WorkPattern[]> => {
        if (!user) throw new Error('User not authenticated');

        const now = new Date();
        let startDate: Date;

        switch (period) {
          case 'week':
            startDate = subWeeks(now, 1);
            break;
          case 'month':
            startDate = subMonths(now, 1);
            break;
          case 'quarter':
            startDate = subMonths(now, 3);
            break;
          case 'year':
            startDate = subYears(now, 1);
            break;
        }

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

        // Solo usar datos reales - no generar patrones ficticios
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

  return {
    getProductivityMetrics,
    getTimeDistribution,
    getProjectPerformance,
    getWorkPatterns,
    isLoading: false,
  };
};
