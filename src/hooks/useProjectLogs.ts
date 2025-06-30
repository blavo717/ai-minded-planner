
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ProjectLogEntry {
  id: string;
  type: 'project_change' | 'task_log';
  title: string;
  description?: string;
  user_id: string;
  created_at: string;
  metadata: any;
  task_info?: {
    title: string;
    level: number;
    parent_id?: string;
  };
}

export const useProjectLogs = (projectId?: string) => {
  const { user } = useAuth();

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['project-logs', user?.id, projectId],
    queryFn: async () => {
      if (!user || !projectId) return [];
      
      // Obtener historial de cambios del proyecto
      const { data: projectHistory, error: projectError } = await supabase
        .from('project_history')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectError) throw projectError;

      // Obtener todas las tareas del proyecto
      const { data: projectTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, task_level, parent_task_id')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      const taskIds = projectTasks?.map(t => t.id) || [];
      
      let taskLogs: any[] = [];
      if (taskIds.length > 0) {
        // Obtener logs de todas las tareas del proyecto
        const { data: taskLogsData, error: logsError } = await supabase
          .from('task_logs')
          .select('*')
          .in('task_id', taskIds)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (logsError) throw logsError;
        taskLogs = taskLogsData || [];
      }

      // Combinar y transformar los logs
      const allLogs: ProjectLogEntry[] = [];

      // Añadir logs de cambios de proyecto
      (projectHistory || []).forEach(entry => {
        allLogs.push({
          id: entry.id,
          type: 'project_change',
          title: `Proyecto ${entry.change_type}`,
          description: entry.notes || 'Cambio en el proyecto',
          user_id: entry.user_id,
          created_at: entry.created_at,
          metadata: {
            change_type: entry.change_type,
            old_values: entry.old_values,
            new_values: entry.new_values
          }
        });
      });

      // Añadir logs de tareas
      taskLogs.forEach(log => {
        const task = projectTasks?.find(t => t.id === log.task_id);
        allLogs.push({
          id: log.id,
          type: 'task_log',
          title: log.title,
          description: log.content,
          user_id: log.user_id,
          created_at: log.created_at,
          metadata: log.metadata,
          task_info: task ? {
            title: task.title,
            level: task.task_level,
            parent_id: task.parent_task_id
          } : undefined
        });
      });

      // Ordenar por fecha descendente
      return allLogs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user && !!projectId,
  });

  // Estadísticas de logs
  const stats = {
    total: logs.length,
    projectChanges: logs.filter(l => l.type === 'project_change').length,
    taskLogs: logs.filter(l => l.type === 'task_log').length,
    tasksCount: new Set(logs.filter(l => l.task_info).map(l => l.task_info?.title)).size,
    recentActivity: logs.filter(l => {
      const logDate = new Date(l.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return logDate >= sevenDaysAgo;
    }).length
  };

  return {
    logs,
    stats,
    isLoading,
    error,
  };
};
