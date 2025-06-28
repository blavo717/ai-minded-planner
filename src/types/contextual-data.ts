
export interface ContextualData {
  id: string;
  type: 'user_behavior' | 'task_patterns' | 'productivity_metrics' | 'environmental' | 'temporal';
  category: 'real_time' | 'historical' | 'predictive';
  data: Record<string, any>;
  timestamp: Date;
  relevanceScore: number; // 0-1
  expiresAt?: Date;
  source: string;
  metadata: {
    collectionMethod: 'automatic' | 'manual' | 'inferred';
    confidence: number;
    dataSources: string[];
    processingTime?: number;
  };
}

export interface DataCollectionRule {
  id: string;
  name: string;
  type: ContextualData['type'];
  isActive: boolean;
  frequency: 'real_time' | 'periodic' | 'on_demand';
  interval?: number; // milliseconds for periodic
  conditions: DataCollectionCondition[];
  priority: 1 | 2 | 3;
  maxDataPoints: number;
  retentionHours: number;
  createdAt: Date;
}

export interface DataCollectionCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface ContextualDataConfig {
  enableUserBehaviorTracking: boolean;
  enableTaskPatternTracking: boolean;
  enableProductivityMetrics: boolean;
  enableEnvironmentalData: boolean;
  enableTemporalData: boolean;
  maxDataPointsPerType: number;
  defaultRetentionHours: number;
  minRelevanceScore: number;
  aggregationInterval: number; // minutes
}

export interface DataAggregationResult {
  type: ContextualData['type'];
  aggregatedData: Record<string, any>;
  dataPoints: number;
  timeRange: {
    start: Date;
    end: Date;
  };
  confidence: number;
  trends: DataTrend[];
}

export interface DataTrend {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number; // percentage change
  confidence: number;
  timespan: number; // hours
}

export interface ContextualDataQuery {
  types?: ContextualData['type'][];
  categories?: ContextualData['category'][];
  timeRange?: {
    start: Date;
    end: Date;
  };
  minRelevanceScore?: number;
  limit?: number;
  orderBy?: 'timestamp' | 'relevanceScore';
  orderDirection?: 'asc' | 'desc';
}
