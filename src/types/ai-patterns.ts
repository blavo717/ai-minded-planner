
export interface WorkPattern {
  id: string;
  type: 'temporal' | 'task_type' | 'duration' | 'productivity' | 'blockage';
  confidence: number; // 0-1
  frequency: number; // cuántas veces se ha observado
  data: Record<string, any>;
  insights: string[];
  createdAt: Date;
  lastObserved: Date;
}

export interface TemporalPattern extends WorkPattern {
  type: 'temporal';
  data: {
    hour: number;
    dayOfWeek: number;
    productivity_score: number;
    tasks_completed: number;
    average_duration: number;
  };
}

export interface TaskTypePattern extends WorkPattern {
  type: 'task_type';
  data: {
    task_priority: string;
    task_category: string;
    completion_rate: number;
    average_completion_time: number;
    common_blockers: string[];
  };
}

export interface DurationPattern extends WorkPattern {
  type: 'duration';
  data: {
    task_type: string;
    estimated_vs_actual: number; // ratio
    optimal_duration_range: [number, number]; // min, max minutes
    productivity_correlation: number;
  };
}

export interface ProductivityPattern extends WorkPattern {
  type: 'productivity';
  data: {
    context: string; // e.g., 'morning', 'after_break', 'monday'
    productivity_score: number;
    tasks_completed: number;
    quality_indicators: Record<string, number>;
  };
}

export interface BlockagePattern extends WorkPattern {
  type: 'blockage';
  data: {
    common_blockers: string[];
    average_block_duration: number; // minutes
    resolution_patterns: string[];
    prevention_suggestions: string[];
  };
}

export interface PatternAnalysisResult {
  patterns: WorkPattern[];
  insights: PatternInsight[];
  recommendations: PatternRecommendation[];
  confidence: number;
  dataQuality: 'low' | 'medium' | 'high';
}

export interface PatternInsight {
  type: 'positive' | 'negative' | 'neutral' | 'opportunity';
  title: string;
  description: string;
  pattern_ids: string[];
  priority: 1 | 2 | 3;
  actionable: boolean;
}

export interface PatternRecommendation {
  id: string;
  type: 'timing' | 'task_management' | 'productivity' | 'process_improvement';
  title: string;
  description: string;
  expectedImpact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  basedOnPatterns: string[];
}

export interface PatternAnalysisConfig {
  minDataPoints: number;
  confidenceThreshold: number;
  analysisWindowDays: number;
  enableTemporalAnalysis: boolean;
  enableTaskTypeAnalysis: boolean;
  enableDurationAnalysis: boolean;
  enableProductivityAnalysis: boolean;
  enableBlockageDetection: boolean;
}
