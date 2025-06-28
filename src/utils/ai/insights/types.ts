
import { AIInsight, InsightGenerationConfig, UserContext, InsightGenerationResult } from '@/types/ai-insights';
import { PatternAnalysisResult } from '@/types/ai-patterns';

export interface InsightGenerationContext {
  analysis: PatternAnalysisResult;
  userContext: UserContext;
  existingInsights: AIInsight[];
}

export interface InsightGeneratorResult {
  insights: AIInsight[];
  patternsUsed: string[];
}

export interface InsightGenerator {
  generateInsights(context: InsightGenerationContext): InsightGeneratorResult;
}
