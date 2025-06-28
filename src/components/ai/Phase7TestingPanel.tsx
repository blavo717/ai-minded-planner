
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  TestTube,
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  RefreshCw,
  Bug,
  Target,
  Zap,
  Brain,
  Activity,
  Settings,
  FileCheck,
  Shield,
  TrendingUp
} from 'lucide-react';
import { usePhase6Advanced } from '@/hooks/ai/usePhase6Advanced';
import { useInsightGeneration } from '@/hooks/ai/useInsightGeneration';
import { useContextualDataCollector } from '@/hooks/ai/useContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  name: string;
  category: 'integration' | 'performance' | 'data' | 'ui' | 'ai';
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  message?: string;
  duration?: number;
  details?: Record<string, any>;
}

const Phase7TestingPanel = () => {
  const { toast } = useToast();
  const { tasks } = useTasks();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const {
    advancedContext,
    smartRecommendations,
    isGeneratingContext,
    isGeneratingRecommendations,
    updateFullAnalysis,
    getContextMetrics,
  } = usePhase6Advanced();

  const {
    insights,
    patternAnalysis,
    isGenerating: isGeneratingInsights,
    generateInsights,
  } = useInsightGeneration();

  const {
    contextualData,
    isCollecting,
    collectData,
    getProductivityTrends,
  } = useContextualDataCollector();

  const testSuite = [
    // Tests de Integración
    {
      id: 'phase6-integration',
      name: 'Integración Fase 6 Completa',
      category: 'integration' as const,
      test: async () => {
        if (!advancedContext) {
          await updateFullAnalysis();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        const metrics = getContextMetrics();
        if (!metrics) throw new Error('No se pudieron obtener métricas');
        
        return {
          contextGenerated: !!advancedContext,
          recommendationsCount: smartRecommendations.length,
          metricsAvailable: !!metrics,
          workflowEfficiency: metrics.workflowEfficiency
        };
      }
    },
    {
      id: 'insights-generation',
      name: 'Generación de Insights',
      category: 'ai' as const,
      test: async () => {
        if (insights.length === 0 && !isGeneratingInsights) {
          await generateInsights(true);
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        return {
          insightsGenerated: insights.length,
          patternAnalysisAvailable: !!patternAnalysis,
          hasProductivityInsights: insights.some(i => i.category === 'productivity'),
          hasSuggestions: insights.some(i => i.category === 'suggestion')
        };
      }
    },
    {
      id: 'contextual-data-collection',
      name: 'Recolección de Datos Contextuales',
      category: 'data' as const,
      test: async () => {
        if (contextualData.length === 0 && !isCollecting) {
          await collectData();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const trends = getProductivityTrends();
        
        return {
          dataPointsCollected: contextualData.length,
          trendsAvailable: trends.length > 0,
          dataTypes: [...new Set(contextualData.map(d => d.type))],
          recentDataAvailable: contextualData.some(d => 
            Date.now() - d.timestamp.getTime() < 24 * 60 * 60 * 1000
          )
        };
      }
    },
    // Tests de Performance
    {
      id: 'ai-response-time',
      name: 'Tiempo de Respuesta IA',
      category: 'performance' as const,
      test: async () => {
        const startTime = performance.now();
        
        if (patternAnalysis && tasks.length > 0) {
          await generateInsights(false);
        } else {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        
        if (responseTime > 5000) {
          throw new Error(`Tiempo de respuesta muy lento: ${responseTime.toFixed(2)}ms`);
        }
        
        return {
          responseTime: responseTime.toFixed(2),
          isAcceptable: responseTime < 3000,
          performance: responseTime < 1000 ? 'excellent' : 
                      responseTime < 3000 ? 'good' : 'needs_improvement'
        };
      }
    },
    {
      id: 'memory-usage',
      name: 'Uso de Memoria',
      category: 'performance' as const,
      test: async () => {
        const memoryInfo = (performance as any).memory;
        
        if (!memoryInfo) {
          return {
            memoryTestAvailable: false,
            message: 'Información de memoria no disponible en este navegador'
          };
        }
        
        const usedMB = memoryInfo.usedJSHeapSize / 1024 / 1024;
        const totalMB = memoryInfo.totalJSHeapSize / 1024 / 1024;
        const limitMB = memoryInfo.jsHeapSizeLimit / 1024 / 1024;
        
        return {
          usedMemoryMB: usedMB.toFixed(2),
          totalMemoryMB: totalMB.toFixed(2),
          memoryLimitMB: limitMB.toFixed(2),
          memoryUsagePercent: ((usedMB / limitMB) * 100).toFixed(2),
          isHealthy: (usedMB / limitMB) < 0.8
        };
      }
    },
    // Tests de Datos
    {
      id: 'data-consistency',
      name: 'Consistencia de Datos',
      category: 'data' as const,
      test: async () => {
        const tasksWithoutId = tasks.filter(t => !t.id);
        const duplicateIds = new Set();
        const duplicates = tasks.filter(t => {
          if (duplicateIds.has(t.id)) return true;
          duplicateIds.add(t.id);
          return false;
        });
        
        const contextDataTypes = [...new Set(contextualData.map(d => d.type))];
        const validDataTypes = contextualData.every(d => 
          ['user_behavior', 'task_patterns', 'productivity_metrics', 'environmental_data', 'temporal_patterns'].includes(d.type)
        );
        
        return {
          tasksValid: tasksWithoutId.length === 0,
          noDuplicateIds: duplicates.length === 0,
          contextualDataTypesValid: validDataTypes,
          contextualDataTypes: contextDataTypes,
          totalTasks: tasks.length,
          totalContextualData: contextualData.length
        };
      }
    },
    // Tests de UI
    {
      id: 'ui-responsiveness',
      name: 'Responsividad de UI',
      category: 'ui' as const,
      test: async () => {
        const testElements = [
          'Panel de Control Avanzado',
          'Recomendaciones Inteligentes',
          'Métricas de Contexto'
        ];
        
        // Simular cambios de estado para verificar responsividad
        const renderStart = performance.now();
        
        // Forzar algunos re-renders
        await updateFullAnalysis();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        
        return {
          renderTime: renderTime.toFixed(2),
          elementsResponsive: testElements.length,
          uiPerformance: renderTime < 1000 ? 'excellent' : 
                         renderTime < 2000 ? 'good' : 'needs_improvement',
          componentsLoaded: {
            advancedContext: !!advancedContext,
            smartRecommendations: smartRecommendations.length > 0,
            insights: insights.length > 0
          }
        };
      }
    }
  ];

  const updateTestResult = useCallback((testId: string, updates: Partial<TestResult>) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.id === testId);
      if (existing) {
        Object.assign(existing, updates);
        return [...prev];
      }
      
      const test = testSuite.find(t => t.id === testId);
      if (!test) return prev;
      
      return [...prev, {
        id: testId,
        name: test.name,
        category: test.category,
        status: 'pending',
        ...updates
      }];
    });
  }, [testSuite]);

  const runSingleTest = useCallback(async (testId: string) => {
    const test = testSuite.find(t => t.id === testId);
    if (!test) return false;

    setCurrentTest(testId);
    updateTestResult(testId, { status: 'running' });
    
    const startTime = performance.now();
    
    try {
      const result = await test.test();
      const duration = performance.now() - startTime;
      
      updateTestResult(testId, {
        status: 'success',
        message: `Test completado exitosamente`,
        duration,
        details: result
      });
      
      return true;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      updateTestResult(testId, {
        status: 'error',
        message: errorMessage,
        duration
      });
      
      return false;
    } finally {
      setCurrentTest('');
    }
  }, [testSuite, updateTestResult]);

  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    let successCount = 0;
    
    for (const test of testSuite) {
      const success = await runSingleTest(test.id);
      if (success) successCount++;
      
      // Pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsRunningTests(false);
    
    toast({
      title: 'Suite de Pruebas Completada',
      description: `${successCount}/${testSuite.length} pruebas exitosas`,
      variant: successCount === testSuite.length ? 'default' : 'destructive'
    });
  }, [testSuite, runSingleTest, toast]);

  const runCategoryTests = useCallback(async (category: string) => {
    setIsRunningTests(true);
    
    const categoryTests = testSuite.filter(t => t.category === category);
    let successCount = 0;
    
    for (const test of categoryTests) {
      const success = await runSingleTest(test.id);
      if (success) successCount++;
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsRunningTests(false);
    
    toast({
      title: `Pruebas de ${category} Completadas`,
      description: `${successCount}/${categoryTests.length} pruebas exitosas`
    });
  }, [testSuite, runSingleTest, toast]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'integration':
        return <Target className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'data':
        return <Activity className="h-4 w-4" />;
      case 'ui':
        return <Settings className="h-4 w-4" />;
      case 'ai':
        return <Brain className="h-4 w-4" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  const filteredTests = selectedCategory === 'all' 
    ? testSuite 
    : testSuite.filter(t => t.category === selectedCategory);

  const filteredResults = selectedCategory === 'all'
    ? testResults
    : testResults.filter(r => {
        const test = testSuite.find(t => t.id === r.id);
        return test?.category === selectedCategory;
      });

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const totalTests = testResults.length;
  const completionPercentage = totalTests > 0 ? (successCount / totalTests) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TestTube className="h-6 w-6 text-blue-500" />
            Fase 7: Testing y Validación
          </h1>
          <p className="text-muted-foreground">
            Validación completa del sistema de IA y todas sus funcionalidades
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
            className="flex items-center gap-2"
          >
            {isRunningTests ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar Todas
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Resumen de resultados */}
      {testResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                  <p className="text-sm text-muted-foreground">Exitosas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-sm text-muted-foreground">Fallidas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-blue-600">{completionPercentage.toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">Completado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-purple-600">{totalTests}</p>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="integration">Integración</TabsTrigger>
          <TabsTrigger value="ai">IA</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
          <TabsTrigger value="ui">UI</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {selectedCategory === 'all' ? 'Todas las Pruebas' : `Pruebas de ${selectedCategory}`}
            </h3>
            {selectedCategory !== 'all' && (
              <Button 
                onClick={() => runCategoryTests(selectedCategory)} 
                disabled={isRunningTests}
                size="sm"
                variant="outline"
              >
                <Play className="h-4 w-4 mr-2" />
                Ejecutar Categoría
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {filteredTests.map((test) => {
              const result = filteredResults.find(r => r.id === test.id);
              const isCurrentlyRunning = currentTest === test.id;
              
              return (
                <Card key={test.id} className={`transition-colors ${
                  isCurrentlyRunning ? 'bg-blue-50 border-blue-200' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getCategoryIcon(test.category)}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            Categoría: {test.category}
                          </p>
                          {result?.message && (
                            <p className="text-xs text-gray-600 mt-1">
                              {result.message}
                            </p>
                          )}
                          {result?.duration && (
                            <p className="text-xs text-gray-500">
                              Duración: {result.duration.toFixed(2)}ms
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {result && (
                          <Badge variant={
                            result.status === 'success' ? 'default' :
                            result.status === 'error' ? 'destructive' :
                            result.status === 'warning' ? 'secondary' : 'outline'
                          }>
                            {getStatusIcon(result.status)}
                            <span className="ml-1 capitalize">{result.status}</span>
                          </Badge>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => runSingleTest(test.id)}
                          disabled={isRunningTests}
                        >
                          {isCurrentlyRunning ? 'Ejecutando...' : 'Probar'}
                        </Button>
                      </div>
                    </div>
                    
                    {result?.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Detalles del Test:</h5>
                        <pre className="text-xs overflow-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {isRunningTests && (
        <Alert>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Ejecutando suite de pruebas... Test actual: {
              testSuite.find(t => t.id === currentTest)?.name || 'Inicializando'
            }
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Phase7TestingPanel;
