
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';
import { TaskLog } from '@/types/taskLogs';
import { TaskContext } from '@/utils/taskContext';

export interface EnhancedTaskContext extends TaskContext {
  hierarchicalLogs: TaskLog[];
  lastActivityDate: Date | null;
  daysSinceLastActivity: number;
  activitySummary: {
    totalLogs: number;
    recentLogs: number; // Last 7 days
    logsByLevel: {
      main: number;
      subtasks: number;
      microtasks: number;
    };
  };
  progressAnalysis: {
    velocityScore: number; // Tasks completed per day
    stagnationRisk: 'low' | 'medium' | 'high';
    predictedCompletion: Date | null;
  };
}

export async function getEnhancedTaskContext(taskId: string): Promise<EnhancedTaskContext> {
  console.log('📊 Obteniendo contexto COMPLETO para task:', taskId);
  
  try {
    // Get base context first
    const baseContext = await getBaseTaskContext(taskId);
    
    // Get ALL logs from the entire task hierarchy
    const hierarchicalLogs = await getAllHierarchicalLogs(taskId, baseContext);
    
    // Analyze activity patterns
    const activityAnalysis = analyzeActivityPatterns(hierarchicalLogs);
    
    // Calculate progress analysis
    const progressAnalysis = calculateProgressAnalysis(baseContext, hierarchicalLogs);
    
    const enhancedContext: EnhancedTaskContext = {
      ...baseContext,
      hierarchicalLogs,
      lastActivityDate: activityAnalysis.lastActivityDate,
      daysSinceLastActivity: activityAnalysis.daysSinceLastActivity,
      activitySummary: activityAnalysis.summary,
      progressAnalysis
    };

    console.log('✅ Contexto COMPLETO obtenido:', {
      hasMainTask: !!baseContext.mainTask,
      taskTitle: baseContext.mainTask.title,
      hierarchicalLogsCount: hierarchicalLogs.length,
      daysSinceActivity: activityAnalysis.daysSinceLastActivity,
      progressVelocity: progressAnalysis.velocityScore,
      stagnationRisk: progressAnalysis.stagnationRisk
    });

    return enhancedContext;
  } catch (error) {
    console.error('❌ Error getting enhanced task context:', error);
    throw error;
  }
}

async function getBaseTaskContext(taskId: string): Promise<TaskContext> {
  // Get main task
  const { data: mainTask, error: mainTaskError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (mainTaskError || !mainTask) {
    throw new Error('Task not found');
  }

  // Get subtasks (nivel 2)
  const { data: subtasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('parent_task_id', taskId)
    .eq('task_level', 2)
    .order('created_at', { ascending: true });

  // Get microtasks (nivel 3)
  const subtaskIds = subtasks?.map(s => s.id) || [];
  const { data: microtasks } = await supabase
    .from('tasks')
    .select('*')
    .in('parent_task_id', subtaskIds)
    .eq('task_level', 3)
    .order('created_at', { ascending: true });

  // Get basic logs for main task only (for backward compatibility)
  const { data: recentLogs } = await supabase
    .from('task_logs')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get dependencies
  const { data: blockingDeps } = await supabase
    .from('task_dependencies')
    .select('depends_on_task_id')
    .eq('task_id', taskId);

  const blockingTaskIds = blockingDeps?.map(dep => dep.depends_on_task_id) || [];
  const { data: blockingTasks } = blockingTaskIds.length > 0 ? await supabase
    .from('tasks')
    .select('*')
    .in('id', blockingTaskIds) : { data: [] };

  const { data: dependentDeps } = await supabase
    .from('task_dependencies')
    .select('task_id')
    .eq('depends_on_task_id', taskId);

  const dependentTaskIds = dependentDeps?.map(dep => dep.task_id) || [];
  const { data: dependentTasks } = dependentTaskIds.length > 0 ? await supabase
    .from('tasks')
    .select('*')
    .in('id', dependentTaskIds) : { data: [] };

  // Get project context
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

  // Calculate completion status
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
      blocking: (blockingTasks || []) as Task[],
      dependent: (dependentTasks || []) as Task[]
    },
    projectContext
  };
}

