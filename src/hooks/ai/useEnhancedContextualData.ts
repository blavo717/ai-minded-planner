import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedTaskHierarchy {
  mainTask: any;
  subtasks: any[];
  microtasks: any[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overallProgress: number;
}

export interface EnhancedContextualData {
  user: {
    id: string;
    totalTasks: number;
    activeTasks: number;
    completedToday: number;
    workingHours: number;
  };
  taskHierarchy: {
    mainTasks: EnhancedTaskHierarchy[];
    recentlyWorked: any[];
    urgentTasks: any[];
    blockedTasks: any[];
  };
  currentWork: {
    activeSession: any;
    currentTask: any;
    currentSubtask: any;
    currentMicrotask: any;
    sessionDuration: number;
    todaysSessions: any[];
  };
  productivity: {
    todayScore: number;
    weeklyTrend: 'up' | 'down' | 'stable';
    mostProductiveHour: number;
    completionRate: number;
    averageTaskTime: number;
  };
  recentActivity: {
    lastTaskWorked: any;
    lastLogEntry: any;
    recentCompletions: any[];
    daysSinceLastActivity: number;
  };
  projects: {
    activeProjects: any[];
    stuckProjects: any[];
    completingProjects: any[];
  };
  insights: {
    workPattern: 'productive' | 'moderate' | 'low' | 'inactive';
    recommendations: string[];
    alerts: string[];
    nextBestAction: string;
  };
}

export const useEnhancedContextualData = () => {
  const { user } = useAuth();
  const { tasks, mainTasks, subtasks, microtasks } = useTasks();
  const { projects } = useProjects();
  const { sessions, activeSession } = useTaskSessions();
  const { logs } = useTaskLogs();

  const [contextData, setContextData] = useState<EnhancedContextualData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Generar jerarquía completa de tareas
  const buildTaskHierarchy = useCallback((): EnhancedTaskHierarchy[] => {
    return mainTasks.map(mainTask => {
      const taskSubtasks = subtasks.filter(sub => sub.parent_task_id === mainTask.id);
      const taskMicrotasks = microtasks.filter(micro => 
        taskSubtasks.some(sub => sub.id === micro.parent_task_id)
      );

      const allTasksInHierarchy = [mainTask, ...taskSubtasks, ...taskMicrotasks];
      const completedInHierarchy = allTasksInHierarchy.filter(t => t.status === 'completed');
      const inProgressInHierarchy = allTasksInHierarchy.filter(t => t.status === 'in_progress');

      const overallProgress = allTasksInHierarchy.length > 0 
        ? Math.round((completedInHierarchy.length / allTasksInHierarchy.length) * 100)
        : 0;

      return {
        mainTask,
        subtasks: taskSubtasks,
        microtasks: taskMicrotasks,
        totalTasks: allTasksInHierarchy.length,
        completedTasks: completedInHierarchy.length,
        inProgressTasks: inProgressInHierarchy.length,
        overallProgress
      };
    });
  }, [mainTasks, subtasks, microtasks]);

  // Analizar trabajo actual
  const analyzeCurrentWork = useCallback(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todaysSessions = sessions.filter(session => 
      new Date(session.started_at) >= todayStart
    );

    let currentTask = null;
    let currentSubtask = null;
    let currentMicrotask = null;

    if (activeSession?.task_id) {
      const task = tasks.find(t => t.id === activeSession.task_id);
      if (task) {
        if (task.task_level === 1) currentTask = task;
        else if (task.task_level === 2) currentSubtask = task;
        else if (task.task_level === 3) currentMicrotask = task;
      }
    }

    const sessionDuration = activeSession ? 
      Math.floor((now.getTime() - new Date(activeSession.started_at).getTime()) / 1000) : 0;

    return {
      activeSession,
      currentTask,
      currentSubtask,
      currentMicrotask,
      sessionDuration,
      todaysSessions
    };
  }, [activeSession, sessions, tasks]);

  // Analizar productividad
  const analyzeProductivity = useCallback(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const todayCompletions = tasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at &&
      new Date(task.completed_at) >= todayStart
    );

    const weekCompletions = tasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at &&
      new Date(task.completed_at) >= weekStart
    );

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const tasksWithDuration = tasks.filter(t => t.actual_duration && t.actual_duration > 0);
    const averageTaskTime = tasksWithDuration.length > 0 
      ? tasksWithDuration.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / tasksWithDuration.length
      : 0;

    // Calcular hora más productiva basada en completions
    const hourCounts: Record<number, number> = {};
    todayCompletions.forEach(task => {
      if (task.completed_at) {
        const hour = new Date(task.completed_at).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const mostProductiveHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || new Date().getHours();

    const todayScore = Math.min(100, todayCompletions.length * 10);
    
    return {
      todayScore,
      weeklyTrend: 'stable' as const,
      mostProductiveHour: parseInt(mostProductiveHour.toString()),
      completionRate,
      averageTaskTime
    };
  }, [tasks]);

  // Analizar actividad reciente
  const analyzeRecentActivity = useCallback(() => {
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    const lastTaskWorked = sortedTasks.find(t => 
      t.status === 'in_progress' || t.last_worked_at
    );

    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const lastLogEntry = sortedLogs[0];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const recentCompletions = tasks.filter(task => 
      task.status === 'completed' && 
      task.completed_at &&
      new Date(task.completed_at) >= todayStart
    );

    // Calcular días sin actividad
    let daysSinceLastActivity = 0;
    if (lastLogEntry) {
      const lastActivity = new Date(lastLogEntry.created_at);
      daysSinceLastActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    } else if (lastTaskWorked) {
      const lastWork = new Date(lastTaskWorked.last_worked_at || lastTaskWorked.updated_at);
      daysSinceLastActivity = Math.floor((now.getTime() - lastWork.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      lastTaskWorked,
      lastLogEntry,
      recentCompletions,
      daysSinceLastActivity
    };
  }, [tasks, logs]);

  // Analizar proyectos
  const analyzeProjects = useCallback(() => {
    const activeProjects = projects.filter(p => p.status === 'active');
    
    const stuckProjects = activeProjects.filter(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const hasRecentActivity = projectTasks.some(task => {
        const lastUpdate = new Date(task.updated_at);
        const daysSince = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 7;
      });
      return !hasRecentActivity && projectTasks.length > 0;
    });

    const completingProjects = activeProjects.filter(project => 
      (project.progress || 0) >= 80
    );

    return {
      activeProjects,
      stuckProjects,
      completingProjects
    };
  }, [projects, tasks]);

  // Generar insights y recomendaciones
  const generateInsights = useCallback((data: Partial<EnhancedContextualData>) => {
    const recommendations: string[] = [];
    const alerts: string[] = [];
    let workPattern: 'productive' | 'moderate' | 'low' | 'inactive' = 'inactive';
    let nextBestAction = 'Revisar tareas pendientes';

    // Analizar patrón de trabajo
    const todayScore = data.productivity?.todayScore || 0;
    if (todayScore >= 50) workPattern = 'productive';
    else if (todayScore >= 30) workPattern = 'moderate';
    else if (todayScore >= 10) workPattern = 'low';

    // Generar recomendaciones basadas en trabajo actual
    if (data.currentWork?.activeSession) {
      const duration = data.currentWork.sessionDuration;
      if (duration > 3600) { // Más de 1 hora
        recommendations.push('Considera tomar un descanso de 10-15 minutos');
      }
      nextBestAction = 'Continuar con la tarea actual';
    } else {
      // Sugerir próxima acción
      if (data.taskHierarchy?.urgentTasks?.length > 0) {
        nextBestAction = `Trabajar en: ${data.taskHierarchy.urgentTasks[0]?.title}`;
      } else if (data.taskHierarchy?.recentlyWorked?.length > 0) {
        nextBestAction = `Continuar: ${data.taskHierarchy.recentlyWorked[0]?.title}`;
      }
    }

    // Alertas por inactividad
    const daysSinceActivity = data.recentActivity?.daysSinceLastActivity || 0;
    if (daysSinceActivity > 7) {
      alerts.push('🚨 Más de 7 días sin actividad registrada');
    } else if (daysSinceActivity > 3) {
      alerts.push('⚠️ Varios días sin actividad reciente');
    }

    // Alertas por proyectos bloqueados
    if (data.projects?.stuckProjects?.length > 0) {
      alerts.push(`📋 ${data.projects.stuckProjects.length} proyectos sin actividad reciente`);
    }

    // Recomendaciones por hora del día
    const hour = new Date().getHours();
    const isProductiveHour = hour === data.productivity?.mostProductiveHour;
    
    if (isProductiveHour && !data.currentWork?.activeSession) {
      recommendations.push('Es tu hora más productiva - considera trabajar en tareas complejas');
    }

    if (hour >= 9 && hour <= 11 && workPattern === 'inactive') {
      recommendations.push('Buen momento para planificar el día y establecer prioridades');
    }

    return {
      workPattern,
      recommendations: recommendations.slice(0, 5),
      alerts: alerts.slice(0, 3),
      nextBestAction
    };
  }, []);

  // Actualizar datos contextuales
  const updateContextualData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const now = new Date();
      
      // Construir jerarquía completa
      const taskHierarchy = buildTaskHierarchy();
      
      // Identificar tareas especiales
      const recentlyWorked = tasks
        .filter(t => t.last_worked_at)
        .sort((a, b) => new Date(b.last_worked_at!).getTime() - new Date(a.last_worked_at!).getTime())
        .slice(0, 5);

      const urgentTasks = tasks
        .filter(t => t.status !== 'completed' && (
          t.priority === 'urgent' || 
          (t.due_date && new Date(t.due_date) <= new Date(now.getTime() + 24 * 60 * 60 * 1000))
        ))
        .sort((a, b) => {
          const aPriority = a.priority === 'urgent' ? 4 : 3;
          const bPriority = b.priority === 'urgent' ? 4 : 3;
          return bPriority - aPriority;
        });

      const blockedTasks = tasks.filter(t => 
        t.status === 'pending' && 
        t.needs_followup === true
      );

      // Analizar todos los aspectos
      const currentWork = analyzeCurrentWork();
      const productivity = analyzeProductivity();
      const recentActivity = analyzeRecentActivity();
      const projectsAnalysis = analyzeProjects();

      // Construir datos de usuario
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const completedToday = tasks.filter(task => 
        task.status === 'completed' && 
        task.completed_at &&
        new Date(task.completed_at) >= todayStart
      ).length;

      const userData = {
        id: user.id,
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status === 'in_progress').length,
        completedToday,
        workingHours: currentWork.todaysSessions.reduce((total, session) => {
          const duration = session.duration_minutes || 0;
          return total + (duration / 60);
        }, 0)
      };

      const contextData: EnhancedContextualData = {
        user: userData,
        taskHierarchy: {
          mainTasks: taskHierarchy,
          recentlyWorked,
          urgentTasks,
          blockedTasks
        },
        currentWork,
        productivity,
        recentActivity,
        projects: projectsAnalysis,
        insights: generateInsights({
          currentWork,
          productivity,
          recentActivity,
          projects: projectsAnalysis,
          taskHierarchy: { mainTasks: taskHierarchy, recentlyWorked, urgentTasks, blockedTasks }
        })
      };

      setContextData(contextData);
      setLastUpdate(now);

      console.log('✅ Contexto mejorado generado:', {
        mainTasks: taskHierarchy.length,
        totalSubtasks: taskHierarchy.reduce((sum, h) => sum + h.subtasks.length, 0),
        totalMicrotasks: taskHierarchy.reduce((sum, h) => sum + h.microtasks.length, 0),
        activeSession: !!currentWork.activeSession,
        workPattern: contextData.insights.workPattern,
        recommendations: contextData.insights.recommendations.length
      });

    } catch (error) {
      console.error('❌ Error generando contexto mejorado:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    tasks,
    mainTasks,
    subtasks,
    microtasks,
    projects,
    sessions,
    logs,
    buildTaskHierarchy,
    analyzeCurrentWork,
    analyzeProductivity,
    analyzeRecentActivity,
    analyzeProjects,
    generateInsights
  ]);

  // Auto-actualización
  useEffect(() => {
    updateContextualData();
  }, [updateContextualData]);

  // Actualizar cuando cambien las tareas
  useEffect(() => {
    if (lastUpdate) {
      const timeSinceUpdate = Date.now() - lastUpdate.getTime();
      if (timeSinceUpdate > 30000) { // 30 segundos
        updateContextualData();
      }
    }
  }, [tasks.length, activeSession?.id]);

  return {
    contextData,
    isLoading,
    lastUpdate,
    updateContextualData,
    hasData: !!contextData,
    dataQuality: contextData ? Math.min(100, 
      (contextData.user.totalTasks > 0 ? 25 : 0) +
      (contextData.taskHierarchy.mainTasks.length > 0 ? 25 : 0) +
      (contextData.recentActivity.daysSinceLastActivity < 7 ? 25 : 0) +
      (contextData.currentWork.activeSession ? 25 : 0)
    ) : 0
  };
};