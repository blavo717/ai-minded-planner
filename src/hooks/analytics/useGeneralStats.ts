
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface GeneralStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  totalSessions: number;
  totalWorkHours: number;
  hasAnyData: boolean;
}

export const useGeneralStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['general-stats', user?.id],
    queryFn: async (): Promise<GeneralStats> => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching general stats for user:', user.id);

      // Obtener todos los proyectos
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      // Obtener todas las tareas
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Obtener todas las sesiones
      const { data: sessions, error: sessionsError } = await supabase
        .from('task_sessions')
        .select('*');

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      }

      console.log('Fetched data:', {
        projects: projects?.length || 0,
        tasks: tasks?.length || 0,
        sessions: sessions?.length || 0
      });

      const projectsData = projects || [];
      const tasksData = tasks || [];
      const sessionsData = sessions || [];

      // Calcular estadísticas de proyectos
      const totalProjects = projectsData.length;
      const activeProjects = projectsData.filter(p => !p.status || p.status === 'active').length;
      const completedProjects = projectsData.filter(p => p.status === 'completed').length;

      // Calcular estadísticas de tareas
      const totalTasks = tasksData.length;
      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const pendingTasks = tasksData.filter(t => t.status === 'pending').length;
      const inProgressTasks = tasksData.filter(t => t.status === 'in_progress').length;

      // Calcular estadísticas de sesiones
      const totalSessions = sessionsData.length;
      const totalWorkHours = sessionsData.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

      const hasAnyData = totalProjects > 0 || totalTasks > 0 || totalSessions > 0;

      return {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        totalSessions,
        totalWorkHours: Math.round(totalWorkHours * 10) / 10,
        hasAnyData,
      };
    },
    enabled: !!user,
  });
};
