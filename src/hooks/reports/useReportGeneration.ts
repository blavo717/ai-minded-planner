
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { GeneratedReport } from '@/hooks/useGeneratedReports';

export const useReportGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateReportMutation = useMutation({
    mutationFn: async (type: 'weekly' | 'monthly') => {
      if (!user) throw new Error('User not authenticated');

      console.log(`🔄 Generando reporte ${type} para usuario:`, user.id);

      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (type === 'weekly') {
        startDate = startOfWeek(subWeeks(now, 1));
        endDate = endOfWeek(subWeeks(now, 1));
      } else {
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
      }

      console.log(`📅 Período: ${startDate.toISOString()} a ${endDate.toISOString()}`);

      // Obtener datos para el reporte
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) {
        console.error('❌ Error obteniendo tareas:', tasksError);
        throw tasksError;
      }

      console.log(`📋 Total tareas encontradas: ${tasks?.length || 0}`);

      const { data: sessions, error: sessionsError } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (sessionsError) {
        console.error('❌ Error obteniendo sesiones:', sessionsError);
        throw sessionsError;
      }

      console.log(`⏱️ Total sesiones encontradas: ${sessions?.length || 0}`);

      const completedTasks = (tasks || []).filter(task => 
        task.status === 'completed' && 
        task.completed_at &&
        new Date(task.completed_at) >= startDate &&
        new Date(task.completed_at) <= endDate
      );

      console.log(`✅ Tareas completadas en período: ${completedTasks.length}`);

      const totalWorkTime = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const avgProductivity = sessions && sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessions.length
        : 0;

      const tasksWithEstimate = completedTasks.filter(t => t.estimated_duration && t.actual_duration);
      const efficiency = tasksWithEstimate.length > 0 
        ? tasksWithEstimate.reduce((sum, t) => sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0) / tasksWithEstimate.length * 100
        : 100;

      const projectsInPeriod = [...new Set(completedTasks.map(t => t.project_id).filter(Boolean))];

      const reportData = {
        report_type: type,
        tasks: completedTasks,
        sessions: sessions || [],
        projects: projectsInPeriod,
        period: { 
          start: startDate.toISOString(), 
          end: endDate.toISOString() 
        },
        summary: {
          tasksCompleted: completedTasks.length,
          totalWorkTime,
          avgProductivity,
          efficiency,
          projectsWorked: projectsInPeriod.length
        },
        insights: [
          `Completaste ${completedTasks.length} tareas en este período`,
          `Tu productividad promedio fue de ${avgProductivity.toFixed(1)}/5`,
          `Trabajaste un total de ${Math.round(totalWorkTime / 60)} horas`,
          `Trabajaste en ${projectsInPeriod.length} proyectos diferentes`
        ],
        recommendations: [
          completedTasks.length > 10 ? 'Excelente ritmo de trabajo' : 'Considera incrementar el número de tareas completadas',
          avgProductivity > 3 ? 'Mantén este nivel de productividad' : 'Busca optimizar tu productividad',
          efficiency > 90 ? 'Tu estimación de tiempos es muy precisa' : 'Mejora la estimación de duración de tareas'
        ]
      };

      const metrics = {
        tasksCompleted: completedTasks.length,
        productivity: avgProductivity,
        timeWorked: totalWorkTime,
        efficiency
      };

      console.log('📊 Métricas calculadas:', metrics);
      console.log('📄 Datos del reporte preparados:', {
        tasksCount: reportData.tasks.length,
        sessionsCount: reportData.sessions.length,
        projectsCount: reportData.projects.length
      });

      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          user_id: user.id,
          report_type: type,
          period_start: startDate.toISOString().split('T')[0],
          period_end: endDate.toISOString().split('T')[0],
          report_data: reportData,
          metrics
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando reporte:', error);
        throw error;
      }

      console.log('✅ Reporte guardado exitosamente:', data.id);
      
      return {
        ...data,
        report_type: data.report_type as 'weekly' | 'monthly'
      } as GeneratedReport;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
      toast({
        title: "Reporte generado exitosamente",
        description: `Reporte ${report.report_type} guardado en el historial`,
      });
    },
    onError: (error) => {
      console.error('Error generating report:', error);
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  return {
    generateReport: generateReportMutation.mutate,
    isGenerating: generateReportMutation.isPending,
  };
};
