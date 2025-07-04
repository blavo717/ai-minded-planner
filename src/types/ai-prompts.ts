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

export interface AIAnalysisResult {
  type: 'productivity' | 'planning' | 'project' | 'task' | 'general';
  confidence: number;
  insights: string[];
  recommendations: string[];
  nextActions: string[];
  warnings?: string[];
  estimatedTime?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ProductivityAnalysis extends AIAnalysisResult {
  type: 'productivity';
  metrics: {
    dailyScore: number;
    weeklyTrend: 'improving' | 'stable' | 'declining';
    blockers: string[];
    opportunities: string[];
    workPattern: 'productive' | 'moderate' | 'low' | 'inactive';
  };
  timeRecommendations: {
    bestHours: number[];
    breakSuggestions: string[];
    focusBlocks: string[];
  };
}

export interface PlanningAnalysis extends AIAnalysisResult {
  type: 'planning';
  primaryRecommendation: {
    action: string;
    reason: string;
    estimatedTime: number;
    priority: 'urgent' | 'high' | 'medium' | 'low';
  };
  alternatives: Array<{
    action: string;
    reason: string;
    estimatedTime: number;
  }>;
  contextFactors: {
    energyLevel: 'high' | 'medium' | 'low';
    availableTime: number;
    currentMomentum: boolean;
  };
}

export interface ProjectAnalysis extends AIAnalysisResult {
  type: 'project';
  projectHealth: Array<{
    projectId: string;
    name: string;
    status: 'healthy' | 'at_risk' | 'stalled' | 'critical';
    riskFactors: string[];
    recommendations: string[];
  }>;
  portfolioMetrics: {
    overallHealth: number;
    distributionBalance: number;
    urgentProjects: number;
  };
}

export interface TaskAnalysis extends AIAnalysisResult {
  type: 'task';
  taskStatus: {
    currentState: string;
    progressPercentage: number;
    blockers: string[];
    dependencies: string[];
  };
  workEstimation: {
    remainingTime: number;
    complexity: 'low' | 'medium' | 'high';
    requiredResources: string[];
  };
  optimizationSuggestions: string[];
}