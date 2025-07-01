
export { useAIContext } from './useAIContext';
export { useInsightGeneration } from './useInsightGeneration';
export { useProactiveNotifications } from './useProactiveNotifications';
export { createManualContext } from '@/utils/ai/contextConfig';
export type { AIContextConfig, ExtendedAIContext } from '@/types/ai-context';
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

export { useAITesting } from './useAITesting';

// NUEVO: Exportar tipos de contexto real
export type { AIContext } from '@/types/ai-context-advanced';
