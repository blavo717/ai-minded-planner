
import { useState, useCallback } from 'react';
import { usePhase6Advanced } from './usePhase6Advanced';
import { useInsightGeneration } from './useInsightGeneration';
import { useContextualDataCollector } from './useContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { createTestCases, TestCase } from '@/utils/ai/testing/testCases';
import { TestResult, TestSuiteResult } from '@/types/testing';

export const useAITesting = () => {
  const { toast } = useToast();
  const { tasks } = useTasks();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const phase6 = usePhase6Advanced();
  const insights = useInsightGeneration();
  const contextualData = useContextualDataCollector();

  const testCases = createTestCases(phase6, insights, contextualData, tasks);

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
      let filteredTestCases = testCases;
      
      if (categories && categories.length > 0) {
        filteredTestCases = filteredTestCases.filter(tc => categories.includes(tc.category));
      }
      
      if (priorities && priorities.length > 0) {
        filteredTestCases = filteredTestCases.filter(tc => priorities.includes(tc.priority));
      }
      
      const results: TestResult[] = [];
      
      for (const testCase of filteredTestCases) {
        toast({
          title: 'Ejecutando test',
          description: testCase.name,
        });
        
        const result = await runSingleTest(testCase);
        results.push(result);
        
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
    isRunning,
    testResults,
    availableTestCases: testCases,
    runSingleTest,
    runTestSuite,
    runHighPriorityTests,
    runPerformanceTests,
    runIntegrationTests,
    getTestSummary,
    clearResults: () => setTestResults([])
  };
};
