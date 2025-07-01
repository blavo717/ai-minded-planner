
import { ActionableRecommendation } from '@/utils/ai/SmartRecommendationEngine';
import { Task } from '@/hooks/useTasks';

export interface IntelligentAction {
  id: string;
  type: 'create_subtask' | 'create_reminder' | 'draft_email';
  label: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  suggestedData: {
    title?: string;
    content?: string;
    scheduledFor?: Date;
    language?: 'es' | 'en';
    estimatedDuration?: number;
    reminderType?: string;
    emailType?: 'followup' | 'update' | 'request';
  };
  basedOnPatterns: string[];
  recommendation?: ActionableRecommendation;
}

export interface IntelligentActionContext {
  task: Task;
  nextSteps: string;
  statusSummary: string;
  userPatterns: UserPattern[];
  recentActivity: ActivityItem[];
  productivityScore: number;
}

export interface UserPattern {
  type: string;
  preferredTime?: string;
  frequency?: string;
  preferredLanguage?: 'es' | 'en';
  tone?: 'professional' | 'friendly' | 'formal';
  peakHours?: number[];
  workingHours?: [number, number];
  averageTaskDuration?: number;
  multitaskingTendency?: number;
  procrastinationPatterns?: { trigger: string; frequency: number; }[];
  motivationalFactors?: string[];
}

export interface ActivityItem {
  type: string;
  timestamp: Date;
  context?: any;
}

export interface UserBehaviorProfile {
  workingHours: [number, number];
  peakProductivityHours: number[];
  preferredTaskTypes: string[];
  averageTaskDuration: number;
  multitaskingTendency: number;
  procrastinationPatterns: { trigger: string; frequency: number; }[];
  motivationalFactors: string[];
  recentActivity: ActivityItem[];
  currentProductivityScore: number;
}

export interface DraftEmailContent {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal';
  language: 'es' | 'en';
  confidence: number;
}
