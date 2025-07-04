import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/hooks/useTasks';
import { TaskLog } from '@/types/taskLogs';

export interface CompleteTaskContext {
  // Tarea principal con toda su jerarquía
  mainTask: Task;
  fullHierarchy: {
    subtasks: Task[];
    microtasks: Task[];
    allTasks: Task[];
  };
  
  // Actividad y logs completos
  activityData: {
    allLogs: TaskLog[];
    recentLogs: TaskLog[];
    logsByLevel: {
      mainTask: TaskLog[];
      subtasks: TaskLog[];
      microtasks: TaskLog[];
    };
    lastActivity: Date | null;
    daysSinceLastActivity: number;
  };

  // Sesiones de trabajo
  workSessions: {
    activeSessions: any[];
    recentSessions: any[];
    totalWorkTime: number;
    todayWorkTime: number;
  };

  // Estado de progreso detallado
  progressAnalysis: {
    overallProgress: number;
    subtaskProgress: Array<{
      subtaskId: string;
      subtaskTitle: string;
      progress: number;
      microtaskCount: number;
      completedMicrotasks: number;
    }>;
    velocityScore: number;
    stagnationRisk: 'low' | 'medium' | 'high';
    estimatedCompletion: Date | null;
  };

  // Dependencias y bloqueos
  dependencies: {
    blocking: Task[];
    dependent: Task[];
    isBlocked: boolean;
    canProceed: boolean;
  };

  // Contexto del proyecto
  projectContext?: {
    project: any;
    relatedTasks: Task[];
    projectProgress: number;
    projectRisk: 'low' | 'medium' | 'high';
  };

  // Datos de usuario y contexto
  userContext: {
    totalTasks: number;
    activeTasks: number;
    completedToday: number;
    productivityScore: number;
    workPattern: 'morning' | 'afternoon' | 'evening' | 'night';
    isProductiveTime: boolean;
  };
}

