
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TaskLog } from '@/types/taskLogs';

export const useTaskLogs = (taskId?: string) => {
  const { user } = useAuth();

  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ['task-logs', user?.id, taskId],
    queryFn: async () => {
      if (!user || !taskId) return [];
      
      const { data, error } = await supabase
        .from('task_logs')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaskLog[];
    },
    enabled: !!user && !!taskId,
  });

  // Obtener logs jerárquicos (tarea + subtareas + microtareas)
  const { data: hierarchicalLogs = [], isLoading: isLoadingHierarchical } = useQuery({
    queryKey: ['hierarchical-logs', user?.id, taskId],
    queryFn: async () => {
      if (!user || !taskId) return [];
      
      // Primero obtener la tarea y todas sus descendientes
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, parent_task_id, task_level')
        .eq('user_id', user.id)
        .or(`id.eq.${taskId},parent_task_id.eq.${taskId}`);

      if (tasksError) throw tasksError;

      // Obtener subtareas de las subtareas (microtareas)
      const subtaskIds = allTasks?.filter(t => t.parent_task_id === taskId).map(t => t.id) || [];
      let microtasks: any[] = [];
      
      if (subtaskIds.length > 0) {
        const { data: microtaskData, error: microtasksError } = await supabase
          .from('tasks')
          .select('id, title, parent_task_id, task_level')
          .eq('user_id', user.id)
          .in('parent_task_id', subtaskIds);

        if (microtasksError) throw microtasksError;
        microtasks = microtaskData || [];
      }

      const allTaskIds = [...(allTasks || []), ...microtasks].map(t => t.id);
      
      if (allTaskIds.length === 0) return [];

      // Obtener todos los logs de las tareas relacionadas
      const { data: logsData, error: logsError } = await supabase
        .from('task_logs')
        .select('*')
        .eq('user_id', user.id)
        .in('task_id', allTaskIds)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Enriquecer logs con información de la tarea
      const enrichedLogs = (logsData || []).map(log => {
        const task = [...(allTasks || []), ...microtasks].find(t => t.id === log.task_id);
        return {
          ...log,
          task_info: task ? {
            title: task.title,
            level: task.task_level,
            parent_id: task.parent_task_id
          } : null
        };
      });

      return enrichedLogs;
    },
    enabled: !!user && !!taskId,
  });

  return {
    logs,
    hierarchicalLogs,
    isLoading,
    isLoadingHierarchical,
    error,
  };
};
