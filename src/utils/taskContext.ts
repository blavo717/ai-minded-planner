
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';
import { TaskLog } from '@/types/taskLogs';

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
  dependencies: {
    blocking: Task[];
    dependent: Task[];
  };
  projectContext?: {
    name: string;
    status: string;
  };
}

export async function getTaskContext(taskId: string): Promise<TaskContext> {
  console.log('📊 Obteniendo contexto para task:', taskId);
  
  try {
    // Obtener tarea principal
    const { data: mainTask, error: mainTaskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (mainTaskError || !mainTask) {
      console.error('❌ Error obteniendo tarea principal:', mainTaskError);
      throw new Error('Task not found');
    }

    // Obtener subtareas (nivel 2)
    const { data: subtasks, error: subtasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', taskId)
      .eq('task_level', 2)
      .order('created_at', { ascending: true });

    if (subtasksError) {
      console.error('❌ Error obteniendo subtareas:', subtasksError);
    }

    // Obtener microtareas (nivel 3) 
    const { data: microtasks, error: microtasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('parent_task_id', subtasks?.map(s => s.id) || [])
      .eq('task_level', 3)
      .order('created_at', { ascending: true });

    if (microtasksError) {
      console.error('❌ Error obteniendo microtareas:', microtasksError);
    }

    // Obtener logs recientes usando la interface correcta
    const { data: recentLogs, error: logsError } = await supabase
      .from('task_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(8);

    if (logsError) {
      console.error('❌ Error obteniendo logs:', logsError);
    }

    // Obtener dependencias
    const { data: blockingDeps } = await supabase
      .from('task_dependencies')
      .select('depends_on_task_id, tasks!task_dependencies_depends_on_task_id_fkey(*)')
      .eq('task_id', taskId);

    const { data: dependentDeps } = await supabase
      .from('task_dependencies')
      .select('task_id, tasks!task_dependencies_task_id_fkey(*)')
      .eq('depends_on_task_id', taskId);

    // Obtener contexto del proyecto si existe
    let projectContext = undefined;
    if (mainTask.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('name, status')
        .eq('id', mainTask.project_id)
        .single();
      
      if (project) {
        projectContext = {
          name: project.name,
          status: project.status || 'active'
        };
      }
    }

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

    const result: TaskContext = {
      mainTask: mainTask as Task,
      subtasks: (subtasks || []) as Task[],
      microtasks: (microtasks || []) as Task[],
      recentLogs: (recentLogs || []) as TaskLog[],
      completionStatus: {
        totalSubtasks,
        completedSubtasks,
        totalMicrotasks,
        completedMicrotasks,
        overallProgress
      },
      dependencies: {
        blocking: blockingDeps?.map(dep => dep.tasks).filter(Boolean) || [],
        dependent: dependentDeps?.map(dep => dep.tasks).filter(Boolean) || []
      },
      projectContext
    };

    console.log('✅ Contexto obtenido:', {
      hasMainTask: !!mainTask,
      taskTitle: mainTask.title,
      taskStatus: mainTask.status,
      subtasksCount: result.subtasks.length,
      logsCount: result.recentLogs.length,
      progress: result.completionStatus.overallProgress,
      hasDependencies: result.dependencies.blocking.length > 0 || result.dependencies.dependent.length > 0,
      hasProjectContext: !!result.projectContext
    });

    return result;
  } catch (error) {
    console.error('❌ Error getting task context:', error);
    throw error;
  }
}
