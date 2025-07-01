
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';

export interface TaskLog {
  id: string;
  description: string;
  created_at: string;
  task_id: string;
}

export interface TaskContext {
  mainTask: Task;
  subtasks: Task[];
  microtasks: Task[];
  recentLogs: TaskLog[];
  completionStatus: {
    totalSubtasks: number;
    completedSubtasks: number;
    totalMicrotasks: number;
    completedMicrotasks: number;
    overallProgress: number;
  };
}

export async function getTaskContext(taskId: string): Promise<TaskContext> {
  try {
    // Obtener tarea principal
    const { data: mainTask } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (!mainTask) throw new Error('Task not found');

    // Obtener subtareas (nivel 2)
    const { data: subtasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', taskId)
      .eq('task_level', 2)
      .order('created_at', { ascending: true });

    // Obtener microtareas (nivel 3) 
    const { data: microtasks } = await supabase
      .from('tasks')
      .select('*')
      .in('parent_task_id', subtasks?.map(s => s.id) || [])
      .eq('task_level', 3)
      .order('created_at', { ascending: true });

    // Obtener logs recientes
    const { data: recentLogs } = await supabase
      .from('task_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(8);

    // Calcular progreso
    const totalSubtasks = subtasks?.length || 0;
    const completedSubtasks = subtasks?.filter(s => s.status === 'completed').length || 0;
    const totalMicrotasks = microtasks?.length || 0;
    const completedMicrotasks = microtasks?.filter(m => m.status === 'completed').length || 0;
    
    const overallProgress = totalSubtasks > 0 
      ? Math.round((completedSubtasks / totalSubtasks) * 100)
      : totalMicrotasks > 0 
        ? Math.round((completedMicrotasks / totalMicrotasks) * 100)
        : 0;

    return {
      mainTask,
      subtasks: subtasks || [],
      microtasks: microtasks || [],
      recentLogs: recentLogs || [],
      completionStatus: {
        totalSubtasks,
        completedSubtasks,
        totalMicrotasks,
        completedMicrotasks,
        overallProgress
      }
    };
  } catch (error) {
    console.error('Error getting task context:', error);
    throw error;
  }
}
