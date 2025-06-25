
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface AITaskMonitoring {
  id: string;
  task_id: string;
  monitoring_type: 'health_check' | 'bottleneck_detection' | 'priority_analysis' | 'completion_prediction';
  analysis_data: any;
  priority_score?: number;
  predicted_completion_date?: string;
  bottleneck_detected?: boolean;
  suggestions?: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskHealthStatus {
  task_id: string;
  health_score: number;
  issues: string[];
  recommendations: string[];
  priority_score: number;
  predicted_completion?: string;
  bottleneck_detected: boolean;
}

export const useAITaskMonitor = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Obtener datos de monitoreo para todas las tareas del usuario
  const { data: monitoringData = [], isLoading } = useQuery({
    queryKey: ['ai-task-monitoring', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('ai_task_monitoring')
        .select(`
          *,
          tasks!inner(user_id)
        `)
        .eq('tasks.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AITaskMonitoring[];
    },
    enabled: !!user,
  });

  // Obtener estado de salud consolidado por tarea
  const getTaskHealthStatus = (taskId: string): TaskHealthStatus | null => {
    const taskMonitoring = monitoringData.filter(m => m.task_id === taskId);
    if (taskMonitoring.length === 0) return null;

    const healthCheck = taskMonitoring.find(m => m.monitoring_type === 'health_check');
    const priorityAnalysis = taskMonitoring.find(m => m.monitoring_type === 'priority_analysis');
    const completionPrediction = taskMonitoring.find(m => m.monitoring_type === 'completion_prediction');
    const bottleneckDetection = taskMonitoring.find(m => m.monitoring_type === 'bottleneck_detection');

    return {
      task_id: taskId,
      health_score: healthCheck?.analysis_data?.health_score || 50,
      issues: healthCheck?.analysis_data?.issues || [],
      recommendations: healthCheck?.suggestions || [],
      priority_score: priorityAnalysis?.priority_score || 0,
      predicted_completion: completionPrediction?.predicted_completion_date,
      bottleneck_detected: bottleneckDetection?.bottleneck_detected || false,
    };
  };

  // Obtener tareas con problemas críticos
  const getCriticalTasks = () => {
    const criticalTasks = [];
    const taskIds = [...new Set(monitoringData.map(m => m.task_id))];
    
    for (const taskId of taskIds) {
      const status = getTaskHealthStatus(taskId);
      if (status && (status.health_score < 30 || status.bottleneck_detected)) {
        criticalTasks.push(status);
      }
    }
    
    return criticalTasks.sort((a, b) => a.health_score - b.health_score);
  };

  // Obtener insights generales
  const getGeneralInsights = () => {
    const taskIds = [...new Set(monitoringData.map(m => m.task_id))];
    const totalTasks = taskIds.length;
    
    if (totalTasks === 0) return null;

    let healthyTasks = 0;
    let criticalTasks = 0;
    let bottleneckedTasks = 0;
    let averagePriorityScore = 0;

    for (const taskId of taskIds) {
      const status = getTaskHealthStatus(taskId);
      if (status) {
        if (status.health_score >= 70) healthyTasks++;
        if (status.health_score < 30) criticalTasks++;
        if (status.bottleneck_detected) bottleneckedTasks++;
        averagePriorityScore += status.priority_score;
      }
    }

    averagePriorityScore = averagePriorityScore / totalTasks;

    return {
      total_tasks: totalTasks,
      healthy_tasks: healthyTasks,
      critical_tasks: criticalTasks,
      bottlenecked_tasks: bottleneckedTasks,
      average_priority_score: Math.round(averagePriorityScore),
      health_percentage: Math.round((healthyTasks / totalTasks) * 100),
    };
  };

  // Ejecutar análisis AI para tareas específicas
  const runAnalysisMutation = useMutation({
    mutationFn: async ({
      taskIds,
      analysisType,
    }: {
      taskIds?: string[];
      analysisType?: 'health_check' | 'bottleneck_detection' | 'priority_analysis' | 'completion_prediction';
    }) => {
      const response = await supabase.functions.invoke('ai-task-monitor', {
        body: {
          taskIds,
          userId: user?.id,
          analysisType,
        },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-task-monitoring', user?.id] });
      toast({
        title: "Análisis completado",
        description: "El monitoreo IA ha actualizado el estado de las tareas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error en el análisis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    monitoringData,
    isLoading,
    getTaskHealthStatus,
    getCriticalTasks,
    getGeneralInsights,
    runAnalysis: runAnalysisMutation.mutate,
    isAnalyzing: runAnalysisMutation.isPending,
  };
};