async function getAllHierarchicalLogs(taskId: string, context: TaskContext): Promise<TaskLog[]> {
  // Collect ALL task IDs from the hierarchy
  const allTaskIds = [
    taskId,
    ...context.subtasks.map(s => s.id),
    ...context.microtasks.map(m => m.id)
  ];

  console.log('🔍 Obteniendo logs para jerarquía completa:', {
    mainTaskId: taskId,
    subtaskIds: context.subtasks.map(s => s.id),
    microtaskIds: context.microtasks.map(m => m.id),
    totalTaskIds: allTaskIds.length
  });

  // Get ALL logs from the entire hierarchy
  const { data: hierarchicalLogs, error } = await supabase
    .from('task_logs')
    .select('*')
    .in('task_id', allTaskIds)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error obteniendo logs jerárquicos:', error);
    return [];
  }

  console.log('📋 Logs jerárquicos obtenidos:', {
    totalLogs: hierarchicalLogs?.length || 0,
    byTaskId: hierarchicalLogs?.reduce((acc, log) => {
      acc[log.task_id] = (acc[log.task_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });

  return (hierarchicalLogs || []) as TaskLog[];
}

function analyzeActivityPatterns(logs: TaskLog[]) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Find the most recent activity across ALL hierarchy
  const lastActivityDate = logs.length > 0 ? new Date(logs[0].created_at) : null;
  
  // Calculate days since last activity
  const daysSinceLastActivity = lastActivityDate 
    ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  // Count recent logs (last 7 days)
  const recentLogs = logs.filter(log => 
    new Date(log.created_at) >= sevenDaysAgo
  ).length;

  // Count logs by hierarchy level
  const logsByLevel = logs.reduce((acc, log) => {
    // Determine level based on task_id (this is a simplified approach)
    // In a real implementation, you'd need to cross-reference with task hierarchy
    if (log.task_id === logs[0]?.task_id) {
      acc.main++;
    } else {
      // For now, we'll categorize as subtasks - could be enhanced
      acc.subtasks++;
    }
    return acc;
  }, { main: 0, subtasks: 0, microtasks: 0 });

  return {
    lastActivityDate,
    daysSinceLastActivity,
    summary: {
      totalLogs: logs.length,
      recentLogs,
      logsByLevel
    }
  };
}

function calculateProgressAnalysis(context: TaskContext, logs: TaskLog[]) {
  const { completionStatus, mainTask } = context;
  const taskAge = Math.floor(
    (new Date().getTime() - new Date(mainTask.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Calculate velocity (progress per day)
  const velocityScore = taskAge > 0 ? completionStatus.overallProgress / taskAge : 0;

  // Determine stagnation risk
  const recentActivityDays = logs.length > 0 ? 
    Math.floor((new Date().getTime() - new Date(logs[0].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 999;

  let stagnationRisk: 'low' | 'medium' | 'high' = 'low';
  if (recentActivityDays > 7) stagnationRisk = 'high';
  else if (recentActivityDays > 3) stagnationRisk = 'medium';

  // Predict completion date based on current velocity
  let predictedCompletion: Date | null = null;
  if (velocityScore > 0 && completionStatus.overallProgress < 100) {
    const remainingProgress = 100 - completionStatus.overallProgress;
    const daysToComplete = remainingProgress / velocityScore;
    predictedCompletion = new Date();
    predictedCompletion.setDate(predictedCompletion.getDate() + Math.ceil(daysToComplete));
  }

  return {
    velocityScore: Math.round(velocityScore * 100) / 100,
    stagnationRisk,
    predictedCompletion
  };
}

// Export the original function for backward compatibility
export { getTaskContext } from '@/utils/taskContext';
