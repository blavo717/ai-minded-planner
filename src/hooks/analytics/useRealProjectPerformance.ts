
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProjectPerformanceData {
  id: string;
  name: string;
  status: string;
  progress: number;
  tasksTotal: number;
  tasksCompleted: number;
  totalHours: number;
  budget: number;
  budgetUsed: number;
  efficiency: number;
  completionRate: number;
}

export const useRealProjectPerformance = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['real-project-performance', user?.id],
    queryFn: async (): Promise<ProjectPerformanceData[]> => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching real project performance data');

      // Obtener todos los proyectos
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*');

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        throw projectsError;
      }

      // Obtener todas las tareas
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        throw tasksError;
      }

      // Obtener todas las sesiones
      const { data: sessions, error: sessionsError } = await supabase
        .from('task_sessions')
        .select('*');

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
        throw sessionsError;
      }

      console.log('Raw data fetched:', {
        projects: projects?.length || 0,
        tasks: tasks?.length || 0,
        sessions: sessions?.length || 0
      });

      const projectsData = projects || [];
      const tasksData = tasks || [];
      const sessionsData = sessions || [];

      // Procesar datos por proyecto
      const performanceData = projectsData.map(project => {
        // Tareas del proyecto
        const projectTasks = tasksData.filter(task => task.project_id === project.id);
        const completedTasks = projectTasks.filter(task => task.status === 'completed');
        
        // Sesiones relacionadas con tareas del proyecto
        const projectTaskIds = projectTasks.map(t => t.id);
        const projectSessions = sessionsData.filter(session => 
          projectTaskIds.includes(session.task_id)
        );
        
        const totalHours = projectSessions.reduce((sum, session) => 
          sum + (session.duration_minutes || 0), 0
        ) / 60;

        const tasksTotal = projectTasks.length;
        const tasksCompleted = completedTasks.length;
        const completionRate = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;
        
        // Calcular eficiencia basada en tiempo estimado vs real
        const estimatedHours = project.estimated_hours || 0;
        const efficiency = estimatedHours > 0 && totalHours > 0 
          ? Math.min((estimatedHours / totalHours) * 100, 200)
          : 0;

        return {
          id: project.id,
          name: project.name,
          status: project.status || 'active',
          progress: project.progress || 0,
          tasksTotal,
          tasksCompleted,
          totalHours: Math.round(totalHours * 10) / 10,
          budget: project.budget || 0,
          budgetUsed: project.budget_used || 0,
          efficiency: Math.round(efficiency * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10,
        };
      });

      console.log('Processed performance data:', performanceData);
      return performanceData;
    },
    enabled: !!user,
  });
};
