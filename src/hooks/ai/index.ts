export { useAIContext, useSimpleAIContext } from './useAIContext';
export { useInsightGeneration } from './useInsightGeneration';
export { useProactiveNotifications } from './useProactiveNotifications';
export { createManualContext } from '@/utils/ai/contextConfig';
export type { AIContextConfig, ExtendedAIContext } from '@/types/ai-context';
export type { AIInsight, InsightGenerationConfig, UserContext } from '@/types/ai-insights';
export type { ProactiveNotification, NotificationConfig } from '@/types/proactive-notifications';
export { useContextualDataCollector } from './useContextualDataCollector';
export { defaultContextualDataCollector } from '@/utils/ai/ContextualDataCollector';
export type { 
  ContextualData, 
  ContextualDataConfig, 
  DataAggregationResult, 
  ContextualDataQuery,
  DataCollectionRule,
  DataTrend 
} from '@/types/contextual-data';

export { usePhase6Advanced } from './usePhase6Advanced';
export type {
  AdvancedContext,
  ContextualRecommendation,
  AdvancedContextConfig
} from '@/utils/ai/AdvancedContextEngine';
export type {
  ActionableRecommendation,
  RecommendationFeedback,
  SmartRecommendationConfig
} from '@/utils/ai/SmartRecommendationEngine';
