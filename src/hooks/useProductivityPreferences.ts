import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ProductivityPreferences {
  id: string;
  user_id: string;
  work_hours_start: number;
  work_hours_end: number;
  preferred_work_days: number[];
  energy_schedule: {
    high: number[];
    medium: number[];
    low: number[];
  };
  notification_frequency: number;
  focus_session_duration: number;
  break_duration: number;
  timezone: string;
  productivity_goals: {
    daily_tasks: number;
    weekly_tasks: number;
  };
  alert_preferences?: {
    enabled: boolean;
    deadline_days_before: number[];
    allowed_hours: 'work_hours' | 'any_time' | 'energy_based';
    min_severity: 'low' | 'medium' | 'high';
    max_daily_alerts: number;
    respect_focus_time: boolean;
    custom_messages: boolean;
    alert_types: {
      deadline_warnings: boolean;
      productivity_reminders: boolean;
      task_health_alerts: boolean;
      achievement_celebrations: boolean;
    };
    timing_strategy: 'immediate' | 'smart' | 'batch';
    energy_based_timing: boolean;
  };
  created_at: string;
  updated_at: string;
}

const DEFAULT_PREFERENCES: Omit<ProductivityPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  work_hours_start: 9,
  work_hours_end: 17,
  preferred_work_days: [1, 2, 3, 4, 5], // Monday to Friday
  energy_schedule: {
    high: [9, 10, 11],
    medium: [12, 13, 14, 15, 16],
    low: [17, 18, 19]
  },
  notification_frequency: 30,
  focus_session_duration: 25,
  break_duration: 5,
  timezone: 'UTC',
  productivity_goals: {
    daily_tasks: 3,
    weekly_tasks: 15
  }
};

export const useProductivityPreferences = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['productivity-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_productivity_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Si no hay preferencias, usar las por defecto
      if (!data) {
        return {
          ...DEFAULT_PREFERENCES,
          id: '',
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      return data as unknown as ProductivityPreferences;
    },
    enabled: !!user?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<ProductivityPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_productivity_preferences')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productivity-preferences'] });
      toast.success('Preferencias actualizadas correctamente');
    },
    onError: (error) => {
      toast.error('Error al actualizar preferencias: ' + error.message);
    }
  });

  // Helper functions
  const isWorkingHour = (hour: number) => {
    if (!preferences) return false;
    return hour >= preferences.work_hours_start && hour <= preferences.work_hours_end;
  };

  const isWorkingDay = (dayOfWeek: number) => {
    if (!preferences) return false;
    return preferences.preferred_work_days.includes(dayOfWeek);
  };

  const getEnergyLevel = (hour: number): 'high' | 'medium' | 'low' => {
    if (!preferences) return 'medium';
    
    if (preferences.energy_schedule.high.includes(hour)) return 'high';
    if (preferences.energy_schedule.low.includes(hour)) return 'low';
    return 'medium';
  };

  const getCurrentEnergyLevel = () => {
    const now = new Date();
    return getEnergyLevel(now.getHours());
  };

  const isCurrentlyWorkingTime = () => {
    const now = new Date();
    return isWorkingHour(now.getHours()) && isWorkingDay(now.getDay());
  };

  const getWorkingHoursText = () => {
    if (!preferences) return '9:00 - 17:00';
    return `${preferences.work_hours_start.toString().padStart(2, '0')}:00 - ${preferences.work_hours_end.toString().padStart(2, '0')}:00`;
  };

  const getWorkingDaysText = () => {
    if (!preferences) return 'Lunes a Viernes';
    
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const workingDays = preferences.preferred_work_days.map(day => dayNames[day]);
    
    if (workingDays.length === 5 && 
        preferences.preferred_work_days.every(day => day >= 1 && day <= 5)) {
      return 'Lunes a Viernes';
    }
    
    return workingDays.join(', ');
  };

  return {
    preferences: preferences || DEFAULT_PREFERENCES,
    isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
    // Helper functions
    isWorkingHour,
    isWorkingDay,
    getEnergyLevel,
    getCurrentEnergyLevel,
    isCurrentlyWorkingTime,
    getWorkingHoursText,
    getWorkingDaysText,
  };
};