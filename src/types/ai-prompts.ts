
export interface SmartPromptContext {
  userInfo: {
    id: string;
    hasActiveTasks: boolean;
    hasActiveProjects: boolean;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  };
  currentSession: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    isWeekend: boolean;
  };
  recentActivity: {
    lastTaskUpdate?: Date;
    recentCompletions: number;
    workPattern: 'productive' | 'moderate' | 'low' | 'inactive';
  };
}

export interface SmartPromptOptions {
  type: 'general' | 'task-focused' | 'project-planning' | 'productivity-analysis' | 'quick-help';
  includeData?: boolean;
  maxDataPoints?: number;
  tone?: 'professional' | 'friendly' | 'motivational' | 'analytical';
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  contextRequirements: string[];
}

export interface GeneratedPrompt {
  content: string;
  context: SmartPromptContext;
  options: SmartPromptOptions;
  timestamp: Date;
  tokens?: number;
}
