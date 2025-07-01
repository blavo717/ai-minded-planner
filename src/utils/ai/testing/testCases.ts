
import { usePhase6Advanced } from '@/hooks/ai/usePhase6Advanced';
import { useInsightGeneration } from '@/hooks/ai/useInsightGeneration';
import { useContextualDataCollector } from '@/hooks/ai/useContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';

export interface TestCase {
  id: string;
  name: string;
  category: 'integration' | 'performance' | 'data' | 'functionality';
  priority: 'high' | 'medium' | 'low';
  test: () => Promise<any>;
}

export const createTestCases = (
  phase6: ReturnType<typeof usePhase6Advanced>,
  insights: ReturnType<typeof useInsightGeneration>,
  contextualData: ReturnType<typeof useContextualDataCollector>,
  tasks: ReturnType<typeof useTasks>['tasks']
): TestCase[] => [
  {
    id: 'phase6-basic-functionality',
    name: 'Funcionalidad Básica Fase 6',
    category: 'functionality',
    priority: 'high',
    test: async () => {
      const hasAdvancedContext = !!phase6.advancedContext;
      const hasRecommendations = phase6.smartRecommendations.length > 0;
      const hasInsights = insights.insights.length > 0;
      
      return {
        advancedContextAvailable: hasAdvancedContext,
        recommendationsGenerated: hasRecommendations,
        insightsGenerated: hasInsights,
        contextualDataCollected: contextualData.contextualData.length > 0
      };
    }
  },
  {
    id: 'context-generation-speed',
    name: 'Velocidad de Generación de Contexto',
    category: 'performance',
    priority: 'high',
    test: async () => {
      const startTime = performance.now();
      
      if (!phase6.isGeneratingContext) {
        phase6.generateContext();
        
        let attempts = 0;
        while (phase6.isGeneratingContext && attempts < 100) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      return {
        generationTime: duration,
        isAcceptable: duration < 5000,
        contextGenerated: !!phase6.advancedContext
      };
    }
  },
  {
    id: 'data-consistency-check',
    name: 'Verificación de Consistencia de Datos',
    category: 'data',
    priority: 'high',
    test: async () => {
      const contextData = contextualData.contextualData;
      const tasksData = tasks;
      const insightsData = insights.insights;
      
      const validContextData = contextData.every(item => 
        item.id && item.type && item.data && item.timestamp
      );
      
      const validTasks = tasksData.every(task => 
        task.id && task.title && task.status
      );
      
      const validInsights = insightsData.every(insight =>
        insight.id && insight.title
      );
      
      return {
        contextDataValid: validContextData,
        tasksDataValid: validTasks,
        insightsDataValid: validInsights,
        totalDataPoints: {
          contextData: contextData.length,
          tasks: tasksData.length,
          insights: insightsData.length
        }
      };
    }
  },
  {
    id: 'integration-flow-test',
    name: 'Flujo de Integración Completo',
    category: 'integration',
    priority: 'high',
    test: async () => {
      let step = 1;
      const results: Record<string, any> = {};
      
      try {
        results.step1 = { name: 'Recolección de datos' };
        if (contextualData.contextualData.length === 0) {
          await contextualData.collectData();
        }
        results.step1.success = contextualData.contextualData.length > 0;
        step++;
        
        results.step2 = { name: 'Generación de insights' };
        if (insights.insights.length === 0) {
          await insights.generateInsights();
        }
        results.step2.success = insights.insights.length > 0;
        step++;
        
        results.step3 = { name: 'Contexto avanzado' };
        if (!phase6.advancedContext) {
          await phase6.updateFullAnalysis();
        }
        results.step3.success = !!phase6.advancedContext;
        step++;
        
        results.step4 = { name: 'Recomendaciones inteligentes' };
        results.step4.success = phase6.smartRecommendations.length > 0;
        
        return {
          completedSteps: step,
          totalSteps: 4,
          stepResults: results,
          integrationSuccessful: step === 4 && results.step4.success
        };
        
      } catch (error) {
        return {
          completedSteps: step - 1,
          totalSteps: 4,
          stepResults: results,
          error: error instanceof Error ? error.message : 'Unknown error',
          integrationSuccessful: false
        };
      }
    }
  },
  {
    id: 'memory-usage-test',
    name: 'Prueba de Uso de Memoria',
    category: 'performance',
    priority: 'medium',
    test: async () => {
      const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
      
      await phase6.updateFullAnalysis();
      await insights.generateInsights();
      await contextualData.collectData();
      
      const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = memoryAfter - memoryBefore;
      
      if ((window as any).gc) {
        (window as any).gc();
      }
      
      const memoryAfterGC = (performance as any).memory?.usedJSHeapSize || 0;
      
      return {
        memoryBefore: Math.round(memoryBefore / 1024 / 1024 * 100) / 100,
        memoryAfter: Math.round(memoryAfter / 1024 / 1024 * 100) / 100,
        memoryIncrease: Math.round(memoryIncrease / 1024 / 1024 * 100) / 100,
        memoryAfterGC: Math.round(memoryAfterGC / 1024 / 1024 * 100) / 100,
        memoryLeakSuspected: memoryIncrease > 50 * 1024 * 1024,
        isHealthy: memoryIncrease < 20 * 1024 * 1024
      };
    }
  }
];
