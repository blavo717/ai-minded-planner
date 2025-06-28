
import { AIContextConfig } from '@/types/ai-context';
import { SmartPromptContext } from '@/types/ai-prompts';

export const DEFAULT_AI_CONTEXT_CONFIG: AIContextConfig = {
  enableRealtimeUpdates: true,
  contextRefreshInterval: 300, // 5 minutos
  includeProductivityMetrics: true,
  includeWorkPatterns: true,
  maxRecentTasks: 10,
  maxRecentProjects: 5,
};

export const createManualContext = (overrides: Partial<SmartPromptContext> = {}): SmartPromptContext => {
  const now = new Date();
  const hour = now.getHours();
  
  let timeOfDay: SmartPromptContext['currentSession']['timeOfDay'];
  if (hour >= 6 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';

  const defaultContext: SmartPromptContext = {
    userInfo: {
      id: '',
      hasActiveTasks: false,
      hasActiveProjects: false,
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
    },
    currentSession: {
      timeOfDay,
      dayOfWeek: now.toLocaleDateString('es-ES', { weekday: 'long' }),
      isWeekend: [0, 6].includes(now.getDay()),
    },
    recentActivity: {
      recentCompletions: 0,
      workPattern: 'inactive',
    },
  };

  return { ...defaultContext, ...overrides };
};
