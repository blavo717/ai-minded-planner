
import { useState, useCallback } from 'react';
import { usePhase6Advanced } from './usePhase6Advanced';
import { useInsightGeneration } from './useInsightGeneration';
import { useContextualDataCollector } from './useContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

interface TestCase {
  id: string;
  name: string;
  category: 'integration' | 'performance' | 'data' | 'functionality';
  priority: 'high' | 'medium' | 'low';
  test: () => Promise<any>;
}

interface TestResult {
  testId: string;
  success: boolean;
  duration: number;
  result?: any;
  error?: string;
  timestamp: Date;
}

interface TestSuiteResult {
  totalTests: number;
  successCount: number;
  failureCount: number;
  totalDuration: number;
  results: TestResult[];
}

export const useAITesting = () => {
  const { toast } = useToast();
  const { tasks } = useTasks();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const phase6 = usePhase6Advanced();
  const insights = useInsightGeneration();
  const contextualData = useContextualDataCollector();

  // Test Cases Definitions
  const testCases: TestCase[] = [
    {
      id: 'phase6-basic-functionality',
      name: 'Funcionalidad Básica Fase 6',
      category: 'functionality',
      priority: 'high',
      test: async () => {
        // Verificar que los componentes principales estén funcionando
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
          
          // Esperar hasta que termine la generación o timeout
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
          isAcceptable: duration < 5000, // Menos de 5 segundos
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
        
        // Verificar que los datos tengan estructura correcta
        const validContextData = contextData.every(item => 
          item.id && item.type && item.data && item.timestamp
        );
        
        const validTasks = tasksData.every(task => 
          task.id && task.title && task.status
        );
        
        const validInsights = insightsData.every(insight =>
          insight.id && insight.title && insight.category
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
        // Test completo del flujo: recolección -> análisis -> contexto -> recomendaciones
        let step = 1;
        const results: Record<string, any> = {};
        
        try {
          // Paso 1: Recolectar datos contextuales
          results.step1 = { name: 'Recolección de datos' };
          if (contextualData.contextualData.length === 0) {
            await contextualData.collectData();
          }
          results.step1.success = contextualData.contextualData.length > 0;
          step++;
          
          // Paso 2: Generar insights
          results.step2 = { name: 'Generación de insights' };
          if (insights.insights.length === 0) {
            await insights.generateInsights(true);
          }
          results.step2.success = insights.insights.length > 0;
          step++;
          
          // Paso 3: Generar contexto avanzado
          results.step3 = { name: 'Contexto avanzado' };
          if (!phase6.advancedContext) {
            await phase6.updateFullAnalysis();
          }
          results.step3.success = !!phase6.advancedContext;
          step++;
          
          // Paso 4: Verificar recomendaciones
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
        
        // Realizar operaciones que consumen memoria
        await phase6.updateFullAnalysis();
        await insights.generateInsights(true);
        await contextualData.collectData();
        
        const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
        const memoryIncrease = memoryAfter - memoryBefore;
        
        // Forzar garbage collection si está disponible
        if ((window as any).gc) {
          (window as any).gc();
        }
        
        const memoryAfterGC = (performance as any).memory?.usedJSHeapSize || 0;
        
        return {
          memoryBefore: Math.round(memoryBefore / 1024 / 1024 * 100) / 100, // MB
          memoryAfter: Math.round(memoryAfter / 1024 / 1024 * 100) / 100,
          memoryIncrease: Math.round(memoryIncrease / 1024 / 1024 * 100) / 100,
          memoryAfterGC: Math.round(memoryAfterGC / 1024 / 1024 * 100) / 100,
          memoryLeakSuspected: memoryIncrease > 50 * 1024 * 1024, // 50MB
          isHealthy: memoryIncrease < 20 * 1024 * 1024 // 20MB
        };
      }
    }
  ];

  const runSingleTest = useCallback(async (testCase: TestCase): Promise<TestResult> => {
    const startTime = performance.now();
    const timestamp = new Date();
    
    try {
      const result = await testCase.test();
      const duration = performance.now() - startTime;
      
      return {
        testId: testCase.id,
        success: true,
        duration,
        result,
        timestamp
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        testId: testCase.id,
        success: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp
      };
    }
  }, []);

  const runTestSuite = useCallback(async (
    categories?: Array<'integration' | 'performance' | 'data' | 'functionality'>,
    priorities?: Array<'high' | 'medium' | 'low'>
  ): Promise<TestSuiteResult> => {
    setIsRunning(true);
    const startTime = performance.now();
    
    try {
      // Filtrar test cases según criterios
      let filteredTestCases = testCases;
      
      if (categories && categories.length > 0) {
        filteredTestCases = filteredTestCases.filter(tc => categories.includes(tc.category));
      }
      
      if (priorities && priorities.length > 0) {
        filteredTestCases = filteredTestCases.filter(tc => priorities.includes(tc.priority));
      }
      
      const results: TestResult[] = [];
      
      // Ejecutar tests secuencialmente
      for (const testCase of filteredTestCases) {
        toast({
          title: 'Ejecutando test',
          description: testCase.name,
        });
        
        const result = await runSingleTest(testCase);
        results.push(result);
        
        // Pequeña pausa entre tests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const totalDuration = performance.now() - startTime;
      const successCount = results.filter(r => r.success).length;
      
      const suiteResult: TestSuiteResult = {
        totalTests: results.length,
        successCount,
        failureCount: results.length - successCount,
        totalDuration,
        results
      };
      
      setTestResults(results);
      
      toast({
        title: 'Test Suite Completado',
        description: `${successCount}/${results.length} tests exitosos`,
        variant: successCount === results.length ? 'default' : 'destructive'
      });
      
      return suiteResult;
      
    } finally {
      setIsRunning(false);
    }
  }, [testCases, runSingleTest, toast]);

  const runHighPriorityTests = useCallback(() => {
    return runTestSuite(undefined, ['high']);
  }, [runTestSuite]);

  const runPerformanceTests = useCallback(() => {
    return runTestSuite(['performance']);
  }, [runTestSuite]);

  const runIntegrationTests = useCallback(() => {
    return runTestSuite(['integration']);
  }, [runTestSuite]);

  const getTestSummary = useCallback(() => {
    const totalTests = testResults.length;
    const successCount = testResults.filter(r => r.success).length;
    const averageDuration = totalTests > 0 
      ? testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests 
      : 0;
    
    return {
      totalTests,
      successCount,
      failureCount: totalTests - successCount,
      successRate: totalTests > 0 ? (successCount / totalTests) * 100 : 0,
      averageDuration: Math.round(averageDuration * 100) / 100
    };
  }, [testResults]);

  return {
    // Estados
    isRunning,
    testResults,
    
    // Test cases disponibles
    availableTestCases: testCases,
    
    // Acciones
    runSingleTest,
    runTestSuite,
    runHighPriorityTests,
    runPerformanceTests,
    runIntegrationTests,
    
    // Información
    getTestSummary,
    
    // Limpiar resultados
    clearResults: () => setTestResults([])
  };
};
