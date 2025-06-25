
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface DailyPlan {
  id: string;
  user_id: string;
  plan_date: string;
  planned_tasks: PlanningBlock[];
  optimization_strategy?: string;
  estimated_duration?: number;
  ai_confidence?: number;
  user_feedback?: any;
  completion_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface PlanningBlock {
  taskId: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  priority: string;
  type: 'task' | 'break' | 'buffer';
}

export interface DailyPlannerPreferences {
  workingHours?: { start: string; end: string };
  maxTasksPerBlock?: number;
  includeBreaks?: boolean;
  prioritizeHighPriority?: boolean;
}

// Función helper para convertir datos de Supabase a nuestros tipos
const transformSupabasePlan = (supabasePlan: any): DailyPlan => {
  return {
    ...supabasePlan,
    planned_tasks: Array.isArray(supabasePlan.planned_tasks) 
      ? supabasePlan.planned_tasks as PlanningBlock[]
      : [],
    user_feedback: supabasePlan.user_feedback || {},
  };
};

export const useDailyPlanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener plan del día actual
  const getTodaysPlan = useQuery({
    queryKey: ['daily-plan', user?.id, new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      if (!user) return null;
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ai_daily_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_date', today)
        .maybeSingle();

      if (error) throw error;
      return data ? transformSupabasePlan(data) : null;
    },
    enabled: !!user,
  });

  // Obtener planes de la semana
  const getWeeklyPlans = useQuery({
    queryKey: ['weekly-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      const { data, error } = await supabase
        .from('ai_daily_plans')
        .select('*')
        .eq('user_id', user.id)
        .gte('plan_date', weekStart.toISOString().split('T')[0])
        .lte('plan_date', weekEnd.toISOString().split('T')[0])
        .order('plan_date', { ascending: true });

      if (error) throw error;
      return data ? data.map(transformSupabasePlan) : [];
    },
    enabled: !!user,
  });

  // Generar nuevo plan
  const generateDailyPlan = useMutation({
    mutationFn: async ({ 
      planDate, 
      preferences 
    }: { 
      planDate: string; 
      preferences?: DailyPlannerPreferences 
    }) => {
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase.functions.invoke('ai-daily-planner', {
        body: {
          userId: user.id,
          planDate,
          preferences
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weekly-plans', user?.id] });
      toast({
        title: "Plan generado",
        description: `Plan diario creado con ${data.plan.planned_tasks.length} actividades`,
      });
    },
    onError: (error) => {
      console.error('Error generando plan:', error);
      toast({
        title: "Error al generar plan",
        description: "No se pudo generar el plan diario. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Actualizar feedback del plan
  const updatePlanFeedback = useMutation({
    mutationFn: async ({ 
      planId, 
      feedback, 
      completionRate 
    }: { 
      planId: string; 
      feedback: any; 
      completionRate?: number;
    }) => {
      const { data, error } = await supabase
        .from('ai_daily_plans')
        .update({
          user_feedback: feedback,
          completion_rate: completionRate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
      toast({
        title: "Feedback guardado",
        description: "Tu valoración del plan ha sido guardada",
      });
    },
  });

  return {
    // Datos
    todaysPlan: getTodaysPlan.data,
    weeklyPlans: getWeeklyPlans.data || [],
    
    // Estados de carga
    isLoadingTodaysPlan: getTodaysPlan.isLoading,
    isLoadingWeeklyPlans: getWeeklyPlans.isLoading,
    isGeneratingPlan: generateDailyPlan.isPending,
    isUpdatingFeedback: updatePlanFeedback.isPending,
    
    // Acciones
    generatePlan: generateDailyPlan.mutate,
    updateFeedback: updatePlanFeedback.mutate,
    
    // Utilidades
    refreshPlans: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weekly-plans', user?.id] });
    },
  };
};
