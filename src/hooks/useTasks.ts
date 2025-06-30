
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  completion_notes?: string;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  project_id?: string;
  user_id: string;
  parent_task_id?: string;
  estimated_duration?: number;
  actual_duration?: number;
  tags?: string[];
  // New fields from Phase 1
  last_worked_at?: string;
  last_communication_at?: string;
  communication_type?: 'email' | 'phone' | 'meeting' | 'whatsapp' | 'chat' | 'video_call' | 'in_person' | 'other';
  communication_notes?: string;
  task_level: 1 | 2 | 3; // 1=tarea, 2=subtarea, 3=microtarea
  ai_priority_score?: number;
  needs_followup?: boolean;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: string;
  parent_task_id?: string;
  estimated_duration?: number;
  tags?: string[];
  task_level?: 1 | 2 | 3;
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: string;
  parent_task_id?: string;
  estimated_duration?: number;
  actual_duration?: number;
  tags?: string[];
  completed_at?: string;
  completion_notes?: string;
  is_archived?: boolean;
  last_worked_at?: string;
  last_communication_at?: string;
  communication_type?: 'email' | 'phone' | 'meeting' | 'whatsapp' | 'chat' | 'video_call' | 'in_person' | 'other';
  communication_notes?: string;
  needs_followup?: boolean;
}

export const useTasks = () => {
  const { user } = useAuth();

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false) // Solo mostrar tareas no archivadas por defecto
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const { data: archivedTasks = [], isLoading: archivedLoading } = useQuery({
    queryKey: ['archived-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', true)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  // Separar por niveles de jerarquía (solo tareas activas)
  const mainTasks = tasks.filter(task => task.task_level === 1);
  const subtasks = tasks.filter(task => task.task_level === 2);
  const microtasks = tasks.filter(task => task.task_level === 3);

  const getSubtasksForTask = (taskId: string) => {
    const result = tasks.filter(task => task.parent_task_id === taskId);
    console.log('getSubtasksForTask called:', {
      taskId,
      allTasks: tasks.length,
      filteredTasks: result.length,
      result: result.map(t => ({ id: t.id, title: t.title, task_level: t.task_level, parent_task_id: t.parent_task_id }))
    });
    return result;
  };

  const getMicrotasksForSubtask = (subtaskId: string) => {
    return microtasks.filter(microtask => microtask.parent_task_id === subtaskId);
  };

  const getTasksByLevel = (level: 1 | 2 | 3) => {
    return tasks.filter(task => task.task_level === level);
  };

  const getTasksNeedingFollowup = () => {
    return tasks.filter(task => task.needs_followup === true);
  };

  const getTasksWithoutRecentActivity = (daysSince: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysSince);
    
    return tasks.filter(task => {
      const lastActivity = task.last_worked_at || task.last_communication_at;
      if (!lastActivity) return true;
      return new Date(lastActivity) < cutoffDate;
    });
  };

  const getTaskHierarchy = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;

    const subtasks = getSubtasksForTask(taskId);
    const taskWithSubtasks = subtasks.map(subtask => ({
      ...subtask,
      microtasks: getMicrotasksForSubtask(subtask.id)
    }));

    return {
      ...task,
      subtasks: taskWithSubtasks
    };
  };

  return {
    tasks,
    archivedTasks,
    mainTasks,
    subtasks,
    microtasks,
    getSubtasksForTask,
    getMicrotasksForSubtask,
    getTasksByLevel,
    getTasksNeedingFollowup,
    getTasksWithoutRecentActivity,
    getTaskHierarchy,
    isLoading: tasksLoading,
    isLoadingArchived: archivedLoading,
    error: tasksError,
  };
};
