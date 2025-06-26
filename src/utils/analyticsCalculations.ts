
import { subDays, subWeeks, subMonths, subYears } from 'date-fns';

export const getDateRange = (period: 'week' | 'month' | 'quarter' | 'year') => {
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;

  switch (period) {
    case 'week':
      startDate = subWeeks(now, 1);
      previousStartDate = subWeeks(startDate, 1);
      break;
    case 'month':
      startDate = subMonths(now, 1);
      previousStartDate = subMonths(startDate, 1);
      break;
    case 'quarter':
      startDate = subMonths(now, 3);
      previousStartDate = subMonths(startDate, 3);
      break;
    case 'year':
      startDate = subYears(now, 1);
      previousStartDate = subYears(startDate, 1);
      break;
  }

  return { startDate, previousStartDate, now };
};

export const calculateProductivityMetrics = (
  tasks: any[],
  sessions: any[],
  completedTasks: any[],
  previousCompletedTasks: any[]
) => {
  const totalTasksInSystem = tasks.length;
  const completedTasksCount = completedTasks.length;
  const hasSessionData = sessions.length > 0;
  
  // Basic metrics
  const completionRate = totalTasksInSystem > 0 ? (completedTasksCount / totalTasksInSystem) * 100 : 0;
  const totalWorkTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const averageTaskTime = completedTasksCount > 0 && hasSessionData ? totalWorkTime / completedTasksCount : 0;

  // Efficiency calculation
  const tasksWithEstimate = completedTasks.filter(t => 
    t.estimated_duration && 
    t.actual_duration && 
    t.actual_duration > 0 &&
    t.estimated_duration > 0
  );
  const efficiency = tasksWithEstimate.length > 0 
    ? Math.min(tasksWithEstimate.reduce((sum, t) => 
        sum + (t.estimated_duration! / t.actual_duration!), 0) / tasksWithEstimate.length * 100, 200)
    : 0;

  // Productivity calculation
  const productivitySessions = sessions.filter(s => s.productivity_score && s.productivity_score > 0);
  const productivity = productivitySessions.length > 0
    ? productivitySessions.reduce((sum, s) => sum + s.productivity_score!, 0) / productivitySessions.length
    : 0;

  // Trend calculation
  const previousCompletedTasksCount = previousCompletedTasks.length;
  const previousPeriodComparison = previousCompletedTasksCount > 0 
    ? ((completedTasksCount - previousCompletedTasksCount) / previousCompletedTasksCount) * 100 
    : completedTasksCount > 0 ? 100 : 0;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (previousPeriodComparison > 10) trend = 'up';
  else if (previousPeriodComparison < -10) trend = 'down';

  return {
    totalTasks: totalTasksInSystem,
    completedTasks: completedTasksCount,
    completionRate: isNaN(completionRate) ? 0 : completionRate,
    totalWorkTime: isNaN(totalWorkTime) ? 0 : totalWorkTime,
    averageTaskTime: isNaN(averageTaskTime) ? 0 : averageTaskTime,
    efficiency: isNaN(efficiency) ? 0 : efficiency,
    productivity: isNaN(productivity) ? 0 : productivity,
    trend,
    previousPeriodComparison: isNaN(previousPeriodComparison) ? 0 : previousPeriodComparison,
    hasSessionData,
  };
};

export const sanitizeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};
