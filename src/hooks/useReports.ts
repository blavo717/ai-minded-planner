
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface Report {
  id: string;
  type: 'weekly' | 'monthly' | 'project';
  period: { start: Date; end: Date };
  metrics: {
    tasksCompleted: number;
    productivity: number;
    timeWorked: number;
    efficiency: number;
  };
  insights: string[];
  recommendations: string[];
  charts: any[];
  created_at: string;
}

export const useReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getReportHistory = () => {
    return useQuery({
      queryKey: ['report-history', user?.id],
      queryFn: async (): Promise<Report[]> => {
        if (!user) return [];

        // Por ahora simulamos datos de reportes
        // En el futuro, esto vendría de una tabla de reportes en la base de datos
        const mockReports: Report[] = [
          {
            id: '1',
            type: 'weekly',
            period: {
              start: startOfWeek(subWeeks(new Date(), 1)),
              end: endOfWeek(subWeeks(new Date(), 1))
            },
            metrics: {
              tasksCompleted: 12,
              productivity: 4.2,
              timeWorked: 1800, // minutes
              efficiency: 85
            },
            insights: [
              'Tu productividad aumentó un 15% respecto a la semana anterior',
              'Martes fue tu día más productivo con 6 tareas completadas'
            ],
            recommendations: [
              'Mantén tu rutina de trabajo matutina',
              'Considera tomar descansos más frecuentes en las tardes'
            ],
            charts: [],
            created_at: subWeeks(new Date(), 1).toISOString()
          },
          {
            id: '2',
            type: 'monthly',
            period: {
              start: startOfMonth(subMonths(new Date(), 1)),
              end: endOfMonth(subMonths(new Date(), 1))
            },
            metrics: {
              tasksCompleted: 48,
              productivity: 3.8,
              timeWorked: 7200, // minutes
              efficiency: 78
            },
            insights: [
              'Completaste 48 tareas este mes, un 20% más que el mes anterior',
              'Tu tiempo promedio por tarea mejoró en 25 minutos'
            ],
            recommendations: [
              'Enfócate en mejorar la estimación de tiempo para tareas complejas',
              'Considera implementar la técnica Pomodoro para sesiones largas'
            ],
            charts: [],
            created_at: subMonths(new Date(), 1).toISOString()
          }
        ];

        return mockReports;
      },
      enabled: !!user,
    });
  };

  const generateWeeklyReportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const startDate = startOfWeek(subWeeks(now, 1));
      const endDate = endOfWeek(subWeeks(now, 1));

      // Obtener datos de la semana pasada
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (!tasks || !sessions) {
        throw new Error('Failed to fetch data for report');
      }

      // Calcular métricas
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalWorkTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const avgProductivity = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessions.length
        : 0;

      // Calcular eficiencia
      const tasksWithEstimate = tasks.filter(t => t.estimated_duration && t.actual_duration);
      const efficiency = tasksWithEstimate.length > 0 
        ? tasksWithEstimate.reduce((sum, t) => sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0) / tasksWithEstimate.length * 100
        : 100;

      const report: Report = {
        id: `weekly-${Date.now()}`,
        type: 'weekly',
        period: { start: startDate, end: endDate },
        metrics: {
          tasksCompleted: completedTasks,
          productivity: avgProductivity,
          timeWorked: totalWorkTime,
          efficiency
        },
        insights: [
          `Completaste ${completedTasks} tareas esta semana`,
          `Tu productividad promedio fue de ${avgProductivity.toFixed(1)}/5`,
          `Trabajaste un total de ${Math.round(totalWorkTime / 60)} horas`
        ],
        recommendations: [
          completedTasks < 10 ? 'Considera establecer metas más pequeñas y alcanzables' : 'Excelente ritmo de trabajo, mantén la consistencia',
          avgProductivity < 3 ? 'Identifica las distracciones principales y elimínalas' : 'Buen nivel de concentración',
          efficiency < 80 ? 'Mejora tus estimaciones de tiempo para tareas similares' : 'Excelente gestión del tiempo'
        ],
        charts: [],
        created_at: new Date().toISOString()
      };

      return report;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['report-history'] });
      toast({
        title: "Reporte semanal generado",
        description: `Reporte del ${report.period.start.toLocaleDateString()} al ${report.period.end.toLocaleDateString()}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte semanal. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  const generateMonthlyReportMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const now = new Date();
      const startDate = startOfMonth(subMonths(now, 1));
      const endDate = endOfMonth(subMonths(now, 1));

      // Obtener datos del mes pasado
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (!tasks || !sessions) {
        throw new Error('Failed to fetch data for report');
      }

      // Calcular métricas más detalladas para reporte mensual
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalWorkTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const avgProductivity = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessions.length
        : 0;

      const tasksWithEstimate = tasks.filter(t => t.estimated_duration && t.actual_duration);
      const efficiency = tasksWithEstimate.length > 0 
        ? tasksWithEstimate.reduce((sum, t) => sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0) / tasksWithEstimate.length * 100
        : 100;

      // Análisis por proyecto
      const projectAnalysis = projects?.map(project => {
        const projectTasks = tasks.filter(t => t.project_id === project.id);
        const projectSessions = sessions.filter(s => {
          const task = tasks.find(t => t.id === s.task_id);
          return task?.project_id === project.id;
        });

        return {
          name: project.name,
          tasksCompleted: projectTasks.filter(t => t.status === 'completed').length,
          totalTasks: projectTasks.length,
          timeSpent: projectSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
        };
      }) || [];

      const mostActiveProject = projectAnalysis.reduce((max, current) => 
        current.tasksCompleted > max.tasksCompleted ? current : max, 
        projectAnalysis[0] || { name: 'N/A', tasksCompleted: 0, totalTasks: 0, timeSpent: 0 }
      );

      const report: Report = {
        id: `monthly-${Date.now()}`,
        type: 'monthly',
        period: { start: startDate, end: endDate },
        metrics: {
          tasksCompleted: completedTasks,
          productivity: avgProductivity,
          timeWorked: totalWorkTime,
          efficiency
        },
        insights: [
          `Completaste ${completedTasks} tareas este mes`,
          `Tu productividad promedio fue de ${avgProductivity.toFixed(1)}/5`,
          `Trabajaste un total de ${Math.round(totalWorkTime / 60)} horas`,
          `Tu proyecto más activo fue "${mostActiveProject.name}" con ${mostActiveProject.tasksCompleted} tareas completadas`
        ],
        recommendations: [
          completedTasks >= 40 ? 'Excelente productividad mensual' : 'Considera aumentar tu ritmo de trabajo gradualmente',
          avgProductivity >= 4 ? 'Mantienes un alto nivel de concentración' : 'Enfócate en eliminar distracciones durante las sesiones de trabajo',
          efficiency >= 85 ? 'Excelente gestión del tiempo' : 'Mejora tus estimaciones de tiempo para ser más preciso',
          totalWorkTime >= 4800 ? 'Buen balance de tiempo dedicado' : 'Considera aumentar las horas de trabajo enfocado'
        ],
        charts: [],
        created_at: new Date().toISOString()
      };

      return report;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['report-history'] });
      toast({
        title: "Reporte mensual generado",
        description: `Reporte del ${report.period.start.toLocaleDateString()} al ${report.period.end.toLocaleDateString()}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte mensual. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  return {
    getReportHistory,
    generateWeeklyReport: generateWeeklyReportMutation.mutate,
    generateMonthlyReport: generateMonthlyReportMutation.mutate,
    isGenerating: generateWeeklyReportMutation.isPending || generateMonthlyReportMutation.isPending,
  };
};
