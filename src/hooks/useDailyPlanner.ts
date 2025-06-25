
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
      
      try {
        const { data, error } = await supabase
          .from('ai_daily_plans')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_date', today)
          .maybeSingle();

        if (error) {
          console.error('Error fetching today\'s plan:', error);
          throw error;
        }
        
        return data ? transformSupabasePlan(data) : null;
      } catch (error) {
        console.error('Error in getTodaysPlan:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });

  // Obtener planes de la semana
  const getWeeklyPlans = useQuery({
    queryKey: ['weekly-plans', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      try {
        const { data, error } = await supabase
          .from('ai_daily_plans')
          .select('*')
          .eq('user_id', user.id)
          .gte('plan_date', weekStart.toISOString().split('T')[0])
          .lte('plan_date', weekEnd.toISOString().split('T')[0])
          .order('plan_date', { ascending: true });

        if (error) {
          console.error('Error fetching weekly plans:', error);
          throw error;
        }
        
        return data ? data.map(transformSupabasePlan) : [];
      } catch (error) {
        console.error('Error in getWeeklyPlans:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
  });

  // Generar nuevo plan con retry y mejor manejo de errores
  const generateDailyPlan = useMutation({
    mutationFn: async ({ 
      planDate, 
      preferences 
    }: { 
      planDate: string; 
      preferences?: DailyPlannerPreferences 
    }) => {
      if (!user) throw new Error('Usuario no autenticado');

      console.log('Generando plan para:', { userId: user.id, planDate, preferences });

      const maxRetries = 3;
      let lastError;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data, error } = await supabase.functions.invoke('ai-daily-planner', {
            body: {
              userId: user.id,
              planDate,
              preferences
            }
          });

          if (error) {
            console.error(`Attempt ${attempt} - Edge function error:`, error);
            throw new Error(`Edge function error: ${error.message}`);
          }

          if (!data) {
            throw new Error('No data received from edge function');
          }

          if (!data.plan) {
            throw new Error('Invalid response structure from edge function');
          }

          console.log('Plan generated successfully:', data.plan.id);
          return data;
        } catch (error) {
          lastError = error;
          console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
          
          if (attempt < maxRetries) {
            // Esperar antes de reintentar (backoff exponencial)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }

      throw lastError;
    },
    onSuccess: (data) => {
      console.log('Plan generation successful, invalidating queries');
      
      // Invalidar queries específicas
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weekly-plans', user?.id] });
      
      // Forzar refetch del plan de hoy
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id, today] });
      
      toast({
        title: "Plan generado exitosamente",
        description: `Plan diario creado con ${data.plan.planned_tasks?.length || 0} actividades`,
      });
    },
    onError: (error) => {
      console.error('Error generando plan:', error);
      toast({
        title: "Error al generar plan",
        description: `${error.message}. Inténtalo de nuevo en unos momentos.`,
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
      try {
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

        if (error) {
          console.error('Error updating plan feedback:', error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error('Error in updatePlanFeedback:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
      toast({
        title: "Feedback guardado",
        description: "Tu valoración del plan ha sido guardada",
      });
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      toast({
        title: "Error al guardar feedback",
        description: error.message,
        variant: "destructive",
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
    
    // Estados de error
    todaysPlanError: getTodaysPlan.error,
    weeklyPlansError: getWeeklyPlans.error,
    generatePlanError: generateDailyPlan.error,
    
    // Acciones
    generatePlan: generateDailyPlan.mutate,
    updateFeedback: updatePlanFeedback.mutate,
    
    // Utilidades
    refreshPlans: () => {
      console.log('Refreshing all plans');
      queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weekly-plans', user?.id] });
    },
    
    // Función para limpiar datos de test
    clearTestData: async () => {
      if (user) {
        try {
          await supabase
            .from('ai_daily_plans')
            .delete()
            .like('id', 'test-%');
          
          queryClient.invalidateQueries({ queryKey: ['daily-plan', user?.id] });
          queryClient.invalidateQueries({ queryKey: ['weekly-plans', user?.id] });
        } catch (error) {
          console.error('Error clearing test data:', error);
        }
      }
    },
  };
};
