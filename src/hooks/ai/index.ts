// =============================================================================
// HOOKS AI - INDEX OPTIMIZADO
// Organizados por categoría para evitar imports circulares
// =============================================================================

// CORE HOOKS - Base functionality
export { useAIContext } from './useAIContext';
export { useContextualData } from './useContextualData';

// INSIGHT HOOKS - Analytics and insights
export { useInsightGeneration } from './useInsightGeneration';
export { useProactiveNotifications } from './useProactiveNotifications';

// CONTEXTUAL DATA HOOKS - Data collection
export { useContextualDataCollector } from './useContextualDataCollector';

// PHASE 6 ADVANCED HOOKS - Advanced features
export { usePhase6Advanced } from './usePhase6Advanced';

// TESTING HOOKS - Development only
export { useAITesting } from './useAITesting';

// =============================================================================
// TYPES - Organized by domain
// =============================================================================

// Core AI Context Types
export type { AIContextConfig, ExtendedAIContext } from '@/types/ai-context';
export type { AIContext } from '@/types/ai-context-advanced';

// Insight Types
export type { AIInsight, InsightGenerationConfig, UserContext } from '@/types/ai-insights';

// Notification Types
export type { ProactiveNotification, NotificationConfig } from '@/types/proactive-notifications';

// Contextual Data Types
export type { 
  ContextualData, 
  ContextualDataConfig, 
  DataAggregationResult, 
  ContextualDataQuery,
  DataCollectionRule,
  DataTrend 
} from '@/types/contextual-data';

// Advanced Context Types
export type {
  AdvancedContext,
  ContextualRecommendation,
  AdvancedContextConfig
} from '@/utils/ai/AdvancedContextEngine';

// Recommendation Types
export type {
  ActionableRecommendation,
  RecommendationFeedback,
  SmartRecommendationConfig
} from '@/utils/ai/SmartRecommendationEngine';

// =============================================================================
// UTILITIES - Re-exports (careful with circular dependencies)
// =============================================================================

// Context utilities
export { createManualContext } from '@/utils/ai/contextConfig';

// Data collection utilities
export { defaultContextualDataCollector } from '@/utils/ai/ContextualDataCollector';

// =============================================================================
// NOTES:
// - Removed cross-imports between hooks and utils where possible
// - Grouped exports by functionality
// - Types are clearly separated from implementations
// - Utilities are re-exported only when safe
// =============================================================================