export async function getCompleteTaskContext(taskId: string): Promise<CompleteTaskContext> {
  console.log('🔍 Obteniendo contexto COMPLETO para task:', taskId);
  
  try {
    // 1. Obtener tarea principal
    const { data: mainTask, error: mainTaskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (mainTaskError || !mainTask) {
      throw new Error(`Task not found: ${taskId}`);
    }

    console.log('✅ Tarea principal obtenida:', mainTask.title);

    // 2. Obtener TODA la jerarquía
    const { data: subtasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', taskId)
      .eq('task_level', 2)
      .order('created_at', { ascending: true });

    const subtaskIds = subtasks?.map(s => s.id) || [];
    const { data: microtasks } = subtasks && subtaskIds.length > 0 ? await supabase
      .from('tasks')
      .select('*')
      .in('parent_task_id', subtaskIds)
      .eq('task_level', 3)
      .order('created_at', { ascending: true }) : { data: [] };

    const allTasks = [mainTask, ...(subtasks || []), ...(microtasks || [])];
    
    console.log('📋 Jerarquía completa:', {
      mainTask: 1,
      subtasks: subtasks?.length || 0,
      microtasks: microtasks?.length || 0,
      total: allTasks.length
    });

    // 3. Obtener TODOS los logs de la jerarquía
    const allTaskIds = allTasks.map(t => t.id);
    const { data: allLogs } = await supabase
      .from('task_logs')
      .select('*')
      .in('task_id', allTaskIds)
      .order('created_at', { ascending: false });

    const recentLogs = (allLogs || []).slice(0, 20);
    
    // Clasificar logs por nivel
    const logsByLevel = {
      mainTask: (allLogs || []).filter(log => log.task_id === taskId) as TaskLog[],
      subtasks: (allLogs || []).filter(log => subtaskIds.includes(log.task_id)) as TaskLog[],
      microtasks: (allLogs || []).filter(log => 
        (microtasks || []).some(m => m.id === log.task_id)
      ) as TaskLog[]
    };

    console.log('📝 Logs obtenidos:', {
      total: allLogs?.length || 0,
      mainTask: logsByLevel.mainTask.length,
      subtasks: logsByLevel.subtasks.length,
      microtasks: logsByLevel.microtasks.length
    });

    // 4. Analizar actividad
    const lastActivity = allLogs && allLogs.length > 0 ? new Date(allLogs[0].created_at) : null;
    const daysSinceLastActivity = lastActivity 
      ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // 5. Obtener sesiones de trabajo
    const { data: allSessions } = await supabase
      .from('task_sessions')
      .select('*')
      .in('task_id', allTaskIds)
      .order('started_at', { ascending: false });

    const activeSessions = (allSessions || []).filter(s => !s.ended_at);
    const recentSessions = (allSessions || []).slice(0, 10);
    
    const totalWorkTime = (allSessions || []).reduce((sum, session) => {
      return sum + (session.duration_minutes || 0);
    }, 0);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayWorkTime = (allSessions || [])
      .filter(session => new Date(session.started_at) >= todayStart)
      .reduce((sum, session) => sum + (session.duration_minutes || 0), 0);

    // 6. Analizar progreso detallado
    const subtaskProgress = (subtasks || []).map(subtask => {
      const subtaskMicrotasks = (microtasks || []).filter(m => m.parent_task_id === subtask.id);
      const completedMicrotasks = subtaskMicrotasks.filter(m => m.status === 'completed').length;
      
      return {
        subtaskId: subtask.id,
        subtaskTitle: subtask.title,
        progress: subtaskMicrotasks.length > 0 
          ? Math.round((completedMicrotasks / subtaskMicrotasks.length) * 100)
          : (subtask.status === 'completed' ? 100 : 0),
        microtaskCount: subtaskMicrotasks.length,
        completedMicrotasks
      };
    });

    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const overallProgress = allTasks.length > 0 
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;

    // Calcular velocidad y predicciones
    const taskAge = Math.floor(
      (Date.now() - new Date(mainTask.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const velocityScore = taskAge > 0 ? overallProgress / taskAge : 0;

    let stagnationRisk: 'low' | 'medium' | 'high' = 'low';
    if (daysSinceLastActivity > 7) stagnationRisk = 'high';
    else if (daysSinceLastActivity > 3) stagnationRisk = 'medium';

    let estimatedCompletion: Date | null = null;
    if (velocityScore > 0 && overallProgress < 100) {
      const remainingProgress = 100 - overallProgress;
      const daysToComplete = remainingProgress / velocityScore;
      estimatedCompletion = new Date();
      estimatedCompletion.setDate(estimatedCompletion.getDate() + Math.ceil(daysToComplete));
    }

    // 7. Obtener dependencias
    const { data: blockingDeps } = await supabase
      .from('task_dependencies')
      .select('depends_on_task_id')
      .eq('task_id', taskId);

    const { data: dependentDeps } = await supabase
      .from('task_dependencies')
      .select('task_id')
      .eq('depends_on_task_id', taskId);

    let blocking: Task[] = [];
    let dependent: Task[] = [];

    if (blockingDeps && blockingDeps.length > 0) {
      const { data: blockingTasks } = await supabase
        .from('tasks')
        .select('*')
        .in('id', blockingDeps.map(dep => dep.depends_on_task_id));
      blocking = (blockingTasks || []) as Task[];
    }

    if (dependentDeps && dependentDeps.length > 0) {
      const { data: dependentTasks } = await supabase
        .from('tasks')
        .select('*')
        .in('id', dependentDeps.map(dep => dep.task_id));
      dependent = (dependentTasks || []) as Task[];
    }

    const isBlocked = blocking.some(task => task.status !== 'completed');
    const canProceed = !isBlocked;

    // 8. Contexto del proyecto
    let projectContext = undefined;
    if (mainTask.project_id) {
      const { data: project } = await supabase
        .from('projects')
        .select('*')
        .eq('id', mainTask.project_id)
        .single();

      if (project) {
        const { data: relatedTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id)
          .neq('id', taskId);

        const projectTasks = [mainTask, ...(relatedTasks || [])];
        const projectCompletedTasks = projectTasks.filter(t => t.status === 'completed').length;
        const projectProgress = projectTasks.length > 0 
          ? Math.round((projectCompletedTasks / projectTasks.length) * 100)
          : 0;

        let projectRisk: 'low' | 'medium' | 'high' = 'low';
        const stuckTasks = (relatedTasks || []).filter(task => {
          const daysSince = Math.floor((Date.now() - new Date(task.updated_at).getTime()) / (1000 * 60 * 60 * 24));
          return daysSince > 7 && task.status !== 'completed';
        });

        if (stuckTasks.length > 2) projectRisk = 'high';
        else if (stuckTasks.length > 0) projectRisk = 'medium';

        projectContext = {
          project,
          relatedTasks: relatedTasks || [],
          projectProgress,
          projectRisk
        };
      }
    }

    // 9. Contexto de usuario
    const { data: userTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', mainTask.user_id);

    const totalTasks = userTasks?.length || 0;
    const activeTasks = (userTasks || []).filter(t => t.status === 'in_progress').length;
    const completedToday = (userTasks || []).filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate >= todayStart;
    }).length;

    const hour = new Date().getHours();
    let workPattern: 'morning' | 'afternoon' | 'evening' | 'night';
    if (hour >= 6 && hour < 12) workPattern = 'morning';
    else if (hour >= 12 && hour < 18) workPattern = 'afternoon';
    else if (hour >= 18 && hour < 22) workPattern = 'evening';
    else workPattern = 'night';

    const productivityScore = Math.min(100, completedToday * 10 + (todayWorkTime / 60) * 5);
    const isProductiveTime = workPattern === 'morning' || workPattern === 'afternoon';

    const result: CompleteTaskContext = {
      mainTask: mainTask as Task,
      fullHierarchy: {
        subtasks: (subtasks || []) as Task[],
        microtasks: (microtasks || []) as Task[],
        allTasks: allTasks as Task[]
      },
      activityData: {
        allLogs: (allLogs || []) as TaskLog[],
        recentLogs: recentLogs as TaskLog[],
        logsByLevel,
        lastActivity,
        daysSinceLastActivity
      },
      workSessions: {
        activeSessions: activeSessions || [],
        recentSessions: recentSessions || [],
        totalWorkTime,
        todayWorkTime
      },
      progressAnalysis: {
        overallProgress,
        subtaskProgress,
        velocityScore: Math.round(velocityScore * 100) / 100,
        stagnationRisk,
        estimatedCompletion
      },
      dependencies: {
        blocking,
        dependent,
        isBlocked,
        canProceed
      },
      projectContext,
      userContext: {
        totalTasks,
        activeTasks,
        completedToday,
        productivityScore: Math.round(productivityScore),
        workPattern,
        isProductiveTime
      }
    };

    console.log('✅ Contexto COMPLETO generado:', {
      taskTitle: mainTask.title,
      hierarchySize: allTasks.length,
      logsCount: allLogs?.length || 0,
      sessionsCount: allSessions?.length || 0,
      overallProgress,
      daysSinceActivity: daysSinceLastActivity,
      canProceed,
      hasProject: !!projectContext
    });

    return result;

  } catch (error) {
    console.error('❌ Error obteniendo contexto completo:', error);
    throw error;
  }
}

// Función para obtener contexto de usuario global (no solo una tarea)
export async function getGlobalUserContext(userId: string) {
  try {
    console.log('🌍 Obteniendo contexto global del usuario:', userId);

    // Obtener todas las tareas del usuario
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    // Obtener todos los proyectos
    const { data: allProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    // Obtener sesiones recientes
    const { data: recentSessions } = await supabase
      .from('task_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(50);

    // Obtener logs recientes
    const { data: recentLogs } = await supabase
      .from('task_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return {
      tasks: {
        all: allTasks || [],
        main: (allTasks || []).filter(t => t.task_level === 1),
        subtasks: (allTasks || []).filter(t => t.task_level === 2),
        microtasks: (allTasks || []).filter(t => t.task_level === 3),
        active: (allTasks || []).filter(t => t.status === 'in_progress'),
        urgent: (allTasks || []).filter(t => t.priority === 'urgent'),
        completedToday: (allTasks || []).filter(t => 
          t.status === 'completed' && 
          t.completed_at && 
          new Date(t.completed_at) >= todayStart
        )
      },
      projects: {
        all: allProjects || [],
        active: (allProjects || []).filter(p => p.status === 'active'),
        completing: (allProjects || []).filter(p => (p.progress || 0) >= 80)
      },
      activity: {
        recentSessions: recentSessions || [],
        recentLogs: recentLogs || [],
        todayWorkTime: (recentSessions || [])
          .filter(s => new Date(s.started_at) >= todayStart)
          .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
      }
    };

  } catch (error) {
    console.error('❌ Error obteniendo contexto global:', error);
    throw error;
  }
}