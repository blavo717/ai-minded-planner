
import { SmartPromptContext } from '@/types/ai-prompts';
import { ProductivityMetrics, WorkPattern } from '@/hooks/useAnalytics';

export const generateUserContext = (user: any, generalStats: any): SmartPromptContext['userInfo'] => {
  if (!user || !generalStats) {
    return {
      id: '',
      hasActiveTasks: false,
      hasActiveProjects: false,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
    };
  }

  return {
    id: user.id,
    hasActiveTasks: (generalStats.pendingTasks || 0) > 0,
    hasActiveProjects: (generalStats.activeProjects || 0) > 0,
    totalTasks: generalStats.totalTasks || 0,
    completedTasks: generalStats.completedTasks || 0,
    pendingTasks: generalStats.pendingTasks || 0,
  };
};

export const generateSessionContext = (): SmartPromptContext['currentSession'] => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.toLocaleDateString('es-ES', { weekday: 'long' });
  
  let timeOfDay: SmartPromptContext['currentSession']['timeOfDay'];
  if (hour >= 6 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  return {
    timeOfDay,
    dayOfWeek,
    isWeekend: [0, 6].includes(now.getDay()),
  };
};

export const generateRecentActivity = (mainTasks: any[]): SmartPromptContext['recentActivity'] => {
  if (!mainTasks.length) {
    return {
      recentCompletions: 0,
      workPattern: 'inactive',
    };
  }

  const now = new Date();
  const today = now.toDateString();

  // Tareas completadas hoy
  const completedToday = mainTasks.filter(task => 
    task.status === 'completed' && 
    task.completed_at && 
    new Date(task.completed_at).toDateString() === today
  ).length;

  // Última actualización de tarea
  const lastTaskUpdate = mainTasks.length > 0 ? 
    new Date(Math.max(...mainTasks.map(t => new Date(t.updated_at).getTime()))) : 
    undefined;

  // Determinar patrón de trabajo
  let workPattern: SmartPromptContext['recentActivity']['workPattern'] = 'inactive';
  if (completedToday >= 5) workPattern = 'productive';
  else if (completedToday >= 3) workPattern = 'moderate';
  else if (completedToday >= 1) workPattern = 'low';

  return {
    lastTaskUpdate,
    recentCompletions: completedToday,
    workPattern,
  };
};

export const generateProductivityContext = (
  productivityMetrics: ProductivityMetrics | undefined,
  includeMetrics: boolean
) => {
  if (!includeMetrics || !productivityMetrics) return undefined;

  return {
    weeklyScore: productivityMetrics.completionRate || 0,
    trendsData: [], // Simplificado ya que 'trends' no existe en el tipo
    completionRate: productivityMetrics.completionRate || 0,
    averageTaskDuration: productivityMetrics.averageTaskTime || 0,
  };
};

export const generateWorkPatternsContext = (
  workPatterns: WorkPattern[] | undefined,
  includePatterns: boolean
) => {
  if (!includePatterns || !workPatterns || !Array.isArray(workPatterns)) return undefined;

  // Procesar el array de WorkPattern para extraer patrones útiles
  const mostProductiveHours = workPatterns
    .sort((a, b) => b.productivity_score - a.productivity_score)
    .slice(0, 3)
    .map(pattern => pattern.hour);

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const preferredWorkDays = workPatterns
    .sort((a, b) => b.tasks_completed - a.tasks_completed)
    .slice(0, 3)
    .map(pattern => dayNames[pattern.day_of_week]);

  const totalSessions = workPatterns.reduce((sum, pattern) => sum + pattern.total_sessions, 0);
  const averageSessionLength = totalSessions > 0 ? 
    workPatterns.reduce((sum, pattern) => sum + pattern.total_sessions, 0) / workPatterns.length : 0;

  const peakPerformanceTimes = mostProductiveHours.map(hour => 
    `${hour}:00 - ${hour + 1}:00`
  );

  return {
    mostProductiveHours,
    preferredWorkDays,
    averageSessionLength,
    peakPerformanceTimes,
  };
};
