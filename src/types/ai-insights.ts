
export interface AIInsight {
  id: string;
  type: 'productivity' | 'task_management' | 'timing' | 'health' | 'recommendation';
  category: 'positive' | 'warning' | 'critical' | 'suggestion' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
  priority: 1 | 2 | 3; // 1 = alta, 2 = media, 3 = baja
  confidence: number; // 0-1
  data?: Record<string, any>;
  actions?: InsightAction[];
  expiresAt?: Date;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
}

export interface InsightAction {
  id: string;
  label: string;
  type: 'navigate' | 'execute' | 'external';
  target?: string;
  handler?: () => void;
}

export interface InsightGenerationConfig {
  enableProductivityInsights: boolean;
  enableTaskHealthInsights: boolean;
  enableTimingInsights: boolean;
  enableRecommendations: boolean;
  minConfidenceThreshold: number;
  maxInsightsPerSession: number;
  insightLifespanHours: number;
}

export interface UserContext {
  currentTime: Date;
  currentTasks: any[];
  recentActivity: any[];
  workingHours?: [number, number]; // [start, end] in hours
  timeZone?: string;
  preferences?: Record<string, any>;
}

export interface InsightGenerationResult {
  insights: AIInsight[];
  meta: {
    totalGenerated: number;
    confidence: number;
    processingTime: number;
    patternsUsed: string[];
  };
}
