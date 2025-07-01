
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
  };
  basedOnPatterns: string[];
  recommendation?: ActionableRecommendation;
}

export interface IntelligentActionContext {
  task: Task;
  nextSteps: string;
  statusSummary: string;
  userPatterns: any[];
  recentActivity: any[];
  productivityScore: number;
}

export interface DraftEmailContent {
  subject: string;
  body: string;
  tone: 'professional' | 'friendly' | 'formal';
  language: 'es' | 'en';
  confidence: number;
}
