
export * from './ai-context';
export * from './ai-prompts';

export interface AdvancedContextMetrics {
  contextProcessingTime: number;
  analysisAccuracy: number;
  recommendationRelevance: number;
  cacheEfficiency: number;
}

export interface ContextInsight {
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  confidence: number;
  actionRequired: boolean;
  suggestedActions?: string[];
}

export interface SmartContextSuggestion {
  id: string;
  type: 'task' | 'project' | 'process' | 'break';
  title: string;
  description: string;
  priority: number;
  estimatedTime: number;
  benefits: string[];
}

export interface ContextTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
}
