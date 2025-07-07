import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  max_progress: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'completion' | 'efficiency' | 'consistency';
  maxProgress: number;
  category: string;
}

// Definiciones de logros disponibles
const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first_task',
    title: 'Primer Paso',
    description: 'Completa tu primera tarea',
    icon: '🎯',
    type: 'completion',
    maxProgress: 1,
    category: 'Inicio'
  },
  {
    id: 'task_master',
    title: 'Maestro de Tareas',
    description: 'Completa 10 tareas',
    icon: '🏆',
    type: 'completion',
    maxProgress: 10,
    category: 'Productividad'
  },
  {
    id: 'streak_warrior',
    title: 'Guerrero de la Consistencia',
    description: 'Mantén una racha de 7 días',
    icon: '🔥',
    type: 'streak',
    maxProgress: 7,
    category: 'Consistencia'
  },
  {
    id: 'efficiency_expert',
    title: 'Experto en Eficiencia',
    description: 'Logra 80% de tasa de completación',
    icon: '⚡',
    type: 'efficiency',
    maxProgress: 80,
    category: 'Eficiencia'
  },
  {
    id: 'priority_master',
    title: 'Maestro de Prioridades',
    description: 'Completa 5 tareas de alta prioridad',
    icon: '🌟',
    type: 'completion',
    maxProgress: 5,
    category: 'Prioridades'
  },
  {
    id: 'early_bird',
    title: 'Madrugador',
    description: 'Trabaja antes de las 9 AM',
    icon: '🌅',
    type: 'consistency',
    maxProgress: 1,
    category: 'Horarios'
  },
  {
    id: 'speed_demon',
    title: 'Velocista',
    description: 'Completa 5 tareas en menos de 15 minutos',
    icon: '💨',
    type: 'efficiency',
    maxProgress: 5,
    category: 'Velocidad'
  },
  {
    id: 'marathon_runner',
    title: 'Corredor de Maratón',
    description: 'Completa 50 tareas en total',
    icon: '🏃‍♂️',
    type: 'completion',
    maxProgress: 50,
    category: 'Resistencia'
  }
];

export const useUserAchievements = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user?.id,
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: async ({ achievementId, progress = 1, metadata = {} }: {
      achievementId: string;
      progress?: number;
      metadata?: Record<string, any>;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
      if (!achievement) throw new Error('Achievement not found');

      const { data, error } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          progress,
          max_progress: achievement.maxProgress,
          metadata
        }, {
          onConflict: 'user_id,achievement_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      
      const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === data.achievement_id);
      if (achievement && data.progress >= data.max_progress) {
        toast.success(`🎉 ¡Logro desbloqueado!`, {
          description: `${achievement.icon} ${achievement.title}: ${achievement.description}`,
          duration: 5000,
        });
      }
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ achievementId, progress }: {
      achievementId: string;
      progress: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .update({ progress })
        .eq('user_id', user.id)
        .eq('achievement_id', achievementId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
    },
  });

  // Función helper para verificar si un logro está desbloqueado
  const isUnlocked = (achievementId: string) => {
    const achievement = achievements?.find(a => a.achievement_id === achievementId);
    if (!achievement) return false;
    return achievement.progress >= achievement.max_progress;
  };

  // Función helper para obtener el progreso de un logro
  const getProgress = (achievementId: string) => {
    const achievement = achievements?.find(a => a.achievement_id === achievementId);
    return achievement ? achievement.progress : 0;
  };

  // Función para obtener logros combinados con definiciones
  const getAchievementsWithDefinitions = () => {
    return ACHIEVEMENT_DEFINITIONS.map(def => {
      const userAchievement = achievements?.find(a => a.achievement_id === def.id);
      return {
        ...def,
        isUnlocked: userAchievement ? userAchievement.progress >= userAchievement.max_progress : false,
        progress: userAchievement?.progress || 0,
        unlockedAt: userAchievement?.unlocked_at ? new Date(userAchievement.unlocked_at) : undefined
      };
    });
  };

  return {
    achievements,
    achievementDefinitions: ACHIEVEMENT_DEFINITIONS,
    isLoading,
    unlockAchievement: unlockAchievementMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isUnlocked,
    getProgress,
    getAchievementsWithDefinitions,
  };
};