import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, differenceInDays } from 'date-fns';

export interface TaskHierarchy {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  level: number; // 1 = main, 2 = subtask, 3 = microtask
  parent_task_id?: string;
  project_id?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  estimated_duration?: number;
  actual_duration?: number;
  tags?: string[];
  subtasks?: any[];
  microtasks?: any[];
}

export interface ProjectAnalysis {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // Calculated metrics
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
  timeSpent: number; // minutes
  efficiency: number; // percentage
  
  // Task hierarchy
  mainTasks: any[];
  allTasks: any[];
}

export interface WorkSession {
  id: string;
  task_id?: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  productivity_score?: number;
  notes?: string;
  task?: {
    id: string;
    title: string;
    project_id?: string;
  };
}

export interface ComprehensiveReportData {
  // Period info
  period: {
    start: string;
    end: string;
    type: 'weekly' | 'monthly';
  };
  
  // Current state snapshot
  currentState: {
    activeProjects: number;
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasksTotal: number;
    overdueTasksTotal: number;
  };
  
  // Period-specific data
  periodData: {
    tasksCompleted: number;
    tasksCreated: number;
    timeWorked: number; // minutes
    sessionsCount: number;
    avgProductivity: number;
    projectsWorkedOn: number;
  };
  
  // Detailed project analysis
  projects: ProjectAnalysis[];
  
  // Task hierarchy for period
  taskHierarchy: TaskHierarchy[];
  
  // Work sessions
  sessions: WorkSession[];
  
  // Calculated insights
  insights: {
    mostProductiveProject?: string;
    avgTaskDuration: number;
    completionRate: number;
    efficiency: number;
    trends: {
      tasksPerDay: number;
      hoursPerDay: number;
      productivityTrend: 'increasing' | 'decreasing' | 'stable';
    };
  };
  
  // Tareas consolidadas para el template
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    project_name?: string;
    project_id?: string;
    completed_at?: string;
    actual_duration?: number;
    estimated_duration?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  
  // Period comparison (for monthly reports)
  comparison?: {
    previousPeriod: {
      tasksCompleted: number;
      timeWorked: number;
      productivity: number;
    };
    changes: {
      tasksChange: number;
      timeChange: number;
      productivityChange: number;
    };
  };
}

export class ComprehensiveReportDataService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async generateComprehensiveReport(type: 'weekly' | 'monthly'): Promise<ComprehensiveReportData> {
    console.log(`🔄 Generando reporte comprehensivo ${type} para usuario:`, this.userId);

    const now = new Date();
    const period = this.calculatePeriod(type, now);

    // Fetch all required data in parallel
    const [
      allProjects,
      allTasks,
      periodTasks,
      allSessions,
      periodSessions
    ] = await Promise.all([
      this.fetchAllProjects(),
      this.fetchAllTasks(),
      this.fetchPeriodTasks(period.start, period.end),
      this.fetchAllSessions(),
      this.fetchPeriodSessions(period.start, period.end)
    ]);

    console.log('📊 Datos obtenidos:', {
      proyectos: allProjects.length,
      tareasTotal: allTasks.length,
      tareasPeriodo: periodTasks.length,
      sesiones: allSessions.length,
      sesionesPeriodo: periodSessions.length
    });

    // Build current state snapshot
    const currentState = this.buildCurrentState(allProjects, allTasks);

    // Analyze projects with full hierarchy
    const projects = this.analyzeProjects(allProjects, allTasks, allSessions);

    // Build task hierarchy for period
    const taskHierarchy = this.buildTaskHierarchy(periodTasks);

    // Calculate period data
    const periodData = this.calculatePeriodData(periodTasks, periodSessions);

    // Generate insights
    const insights = this.generateInsights(periodTasks, periodSessions, projects);

    // Generate comparison for monthly reports
    const comparison = type === 'monthly' 
      ? await this.generateComparison(period, periodData)
      : undefined;

    // Consolidar todas las tareas con información completa
    const allConsolidatedTasks = this.consolidateAllTasks(allTasks, allProjects);
    
    console.log('📊 Tareas consolidadas en reporte:', {
      totalTasks: allConsolidatedTasks.length,
      periodTasks: periodTasks.length,
      projects: projects.length
    });

