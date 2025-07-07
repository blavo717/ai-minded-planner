import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface TeamWorkload {
  user_id: string;
  user_name: string;
  active_tasks: number;
  total_estimated_hours: number;
  overdue_tasks: number;
  completion_rate: number;
  current_load: 'low' | 'normal' | 'high' | 'overloaded';
  availability: 'available' | 'busy' | 'unavailable';
  preferred_task_types: string[];
  last_activity: string;
}

export interface TaskRedistributionSuggestion {
  id: string;
  from_user_id: string;
  to_user_id: string;
  task_id: string;
  task_title: string;
  reason: string;
  estimated_impact: {
    load_balance_improvement: number;
    completion_time_reduction: number;
    team_efficiency_gain: number;
  };
  urgency: 'low' | 'medium' | 'high';
  suggested_at: string;
}

export interface TeamCollaborationMetrics {
  total_team_members: number;
  average_completion_rate: number;
  total_active_tasks: number;
  workload_distribution: 'balanced' | 'unbalanced' | 'critical';
  collaboration_score: number;
  communication_frequency: number;
  blocked_tasks_count: number;
  overdue_rate: number;
}

export const useTeamCollaboration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener carga de trabajo del equipo
  const { data: teamWorkload, isLoading: isLoadingWorkload } = useQuery({
    queryKey: ['team-workload', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Obtener todos los miembros del equipo (usuarios que comparten proyectos)
      const { data: sharedProjects } = await supabase
        .from('tasks')
        .select(`
          user_id,
          project_id,
          projects (
            user_id,
            name
          )
        `)
        .eq('user_id', user.id);

      if (!sharedProjects?.length) return [];

      const projectIds = [...new Set(sharedProjects.map(t => t.project_id).filter(Boolean))];
      
      // Obtener usuarios que trabajen en los mismos proyectos
      const { data: teamTasks } = await supabase
        .from('tasks')
        .select(`
          user_id,
          status,
          priority,
          estimated_duration,
          due_date,
          completed_at,
          created_at
        `)
        .in('project_id', projectIds)
        .neq('user_id', user.id);

      if (!teamTasks?.length) return [];

      // Obtener perfiles de usuarios únicos
      const userIds = [...new Set(teamTasks.map(t => t.user_id))];
      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profilesMap = (userProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Agrupar por usuario y calcular métricas
      const userMetrics = teamTasks.reduce((acc, task) => {
        const userId = task.user_id;
        const profile = profilesMap[userId];
        
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            user_name: profile?.full_name || profile?.email || 'Usuario',
            tasks: [],
            active_tasks: 0,
            total_estimated_hours: 0,
            overdue_tasks: 0,
            completed_tasks: 0,
            total_tasks: 0
          };
        }

        acc[userId].tasks.push(task);
        acc[userId].total_tasks++;

        if (task.status === 'completed') {
          acc[userId].completed_tasks++;
        } else {
          acc[userId].active_tasks++;
          acc[userId].total_estimated_hours += task.estimated_duration || 60;

          if (task.due_date && new Date(task.due_date) < new Date()) {
            acc[userId].overdue_tasks++;
          }
        }

        return acc;
      }, {} as Record<string, any>);

      // Convertir a formato final
      const workload: TeamWorkload[] = Object.values(userMetrics).map((user: any) => {
        const completion_rate = user.total_tasks > 0 ? (user.completed_tasks / user.total_tasks) * 100 : 0;
        const hours_per_week = user.total_estimated_hours / 60; // Convertir a horas
        
        let current_load: TeamWorkload['current_load'] = 'normal';
        if (hours_per_week > 40) current_load = 'overloaded';
        else if (hours_per_week > 30) current_load = 'high';
        else if (hours_per_week < 10) current_load = 'low';

        let availability: TeamWorkload['availability'] = 'available';
        if (current_load === 'overloaded') availability = 'unavailable';
        else if (current_load === 'high') availability = 'busy';

        return {
          user_id: user.user_id,
          user_name: user.user_name,
          active_tasks: user.active_tasks,
          total_estimated_hours: Math.round(hours_per_week),
          overdue_tasks: user.overdue_tasks,
          completion_rate: Math.round(completion_rate),
          current_load,
          availability,
          preferred_task_types: [], // Se podría calcular basado en historial
          last_activity: new Date().toISOString()
        };
      });

      return workload;
    },
    enabled: !!user?.id,
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  // Generar sugerencias de redistribución
  const generateRedistributionMutation = useMutation({
    mutationFn: async (): Promise<TaskRedistributionSuggestion[]> => {
      if (!user?.id || !teamWorkload?.length) return [];

      const suggestions: TaskRedistributionSuggestion[] = [];
      const overloadedUsers = teamWorkload.filter(u => u.current_load === 'overloaded' || u.current_load === 'high');
      const availableUsers = teamWorkload.filter(u => u.current_load === 'low' || u.current_load === 'normal');

      // Obtener tareas de usuarios sobrecargados
      for (const overloadedUser of overloadedUsers) {
        const { data: userTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', overloadedUser.user_id)
          .neq('status', 'completed')
          .order('priority', { ascending: false })
          .limit(5);

        if (userTasks?.length) {
          for (const task of userTasks) {
            // Buscar mejor candidato para redistribuir
            const bestCandidate = availableUsers
              .filter(u => u.active_tasks < 10) // Límite arbitrario
              .sort((a, b) => a.total_estimated_hours - b.total_estimated_hours)[0];

            if (bestCandidate) {
              const loadReduction = (task.estimated_duration || 60) / 60; // Horas
              const impactScore = Math.min(loadReduction / overloadedUser.total_estimated_hours * 100, 50);

              suggestions.push({
                id: `redistrib-${task.id}-${bestCandidate.user_id}`,
                from_user_id: overloadedUser.user_id,
                to_user_id: bestCandidate.user_id,
                task_id: task.id,
                task_title: task.title,
                reason: `${overloadedUser.user_name} está sobrecargado (${overloadedUser.total_estimated_hours}h). ${bestCandidate.user_name} tiene capacidad disponible.`,
                estimated_impact: {
                  load_balance_improvement: Math.round(impactScore),
                  completion_time_reduction: Math.round(loadReduction * 0.8), // Estimación
                  team_efficiency_gain: Math.round(impactScore * 0.6)
                },
                urgency: overloadedUser.overdue_tasks > 2 ? 'high' : 
                        overloadedUser.current_load === 'overloaded' ? 'medium' : 'low',
                suggested_at: new Date().toISOString()
              });
            }
          }
        }
      }

      return suggestions.slice(0, 10); // Limitar a 10 sugerencias
    },
    onSuccess: (suggestions) => {
      if (suggestions.length > 0) {
        toast.success(`${suggestions.length} sugerencias de redistribución generadas`);
      } else {
        toast.info('No se encontraron oportunidades de redistribución');
      }
    },
    onError: (error) => {
      console.error('Error generating redistribution suggestions:', error);
      toast.error('Error al generar sugerencias de redistribución');
    }
  });

  // Calcular métricas de colaboración del equipo
  const getTeamMetrics = (): TeamCollaborationMetrics | null => {
    if (!teamWorkload?.length) return null;

    const totalMembers = teamWorkload.length;
    const avgCompletionRate = teamWorkload.reduce((sum, u) => sum + u.completion_rate, 0) / totalMembers;
    const totalActiveTasks = teamWorkload.reduce((sum, u) => sum + u.active_tasks, 0);
    const totalOverdue = teamWorkload.reduce((sum, u) => sum + u.overdue_tasks, 0);
    
    // Calcular distribución de carga
    const workloads = teamWorkload.map(u => u.total_estimated_hours);
    const maxLoad = Math.max(...workloads);
    const minLoad = Math.min(...workloads);
    const loadVariance = maxLoad - minLoad;
    
    let workload_distribution: TeamCollaborationMetrics['workload_distribution'] = 'balanced';
    if (loadVariance > 20) workload_distribution = 'critical';
    else if (loadVariance > 10) workload_distribution = 'unbalanced';

    // Score de colaboración (0-100)
    const balanceScore = Math.max(0, 100 - (loadVariance * 2));
    const completionScore = avgCompletionRate;
    const overdueScore = Math.max(0, 100 - (totalOverdue * 10));
    const collaboration_score = Math.round((balanceScore + completionScore + overdueScore) / 3);

    return {
      total_team_members: totalMembers,
      average_completion_rate: Math.round(avgCompletionRate),
      total_active_tasks: totalActiveTasks,
      workload_distribution,
      collaboration_score,
      communication_frequency: 0, // Placeholder - se podría calcular de logs
      blocked_tasks_count: 0, // Placeholder
      overdue_rate: totalActiveTasks > 0 ? Math.round((totalOverdue / totalActiveTasks) * 100) : 0
    };
  };

  return {
    teamWorkload: teamWorkload || [],
    isLoadingWorkload,
    generateRedistributionSuggestions: generateRedistributionMutation.mutate,
    isGeneratingSuggestions: generateRedistributionMutation.isPending,
    teamMetrics: getTeamMetrics(),
    hasTeamMembers: (teamWorkload?.length || 0) > 0
  };
};