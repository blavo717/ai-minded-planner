
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
    mutationFn: async ({ type }: { type: 'weekly' | 'monthly' }) => {
      if (!user) throw new Error('User not authenticated');

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

      // Obtener datos para el reporte
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      const completedTasks = (tasks || []).filter(task => 
        task.status === 'completed' && 
        task.completed_at &&
        new Date(task.completed_at) >= startDate &&
        new Date(task.completed_at) <= endDate
      );

      const totalWorkTime = (sessions || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      const avgProductivity = sessions && sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessions.length
        : 0;

      const tasksWithEstimate = completedTasks.filter(t => t.estimated_duration && t.actual_duration);
      const efficiency = tasksWithEstimate.length > 0 
        ? tasksWithEstimate.reduce((sum, t) => sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0) / tasksWithEstimate.length * 100
        : 100;

      const reportData = {
        tasks: completedTasks,
        sessions: sessions || [],
        period: { 
          start: startDate.toISOString(), 
          end: endDate.toISOString() 
        },
        insights: [
          `Completaste ${completedTasks.length} tareas en este período`,
          `Tu productividad promedio fue de ${avgProductivity.toFixed(1)}/5`,
          `Trabajaste un total de ${Math.round(totalWorkTime / 60)} horas`
        ]
      };

      const metrics = {
        tasksCompleted: completedTasks.length,
        productivity: avgProductivity,
        timeWorked: totalWorkTime,
        efficiency
      };

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

      if (error) throw error;
      
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