    return {
      period: {
        start: period.start.toISOString(),
        end: period.end.toISOString(),
        type
      },
      currentState,
      periodData,
      projects,
      tasks: allConsolidatedTasks, // ✅ AGREGAR TASKS AL NIVEL RAÍZ
      taskHierarchy,
      sessions: this.enrichSessions(periodSessions, allTasks),
      insights,
      comparison
    };
  }

  private calculatePeriod(type: 'weekly' | 'monthly', now: Date) {
    if (type === 'weekly') {
      return {
        start: startOfWeek(subWeeks(now, 1)),
        end: endOfWeek(subWeeks(now, 1))
      };
    } else {
      return {
        start: startOfMonth(subMonths(now, 1)),
        end: endOfMonth(subMonths(now, 1))
      };
    }
  }

  private async fetchAllProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', this.userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async fetchAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async fetchPeriodTasks(start: Date, end: Date) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_archived', false)
      .or(`created_at.gte.${start.toISOString()},completed_at.gte.${start.toISOString()},updated_at.gte.${start.toISOString()}`)
      .lte('created_at', end.toISOString());

    if (error) throw error;
    return data || [];
  }

  private async fetchAllSessions() {
    const { data, error } = await supabase
      .from('task_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  private async fetchPeriodSessions(start: Date, end: Date) {
    const { data, error } = await supabase
      .from('task_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .gte('started_at', start.toISOString())
      .lte('started_at', end.toISOString());

    if (error) throw error;
    return data || [];
  }

  private buildCurrentState(projects: any[], tasks: any[]) {
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const completedTasksTotal = tasks.filter(t => t.status === 'completed').length;
    const overdueTasksTotal = tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'completed'
    ).length;

    return {
      activeProjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasksTotal,
      overdueTasksTotal
    };
  }

  private analyzeProjects(projects: any[], tasks: any[], sessions: any[]): ProjectAnalysis[] {
    return projects.map(project => {
      const projectTasks = tasks.filter(t => t.project_id === project.id);
      const projectSessions = sessions.filter(s => {
        const task = tasks.find(t => t.id === s.task_id);
        return task && task.project_id === project.id;
      });

      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
      const pendingTasks = projectTasks.filter(t => t.status === 'pending').length;
      const inProgressTasks = projectTasks.filter(t => t.status === 'in_progress').length;
      const overdueTasks = projectTasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) < new Date() && 
        t.status !== 'completed'
      ).length;

      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const timeSpent = projectSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      // Calculate efficiency based on estimated vs actual time
      const tasksWithEstimates = projectTasks.filter(t => t.estimated_duration && t.actual_duration);
      const efficiency = tasksWithEstimates.length > 0
        ? tasksWithEstimates.reduce((sum, t) => 
            sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0
          ) / tasksWithEstimates.length * 100
        : 100;

      // Build task hierarchy
      const mainTasks = this.buildTaskHierarchy(projectTasks.filter(t => t.task_level === 1));
      
      return {
        ...project,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        completionRate,
        timeSpent,
        efficiency,
        mainTasks,
        allTasks: projectTasks
      };
    });
  }

  private buildTaskHierarchy(tasks: any[]): TaskHierarchy[] {
    // Group tasks by level and parent
    const mainTasks = tasks.filter(t => t.task_level === 1 || !t.parent_task_id);
    const subtasks = tasks.filter(t => t.task_level === 2);
    const microtasks = tasks.filter(t => t.task_level === 3);

    // Build hierarchy
    return mainTasks.map(mainTask => {
      const taskSubtasks = subtasks
        .filter(st => st.parent_task_id === mainTask.id)
        .map(subtask => ({
          ...subtask,
          microtasks: microtasks.filter(mt => mt.parent_task_id === subtask.id)
        }));

      return {
        ...mainTask,
        subtasks: taskSubtasks
      };
    });
  }

  private calculatePeriodData(periodTasks: any[], periodSessions: any[]) {
    const tasksCompleted = periodTasks.filter(t => t.status === 'completed').length;
    const tasksCreated = periodTasks.filter(t => 
      new Date(t.created_at) >= new Date(periodTasks[0]?.created_at || new Date())
    ).length;
    const timeWorked = periodSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const sessionsCount = periodSessions.length;
    const avgProductivity = sessionsCount > 0
      ? periodSessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessionsCount
      : 0;
    const projectsWorkedOn = new Set(
      periodTasks
        .filter(t => t.project_id)
        .map(t => t.project_id)
    ).size;

    return {
      tasksCompleted,
      tasksCreated,
      timeWorked,
      sessionsCount,
      avgProductivity,
      projectsWorkedOn
    };
  }

  private generateInsights(periodTasks: any[], periodSessions: any[], projects: ProjectAnalysis[]) {
    const completedTasks = periodTasks.filter(t => t.status === 'completed');
    const avgTaskDuration = completedTasks.length > 0
      ? completedTasks.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedTasks.length
      : 0;

    const completionRate = periodTasks.length > 0
      ? (completedTasks.length / periodTasks.length) * 100
      : 0;

    // Find most productive project
    const mostProductiveProject = projects
      .filter(p => p.timeSpent > 0)
      .sort((a, b) => b.timeSpent - a.timeSpent)[0]?.name;

    const efficiency = this.calculateEfficiency(completedTasks);

    // Calculate trends
    const totalDays = differenceInDays(new Date(), new Date(periodTasks[0]?.created_at || new Date())) || 7;
    const tasksPerDay = completedTasks.length / totalDays;
    const hoursPerDay = periodSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60 / totalDays;

    return {
      mostProductiveProject,
      avgTaskDuration,
      completionRate,
      efficiency,
      trends: {
        tasksPerDay,
        hoursPerDay,
        productivityTrend: 'stable' as const // TODO: Calculate actual trend
      }
    };
  }

  private calculateEfficiency(completedTasks: any[]): number {
    const tasksWithEstimates = completedTasks.filter(t => t.estimated_duration && t.actual_duration);
    if (tasksWithEstimates.length === 0) return 100;

    return tasksWithEstimates.reduce((sum, t) => 
      sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0
    ) / tasksWithEstimates.length * 100;
  }

  /**
   * Consolida todas las tareas con información completa del proyecto
   */
  private consolidateAllTasks(allTasks: any[], allProjects: any[]) {
    const projectMap = new Map(allProjects.map(p => [p.id, p]));
    
    return allTasks.map(task => ({
      id: task.id,
      title: task.title || 'Sin título',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      project_name: projectMap.get(task.project_id)?.name || 'Sin proyecto',
      project_id: task.project_id,
      completed_at: task.completed_at,
      actual_duration: task.actual_duration,
      estimated_duration: task.estimated_duration,
      created_at: task.created_at,
      updated_at: task.updated_at
    }));
  }

  private enrichSessions(sessions: any[], tasks: any[]): WorkSession[] {
    return sessions.map(session => ({
      ...session,
      task: session.task_id 
        ? tasks.find(t => t.id === session.task_id)
        : undefined
    }));
  }

  private async generateComparison(period: any, currentData: any) {
    // Get previous period data for comparison
    const prevStart = period.type === 'weekly' 
      ? startOfWeek(subWeeks(period.start, 1))
      : startOfMonth(subMonths(period.start, 1));
    const prevEnd = period.type === 'weekly'
      ? endOfWeek(subWeeks(period.start, 1))
      : endOfMonth(subMonths(period.start, 1));

    const [prevTasks, prevSessions] = await Promise.all([
      this.fetchPeriodTasks(prevStart, prevEnd),
      this.fetchPeriodSessions(prevStart, prevEnd)
    ]);

    const prevData = this.calculatePeriodData(prevTasks, prevSessions);

    return {
      previousPeriod: {
        tasksCompleted: prevData.tasksCompleted,
        timeWorked: prevData.timeWorked,
        productivity: prevData.avgProductivity
      },
      changes: {
        tasksChange: currentData.tasksCompleted - prevData.tasksCompleted,
        timeChange: currentData.timeWorked - prevData.timeWorked,
        productivityChange: currentData.avgProductivity - prevData.avgProductivity
      }
    };
  }
}