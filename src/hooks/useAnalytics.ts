
import { useProductivityMetrics } from './analytics/useProductivityMetrics';
import { useTimeDistribution } from './analytics/useTimeDistribution';
import { useProjectPerformance } from './analytics/useProjectPerformance';
import { useWorkPatterns } from './analytics/useWorkPatterns';

export interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalWorkTime: number;
  averageTaskTime: number;
  efficiency: number;
  productivity: number;
  trend: 'up' | 'down' | 'stable';
  previousPeriodComparison: number;
  hasSessionData: boolean;
}

export interface TimeDistribution {
  date: string;
  work_time: number;
  tasks_completed: number;
  productivity_score: number;
}

export interface ProjectPerformance {
  project_id: string;
  project_name: string;
  tasks_completed: number;
  total_time: number;
  efficiency: number;
  completion_rate: number;
}

export interface WorkPattern {
  hour: number;
  day_of_week: number;
  productivity_score: number;
  tasks_completed: number;
  total_sessions: number;
}

export const useAnalytics = () => {
  return {
    getProductivityMetrics: useProductivityMetrics,
    getTimeDistribution: useTimeDistribution,
    getProjectPerformance: useProjectPerformance,
    getWorkPatterns: useWorkPatterns,
    isLoading: false,
  };
};
