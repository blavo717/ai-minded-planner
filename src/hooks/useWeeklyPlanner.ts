import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { es } from 'date-fns/locale';

export interface WeeklyPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  planned_tasks: DayPlan[];
  optimization_strategy: 'balanced' | 'focused' | 'intensive';
  ai_confidence: number;
  completion_rate: number;
  total_estimated_hours: number;
  actual_hours: number;
  status: 'draft' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface DayPlan {
  date: string;
  dayOfWeek: number;
  tasks: PlannedTask[];
  estimatedHours: number;
  taskCount: number;
}

export interface PlannedTask {
  id: string;
  title: string;
  priority: string;
  estimated_duration: number;
  estimated_hours: number;
  suggested_time: string;
  energy_requirement: 'high' | 'medium' | 'low';
  due_date?: string;
  rationale: string;
}

export interface PlanStatistics {
  totalTasks: number;
  totalHours: number;
  plannedDays: number;
  unplannedTasks: number;
  aiConfidence: number;
  planComplexity: 'low' | 'medium' | 'high';
}

export interface OptimizationInsight {
  type: 'info' | 'tip' | 'warning';
  title: string;
  message: string;
  suggestion: string;
}

export const useWeeklyPlanner = (weekStartDate?: Date) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startDate = weekStartDate || startOfWeek(new Date(), { locale: es });
  const weekKey = format(startDate, 'yyyy-MM-dd');

  // Get current week's plan
  const { data: weeklyPlan, isLoading } = useQuery({
    queryKey: ['weekly-plan', user?.id, weekKey],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_start_date', format(startDate, 'yyyy-MM-dd'))
        .maybeSingle();

      if (error) throw error;
      return data ? {
        ...data,
        planned_tasks: (data.planned_tasks as unknown) as DayPlan[]
      } as WeeklyPlan : null;
    },
    enabled: !!user?.id,
  });

  // Get recent weekly plans for history
  const { data: recentPlans } = useQuery({
    queryKey: ['recent-weekly-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false })
        .limit(8);

      if (error) throw error;
      return (data || []).map(plan => ({
        ...plan,
        planned_tasks: (plan.planned_tasks as unknown) as DayPlan[]
      })) as WeeklyPlan[];
    },
    enabled: !!user?.id,
  });

  // Generate weekly plan
  const generatePlanMutation = useMutation({
    mutationFn: async (options: {
      weekStartDate: Date;
      strategy?: 'balanced' | 'focused' | 'intensive';
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('weekly-planner', {
        body: {
          weekStartDate: format(options.weekStartDate, 'yyyy-MM-dd'),
          strategy: options.strategy || 'balanced'
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
      queryClient.invalidateQueries({ queryKey: ['recent-weekly-plans'] });
      
      toast.success(`Plan semanal generado`, {
        description: `${data.statistics.totalTasks} tareas planificadas para ${data.statistics.plannedDays} días`,
      });
    },
    onError: (error) => {
      console.error('Error generating weekly plan:', error);
      toast.error('Error al generar el plan semanal');
    }
  });

  // Activate plan (mark as active)
  const activatePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('weekly_plans')
        .update({ status: 'active' })
        .eq('id', planId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
      toast.success('Plan semanal activado');
    }
  });

  // Update plan progress
  const updateProgressMutation = useMutation({
    mutationFn: async (updates: {
      planId: string;
      actualHours?: number;
      completionRate?: number;
    }) => {
      const { data, error } = await supabase
        .from('weekly_plans')
        .update({
          actual_hours: updates.actualHours,
          completion_rate: updates.completionRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', updates.planId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
    }
  });

  // Complete plan
  const completePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { data, error } = await supabase
        .from('weekly_plans')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-plan'] });
      queryClient.invalidateQueries({ queryKey: ['recent-weekly-plans'] });
      toast.success('Plan semanal completado');
    }
  });

  // Helper functions
  const getCurrentWeekPlan = () => weeklyPlan;
  
  const getWeekProgress = () => {
    if (!weeklyPlan) return 0;
    return Math.round((weeklyPlan.actual_hours / Math.max(weeklyPlan.total_estimated_hours, 1)) * 100);
  };

  const getTodaysTasks = () => {
    if (!weeklyPlan) return [];
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayPlan = weeklyPlan.planned_tasks.find(day => day.date === today);
    
    return todayPlan?.tasks || [];
  };

  const getUpcomingTasks = (days = 3) => {
    if (!weeklyPlan) return [];
    
    const now = new Date();
    const upcomingDays = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      upcomingDays.push(format(date, 'yyyy-MM-dd'));
    }
    
    return weeklyPlan.planned_tasks
      .filter(day => upcomingDays.includes(day.date))
      .flatMap(day => day.tasks.map(task => ({ ...task, scheduledDate: day.date })))
      .sort((a, b) => a.suggested_time.localeCompare(b.suggested_time));
  };

  const getWeeklyStats = () => {
    if (!recentPlans) return null;
    
    const completedPlans = recentPlans.filter(p => p.status === 'completed');
    const totalPlans = recentPlans.length;
    
    if (totalPlans === 0) return null;
    
    const avgCompletionRate = completedPlans.reduce((sum, p) => sum + (p.completion_rate || 0), 0) / Math.max(completedPlans.length, 1);
    const avgConfidence = recentPlans.reduce((sum, p) => sum + (p.ai_confidence || 0), 0) / totalPlans;
    
    return {
      completionRate: Math.round(avgCompletionRate),
      averageConfidence: Math.round(avgConfidence),
      totalCompleted: completedPlans.length,
      improvementTrend: completedPlans.length >= 2 ? 
        completedPlans[0].completion_rate - completedPlans[1].completion_rate : 0
    };
  };

  return {
    weeklyPlan,
    recentPlans: recentPlans || [],
    isLoading,
    generatePlan: generatePlanMutation.mutate,
    isGenerating: generatePlanMutation.isPending,
    activatePlan: activatePlanMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    completePlan: completePlanMutation.mutate,
    // Helper functions
    getCurrentWeekPlan,
    getWeekProgress,
    getTodaysTasks,
    getUpcomingTasks,
    getWeeklyStats,
    // Computed values
    weekStartDate: startDate,
    weekEndDate: endOfWeek(startDate, { locale: es }),
  };
};