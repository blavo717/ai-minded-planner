import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { GeneratedReport } from '@/hooks/useGeneratedReports';
import { ComprehensiveReportDataService } from '@/services/comprehensiveReportDataService';

export const useReportGeneration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateReportMutation = useMutation({
    mutationFn: async (type: 'weekly' | 'monthly') => {
      if (!user) throw new Error('User not authenticated');

      console.log(`🔄 Generando reporte comprehensivo ${type} para usuario:`, user.id);

      // Use comprehensive service to get real data
      const reportService = new ComprehensiveReportDataService(user.id);
      const comprehensiveData = await reportService.generateComprehensiveReport(type);

      console.log('📊 Datos comprehensivos obtenidos:', {
        proyectosActivos: comprehensiveData.currentState.activeProjects,
        tareasTotales: comprehensiveData.currentState.totalTasks,
        tareasCompletadasPeriodo: comprehensiveData.periodData.tasksCompleted,
        tiempoTrabajado: comprehensiveData.periodData.timeWorked,
        proyectosAnalizados: comprehensiveData.projects.length
      });

      // Transform comprehensive data to JSON-compatible report format
      const reportData = {
        report_type: type,
        
        // Current state for context
        currentState: comprehensiveData.currentState,
        
        // Real projects with serializable data
        projects: comprehensiveData.projects.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          progress: project.progress,
          totalTasks: project.totalTasks,
          completedTasks: project.completedTasks,
          completionRate: project.completionRate,
          timeSpent: project.timeSpent,
          efficiency: project.efficiency,
          mainTasksCount: project.mainTasks.length,
          allTasksCount: project.allTasks.length
        })),
        
        // Tasks data simplified for JSON
        tasksData: {
          totalInPeriod: comprehensiveData.taskHierarchy.length,
          mainTasks: comprehensiveData.taskHierarchy.filter(t => t.level === 1).length,
          subtasks: comprehensiveData.taskHierarchy.filter(t => t.level === 2).length,
          microtasks: comprehensiveData.taskHierarchy.filter(t => t.level === 3).length
        },
        
        // Sessions summary
        sessionsData: {
          total: comprehensiveData.sessions.length,
          withTasks: comprehensiveData.sessions.filter(s => s.task_id).length,
          totalDuration: comprehensiveData.sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
        },
        
        // Period info
        period: comprehensiveData.period,
        
        // Summary metrics
        summary: {
          tasksCompleted: comprehensiveData.periodData.tasksCompleted,
          tasksCreated: comprehensiveData.periodData.tasksCreated,
          totalWorkTime: comprehensiveData.periodData.timeWorked,
          avgProductivity: comprehensiveData.periodData.avgProductivity,
          efficiency: comprehensiveData.insights.efficiency,
          projectsWorked: comprehensiveData.periodData.projectsWorkedOn,
          completionRate: comprehensiveData.insights.completionRate
        },
        
        // Enhanced insights
        insights: [
          `Completaste ${comprehensiveData.periodData.tasksCompleted} tareas en este período`,
          `Estado actual: ${comprehensiveData.currentState.activeProjects} proyectos activos con ${comprehensiveData.currentState.totalTasks} tareas`,
          `Tiempo trabajado: ${Math.round(comprehensiveData.periodData.timeWorked / 60)} horas en ${comprehensiveData.periodData.sessionsCount} sesiones`,
          `Productividad promedio: ${comprehensiveData.periodData.avgProductivity.toFixed(1)}/5`,
          comprehensiveData.insights.mostProductiveProject 
            ? `Proyecto más productivo: ${comprehensiveData.insights.mostProductiveProject}`
            : 'Enfoque distribuido entre proyectos',
          `Tasa de completación: ${comprehensiveData.insights.completionRate.toFixed(1)}%`,
          `Eficiencia temporal: ${comprehensiveData.insights.efficiency.toFixed(1)}%`
        ],
        
        // Smart recommendations based on real data
        recommendations: [
          comprehensiveData.currentState.pendingTasks > 20 
            ? 'Considera priorizar y organizar las tareas pendientes'
            : 'Buen control de tareas pendientes',
          comprehensiveData.currentState.overdueTasksTotal > 0
            ? `Atención: ${comprehensiveData.currentState.overdueTasksTotal} tareas vencidas requieren seguimiento`
            : 'Excelente gestión de plazos',
          comprehensiveData.periodData.avgProductivity > 3
            ? 'Mantén este nivel de productividad'
            : 'Busca optimizar tu productividad en las sesiones de trabajo',
          comprehensiveData.insights.efficiency > 90
            ? 'Tu estimación de tiempos es muy precisa'
            : 'Mejora la estimación de duración de tareas',
          comprehensiveData.insights.trends.hoursPerDay > 6
            ? 'Buen volumen de trabajo diario'
            : 'Considera incrementar las horas de trabajo enfocado'
        ],

        // Monthly-specific data
        ...(type === 'monthly' && {
          weeklyBreakdown: comprehensiveData.projects.map((project, index) => ({
            week: index + 1,
            tasksCompleted: Math.floor(project.completedTasks / 4),
            timeSpent: Math.floor(project.timeSpent / 4),
            productivity: comprehensiveData.periodData.avgProductivity
          })),
          trends: {
            productivityTrend: comprehensiveData.insights.trends.productivityTrend,
            timeEfficiency: comprehensiveData.insights.efficiency / 100,
            bestWeek: 1,
            improvements: [
              comprehensiveData.insights.efficiency > 90 
                ? 'Excelente precisión en estimaciones'
                : 'Mejorar estimación de tiempos',
              comprehensiveData.insights.completionRate > 80
                ? 'Alta tasa de completación'
                : 'Enfocar en completar tareas iniciadas',
              'Mantener el momentum actual'
            ]
          },
          comparison: comprehensiveData.comparison
        })
      };

      // Enhanced metrics for database
      const metrics = {
        tasksCompleted: comprehensiveData.periodData.tasksCompleted,
        tasksCreated: comprehensiveData.periodData.tasksCreated,
        productivity: comprehensiveData.periodData.avgProductivity,
        timeWorked: comprehensiveData.periodData.timeWorked,
        efficiency: comprehensiveData.insights.efficiency,
        completionRate: comprehensiveData.insights.completionRate,
        projectsActive: comprehensiveData.currentState.activeProjects,
        projectsWorked: comprehensiveData.periodData.projectsWorkedOn
      };

      console.log('📊 Métricas calculadas:', metrics);
      console.log('📄 Datos del reporte preparados:', {
        proyectos: reportData.projects.length,
        tareasPeriodo: reportData.tasksData.totalInPeriod,
        sesiones: reportData.sessionsData.total,
        insights: reportData.insights.length,
        recomendaciones: reportData.recommendations.length
      });

      // Save to database
      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          user_id: user.id,
          report_type: type,
          period_start: comprehensiveData.period.start.split('T')[0],
          period_end: comprehensiveData.period.end.split('T')[0],
          report_data: reportData,
          metrics
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error guardando reporte:', error);
        throw error;
      }

      console.log('✅ Reporte comprehensivo guardado exitosamente:', data.id);
      
      return {
        ...data,
        report_type: data.report_type as 'weekly' | 'monthly'
      } as GeneratedReport;
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
      toast({
        title: "Reporte generado exitosamente",
        description: `Reporte ${report.report_type} con datos completos guardado`,
      });
    },
    onError: (error) => {
      console.error('Error generating comprehensive report:', error);
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