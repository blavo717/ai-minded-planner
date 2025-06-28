
import { SmartPromptContext } from '@/types/ai-prompts';

export interface AIContextConfig {
  enableRealtimeUpdates?: boolean;
  contextRefreshInterval?: number; // en segundos
  includeProductivityMetrics?: boolean;
  includeWorkPatterns?: boolean;
  maxRecentTasks?: number;
  maxRecentProjects?: number;
}

export interface ExtendedAIContext extends SmartPromptContext {
  productivity?: {
    weeklyScore: number;
    trendsData: any[];
    completionRate: number;
    averageTaskDuration: number;
  };
  workPatterns?: {
    mostProductiveHours: number[];
    preferredWorkDays: string[];
    averageSessionLength: number;
    peakPerformanceTimes: string[];
  };
  recentTasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    updated_at: string;
  }>;
  recentProjects: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
  }>;
}
