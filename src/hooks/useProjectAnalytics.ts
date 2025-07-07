import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ProjectAnalytics {
  project_id: string;
  project_name: string;
  status: string;
  // Métricas básicas
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  // Progreso y tiempo
  completion_percentage: number;
  estimated_total_hours: number;
  actual_hours_spent: number;
  remaining_hours: number;
  // Fechas y predicciones
  start_date: string | null;
  original_deadline: string | null;
  predicted_completion_date: string | null;
  days_behind_schedule: number;
  // Riesgos y salud
  health_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  identified_risks: ProjectRisk[];
  // Rendimiento del equipo
  team_velocity: number;
  avg_task_completion_time: number;
  team_members_count: number;
  collaboration_score: number;
}

export interface ProjectRisk {
  id: string;
  type: 'timeline' | 'resources' | 'scope' | 'quality' | 'dependencies';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  likelihood: number; // 0-100
  mitigation_suggestion: string;
  detected_at: string;
}

export interface ProjectForecast {
  project_id: string;
  completion_probability: number;
  estimated_completion_date: string;
  confidence_interval: {
    optimistic: string;
    realistic: string;
    pessimistic: string;
  };
  factors_affecting_timeline: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  recommendations: string[];
}

export const useProjectAnalytics = (projectId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Análisis detallado de proyectos
  const { data: projectAnalytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['project-analytics', user?.id, projectId],
    queryFn: async (): Promise<ProjectAnalytics[]> => {
      if (!user?.id) return [];

      // Query base para proyectos
      let projectQuery = supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          start_date,
          deadline,
          estimated_hours,
          actual_hours,
          created_at,
          tasks (
            id,
            status,
            priority,
            estimated_duration,
            actual_duration,
            due_date,
            completed_at,
            created_at,
            user_id
          )
        `)
        .eq('user_id', user.id);

      if (projectId) {
        projectQuery = projectQuery.eq('id', projectId);
      }

      const { data: projects, error } = await projectQuery;
      if (error) throw error;

      return (projects || []).map(project => {
        const tasks = project.tasks || [];
        const now = new Date();

        // Métricas básicas
        const total_tasks = tasks.length;
        const completed_tasks = tasks.filter(t => t.status === 'completed').length;
        const pending_tasks = tasks.filter(t => t.status !== 'completed').length;
        const overdue_tasks = tasks.filter(t => 
          t.status !== 'completed' && 
          t.due_date && 
          new Date(t.due_date) < now
        ).length;

        // Progreso y tiempo
        const completion_percentage = total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;
        const estimated_total_hours = tasks.reduce((sum, t) => sum + (t.estimated_duration || 60), 0) / 60;
        const actual_hours_spent = tasks.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / 60;
        const remaining_hours = Math.max(0, estimated_total_hours - actual_hours_spent);

        // Predicción de finalización
        const completedTasksWithDuration = tasks.filter(t => t.status === 'completed' && t.actual_duration);
        const avg_task_completion_time = completedTasksWithDuration.length > 0 
          ? completedTasksWithDuration.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedTasksWithDuration.length / 60
          : estimated_total_hours / Math.max(total_tasks, 1);

        const team_velocity = completed_tasks / Math.max(1, Math.ceil((now.getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24 * 7))); // tareas por semana
        const weeks_to_complete = pending_tasks / Math.max(team_velocity, 0.1);
        const predicted_completion_date = new Date(now.getTime() + weeks_to_complete * 7 * 24 * 60 * 60 * 1000).toISOString();

        // Días de retraso
        const days_behind_schedule = project.deadline 
          ? Math.max(0, Math.ceil((new Date(predicted_completion_date).getTime() - new Date(project.deadline).getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        // Identificar riesgos
        const identified_risks: ProjectRisk[] = [];

        // Riesgo de cronograma
        if (days_behind_schedule > 7) {
          identified_risks.push({
            id: `timeline-${project.id}`,
            type: 'timeline',
            severity: days_behind_schedule > 30 ? 'critical' : days_behind_schedule > 14 ? 'high' : 'medium',
            title: 'Retraso en cronograma',
            description: `El proyecto va ${days_behind_schedule} días de retraso`,
            impact: 'Entrega tardía del proyecto',
            likelihood: 85,
            mitigation_suggestion: 'Redistribuir tareas, añadir recursos o reducir alcance',
            detected_at: now.toISOString()
          });
        }

        // Riesgo de sobrecarga
        if (overdue_tasks > total_tasks * 0.3) {
          identified_risks.push({
            id: `overdue-${project.id}`,
            type: 'resources',
            severity: 'high',
            title: 'Alto número de tareas vencidas',
            description: `${overdue_tasks} de ${total_tasks} tareas están vencidas`,
            impact: 'Degradación de calidad y moral del equipo',
            likelihood: 75,
            mitigation_suggestion: 'Revisar prioridades y capacidad del equipo',
            detected_at: now.toISOString()
          });
        }

        // Riesgo de velocidad baja
        if (team_velocity < 1 && total_tasks > 5) {
          identified_risks.push({
            id: `velocity-${project.id}`,
            type: 'resources',
            severity: 'medium',
            title: 'Velocidad del equipo baja',
            description: 'El equipo completa menos de 1 tarea por semana',
            impact: 'Retraso significativo en entrega',
            likelihood: 60,
            mitigation_suggestion: 'Investigar bloqueos y optimizar procesos',
            detected_at: now.toISOString()
          });
        }

        // Health score (0-100)
        const timelineScore = Math.max(0, 100 - (days_behind_schedule * 2));
        const overdueScore = Math.max(0, 100 - (overdue_tasks * 10));
        const velocityScore = Math.min(100, team_velocity * 20);
        const completionScore = completion_percentage;
        const health_score = Math.round((timelineScore + overdueScore + velocityScore + completionScore) / 4);

        // Nivel de riesgo general
        let risk_level: ProjectAnalytics['risk_level'] = 'low';
        if (health_score < 30) risk_level = 'critical';
        else if (health_score < 50) risk_level = 'high';
        else if (health_score < 70) risk_level = 'medium';

        // Miembros del equipo únicos
        const team_members_count = new Set(tasks.map(t => t.user_id)).size;

        return {
          project_id: project.id,
          project_name: project.name,
          status: project.status || 'active',
          total_tasks,
          completed_tasks,
          pending_tasks,
          overdue_tasks,
          completion_percentage,
          estimated_total_hours: Math.round(estimated_total_hours),
          actual_hours_spent: Math.round(actual_hours_spent),
          remaining_hours: Math.round(remaining_hours),
          start_date: project.start_date,
          original_deadline: project.deadline,
          predicted_completion_date,
          days_behind_schedule,
          health_score,
          risk_level,
          identified_risks,
          team_velocity: Math.round(team_velocity * 10) / 10,
          avg_task_completion_time: Math.round(avg_task_completion_time * 10) / 10,
          team_members_count,
          collaboration_score: Math.min(100, team_members_count * 20) // Placeholder
        };
      });
    },
    enabled: !!user?.id,
    refetchInterval: 600000, // Refetch every 10 minutes
  });

  // Generar pronóstico detallado del proyecto
  const generateForecastMutation = useMutation({
    mutationFn: async (targetProjectId: string): Promise<ProjectForecast | null> => {
      const project = projectAnalytics?.find(p => p.project_id === targetProjectId);
      if (!project) return null;

      // Calcular probabilidad de completación
      const healthFactor = project.health_score / 100;
      const velocityFactor = Math.min(1, project.team_velocity / 2);
      const riskFactor = project.identified_risks.length === 0 ? 1 : 
                        Math.max(0.2, 1 - (project.identified_risks.length * 0.2));
      
      const completion_probability = Math.round((healthFactor + velocityFactor + riskFactor) / 3 * 100);

      // Intervalos de confianza
      const baseDate = new Date(project.predicted_completion_date);
      const optimisticDays = -Math.round(project.days_behind_schedule * 0.3);
      const pessimisticDays = Math.round(project.days_behind_schedule * 1.5 + 14);

      const confidence_interval = {
        optimistic: new Date(baseDate.getTime() + optimisticDays * 24 * 60 * 60 * 1000).toISOString(),
        realistic: project.predicted_completion_date,
        pessimistic: new Date(baseDate.getTime() + pessimisticDays * 24 * 60 * 60 * 1000).toISOString()
      };

      // Factores que afectan el timeline
      const getImpact = (condition: boolean, positiveCondition: boolean) => {
        if (positiveCondition) return 'positive' as const;
        if (condition) return 'negative' as const;
        return 'neutral' as const;
      };

      const factors_affecting_timeline = [
        {
          factor: 'Velocidad del equipo',
          impact: getImpact(project.team_velocity < 0.5, project.team_velocity > 1.5),
          description: `El equipo completa ${project.team_velocity} tareas por semana`
        },
        {
          factor: 'Tareas vencidas',
          impact: getImpact(project.overdue_tasks > 3, project.overdue_tasks === 0),
          description: `${project.overdue_tasks} tareas están vencidas`
        },
        {
          factor: 'Riesgos identificados',
          impact: getImpact(project.identified_risks.length > 0, project.identified_risks.length === 0),
          description: `${project.identified_risks.length} riesgos activos detectados`
        }
      ];

      // Recomendaciones
      const recommendations = [];
      if (project.team_velocity < 1) {
        recommendations.push('Incrementar la velocidad del equipo eliminando bloqueos');
      }
      if (project.overdue_tasks > 2) {
        recommendations.push('Priorizar la finalización de tareas vencidas');
      }
      if (project.days_behind_schedule > 7) {
        recommendations.push('Considerar ajustar el alcance o añadir recursos');
      }
      if (project.identified_risks.length > 0) {
        recommendations.push('Implementar planes de mitigación para los riesgos identificados');
      }

      return {
        project_id: targetProjectId,
        completion_probability,
        estimated_completion_date: project.predicted_completion_date,
        confidence_interval,
        factors_affecting_timeline,
        recommendations: recommendations.length > 0 ? recommendations : ['El proyecto está en buen estado, continuar con el plan actual']
      };
    },
    onSuccess: (forecast) => {
      if (forecast) {
        toast.success(`Pronóstico generado: ${forecast.completion_probability}% probabilidad de completación a tiempo`);
      }
    },
    onError: (error) => {
      console.error('Error generating forecast:', error);
      toast.error('Error al generar pronóstico del proyecto');
    }
  });

  return {
    projectAnalytics: projectAnalytics || [],
    isLoadingAnalytics,
    generateForecast: generateForecastMutation.mutate,
    forecastData: generateForecastMutation.data,
    isGeneratingForecast: generateForecastMutation.isPending,
    // Helper functions
    getProjectById: (id: string) => projectAnalytics?.find(p => p.project_id === id),
    getCriticalProjects: () => projectAnalytics?.filter(p => p.risk_level === 'critical') || [],
    getHighRiskProjects: () => projectAnalytics?.filter(p => p.risk_level === 'high' || p.risk_level === 'critical') || []
  };
};