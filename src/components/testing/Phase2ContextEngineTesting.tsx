
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, Clock, Brain, Zap, Target } from 'lucide-react';
import { useAdvancedContext } from '@/hooks/ai/useAdvancedContext';
import { useContextualData } from '@/hooks/ai/useContextualData';
import { ContextAnalyzer } from '@/utils/ai/ContextAnalyzer';
import { ContextPrioritizer } from '@/utils/ai/ContextPrioritizer';
import { contextCache } from '@/utils/ai/ContextCache';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  details: string;
  duration?: number;
  data?: any;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
  progress: number;
}

export const Phase2ContextEngineTesting = () => {
  const { user } = useAuth();
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string>('');
  const [testLogs, setTestLogs] = useState<string[]>([]);

  // Hooks para testing
  const contextualData = useContextualData({
    enableAnalysis: true,
    refreshInterval: 30000,
    maxDataPoints: 20,
  });

  const advancedContext = useAdvancedContext({
    enableCache: true,
    enablePrioritization: true,
    enableRealtimeAnalysis: true,
  });

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[Phase2Test] ${message}`);
  };

  const updateTestResult = (suiteIndex: number, testIndex: number, result: Partial<TestResult>) => {
    setTestSuites(prev => prev.map((suite, sIdx) => {
      if (sIdx === suiteIndex) {
        const updatedTests = suite.tests.map((test, tIdx) => {
          if (tIdx === testIndex) {
            return { ...test, ...result };
          }
          return test;
        });
        
        const completedTests = updatedTests.filter(t => t.status === 'passed' || t.status === 'failed').length;
        const progress = Math.round((completedTests / updatedTests.length) * 100);
        const status = completedTests === updatedTests.length ? 'completed' : 'running';
        
        return { ...suite, tests: updatedTests, progress, status };
      }
      return suite;
    }));
  };

  // Test del ContextAnalyzer
  const testContextAnalyzer = async (suiteIndex: number) => {
    log('Iniciando tests de ContextAnalyzer...');
    
    // Test 1: Análisis básico
    const startTime1 = performance.now();
    updateTestResult(suiteIndex, 0, { status: 'running' });
    
    try {
      if (!contextualData.context) {
        throw new Error('No hay contexto disponible para analizar');
      }
      
      const analysis = ContextAnalyzer.analyzeSituation(contextualData.context);
      
      // Validaciones estrictas
      if (!analysis.workloadLevel || !['light', 'moderate', 'heavy', 'overwhelming'].includes(analysis.workloadLevel)) {
        throw new Error(`Nivel de carga inválido: ${analysis.workloadLevel}`);
      }
      
      if (typeof analysis.urgencyScore !== 'number' || analysis.urgencyScore < 0 || analysis.urgencyScore > 100) {
        throw new Error(`Score de urgencia inválido: ${analysis.urgencyScore}`);
      }
      
      if (!analysis.focusArea || !['tasks', 'projects', 'planning', 'review', 'maintenance'].includes(analysis.focusArea)) {
        throw new Error(`Área de foco inválida: ${analysis.focusArea}`);
      }
      
      if (!Array.isArray(analysis.recommendedActions) || analysis.recommendedActions.length === 0) {
        throw new Error('Las acciones recomendadas deben ser un array no vacío');
      }
      
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'passed',
        details: `Análisis generado correctamente. Carga: ${analysis.workloadLevel}, Urgencia: ${analysis.urgencyScore}, Foco: ${analysis.focusArea}`,
        duration: Math.round(duration1),
        data: analysis
      });
      
      log(`✓ ContextAnalyzer - Análisis básico: PASADO (${Math.round(duration1)}ms)`);
    } catch (error) {
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration1)
      });
      log(`✗ ContextAnalyzer - Análisis básico: FALLIDO`);
    }

    // Test 2: Consistencia del análisis
    const startTime2 = performance.now();
    updateTestResult(suiteIndex, 1, { status: 'running' });
    
    try {
      if (!contextualData.context) {
        throw new Error('No hay contexto disponible');
      }
      
      const analysis1 = ContextAnalyzer.analyzeSituation(contextualData.context);
      const analysis2 = ContextAnalyzer.analyzeSituation(contextualData.context);
      
      // Verificar consistencia
      if (analysis1.workloadLevel !== analysis2.workloadLevel) {
        throw new Error('Inconsistencia en workloadLevel');
      }
      
      if (Math.abs(analysis1.urgencyScore - analysis2.urgencyScore) > 5) {
        throw new Error('Inconsistencia en urgencyScore (diferencia > 5)');
      }
      
      if (analysis1.focusArea !== analysis2.focusArea) {
        throw new Error('Inconsistencia en focusArea');
      }
      
      const duration2 = performance.now() - startTime2;
      updateTestResult(suiteIndex, 1, {
        status: 'passed',
        details: 'Análisis consistente en múltiples ejecuciones',
        duration: Math.round(duration2)
      });
      
      log(`✓ ContextAnalyzer - Consistencia: PASADO (${Math.round(duration2)}ms)`);
    } catch (error) {
      const duration2 = performance.now() - startTime2;
      updateTestResult(suiteIndex, 1, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration2)
      });
      log(`✗ ContextAnalyzer - Consistencia: FALLIDO`);
    }
  };

  // Test del ContextCache
  const testContextCache = async (suiteIndex: number) => {
    log('Iniciando tests de ContextCache...');
    
    if (!user?.id) {
      updateTestResult(suiteIndex, 0, {
        status: 'failed',
        details: 'No hay usuario autenticado para probar el cache'
      });
      return;
    }

    // Test 1: Operaciones básicas del cache
    const startTime1 = performance.now();
    updateTestResult(suiteIndex, 0, { status: 'running' });
    
    try {
      // Limpiar cache antes de probar
      contextCache.clear();
      
      if (!contextualData.context) {
        throw new Error('No hay contexto para cachear');
      }
      
      // Test de set/get
      contextCache.set(user.id, contextualData.context, undefined, 'test', 10000);
      
      const cached = contextCache.get(user.id, 'test');
      if (!cached) {
        throw new Error('No se pudo recuperar el contexto del cache');
      }
      
      if (cached.userId !== user.id) {
        throw new Error('UserId del cache no coincide');
      }
      
      if (!cached.context) {
        throw new Error('Contexto del cache está vacío');
      }
      
      // Test de has
      if (!contextCache.has(user.id, 'test')) {
        throw new Error('has() no detecta el contexto cacheado');
      }
      
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'passed',
        details: 'Operaciones básicas del cache funcionando correctamente',
        duration: Math.round(duration1)
      });
      
      log(`✓ ContextCache - Operaciones básicas: PASADO (${Math.round(duration1)}ms)`);
    } catch (error) {
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration1)
      });
      log(`✗ ContextCache - Operaciones básicas: FALLIDO`);
    }

    // Test 2: Estadísticas del cache
    const startTime2 = performance.now();
    updateTestResult(suiteIndex, 1, { status: 'running' });
    
    try {
      const stats = contextCache.getStats();
      
      if (typeof stats.totalEntries !== 'number' || stats.totalEntries < 0) {
        throw new Error('totalEntries inválido');
      }
      
      if (typeof stats.hitRate !== 'number' || stats.hitRate < 0 || stats.hitRate > 100) {
        throw new Error('hitRate inválido');
      }
      
      if (typeof stats.memoryUsage !== 'number' || stats.memoryUsage < 0) {
        throw new Error('memoryUsage inválido');
      }
      
      const duration2 = performance.now() - startTime2;
      updateTestResult(suiteIndex, 1, {
        status: 'passed',
        details: `Estadísticas: ${stats.totalEntries} entradas, ${stats.hitRate.toFixed(1)}% hit rate, ${stats.memoryUsage}KB`,
        duration: Math.round(duration2),
        data: stats
      });
      
      log(`✓ ContextCache - Estadísticas: PASADO (${Math.round(duration2)}ms)`);
    } catch (error) {
      const duration2 = performance.now() - startTime2;
      updateTestResult(suiteIndex, 1, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration2)
      });
      log(`✗ ContextCache - Estadísticas: FALLIDO`);
    }
  };

  // Test del ContextPrioritizer
  const testContextPrioritizer = async (suiteIndex: number) => {
    log('Iniciando tests de ContextPrioritizer...');
    
    // Test 1: Priorización de contexto
    const startTime1 = performance.now();
    updateTestResult(suiteIndex, 0, { status: 'running' });
    
    try {
      if (!contextualData.context || !contextualData.analysis) {
        throw new Error('No hay contexto o análisis disponible');
      }
      
      const prioritizedContext = ContextPrioritizer.prioritizeContext(
        contextualData.context,
        contextualData.analysis
      );
      
      // Validaciones
      if (!Array.isArray(prioritizedContext.prioritizedTasks)) {
        throw new Error('prioritizedTasks debe ser un array');
      }
      
      if (!Array.isArray(prioritizedContext.prioritizedProjects)) {
        throw new Error('prioritizedProjects debe ser un array');
      }
      
      if (!Array.isArray(prioritizedContext.focusRecommendations)) {
        throw new Error('focusRecommendations debe ser un array');
      }
      
      if (!prioritizedContext.timeAllocation || 
          typeof prioritizedContext.timeAllocation.tasks !== 'number' ||
          typeof prioritizedContext.timeAllocation.projects !== 'number') {
        throw new Error('timeAllocation inválido');
      }
      
      // Verificar que las tareas tienen scores válidos
      for (const task of prioritizedContext.prioritizedTasks) {
        if (typeof task.priorityScore !== 'number' || task.priorityScore < 0 || task.priorityScore > 100) {
          throw new Error(`Score inválido para tarea ${task.title}: ${task.priorityScore}`);
        }
      }
      
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'passed',
        details: `Contexto priorizado: ${prioritizedContext.prioritizedTasks.length} tareas, ${prioritizedContext.prioritizedProjects.length} proyectos`,
        duration: Math.round(duration1),
        data: {
          tasksCount: prioritizedContext.prioritizedTasks.length,
          projectsCount: prioritizedContext.prioritizedProjects.length,
          timeAllocation: prioritizedContext.timeAllocation
        }
      });
      
      log(`✓ ContextPrioritizer - Priorización: PASADO (${Math.round(duration1)}ms)`);
    } catch (error) {
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration1)
      });
      log(`✗ ContextPrioritizer - Priorización: FALLIDO`);
    }
  };

  // Test de integración completa
  const testIntegration = async (suiteIndex: number) => {
    log('Iniciando tests de integración...');
    
    // Test 1: Hook useContextualData
    const startTime1 = performance.now();
    updateTestResult(suiteIndex, 0, { status: 'running' });
    
    try {
      if (contextualData.isLoading) {
        // Esperar un momento para que cargue
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!contextualData.context) {
        throw new Error('useContextualData no generó contexto');
      }
      
      if (contextualData.dataQuality < 30) {
        throw new Error(`Calidad de datos muy baja: ${contextualData.dataQuality}%`);
      }
      
      if (!Array.isArray(contextualData.recommendations)) {
        throw new Error('Las recomendaciones deben ser un array');
      }
      
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'passed',
        details: `Hook funcional. Calidad: ${contextualData.dataQuality}%, ${contextualData.recommendations.length} recomendaciones`,
        duration: Math.round(duration1),
        data: {
          dataQuality: contextualData.dataQuality,
          recommendationsCount: contextualData.recommendations.length,
          hasHighQualityData: contextualData.hasHighQualityData
        }
      });
      
      log(`✓ Integración - useContextualData: PASADO (${Math.round(duration1)}ms)`);
    } catch (error) {
      const duration1 = performance.now() - startTime1;
      updateTestResult(suiteIndex, 0, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration1)
      });
      log(`✗ Integración - useContextualData: FALLIDO`);
    }

    // Test 2: Hook useAdvancedContext
    const startTime2 = performance.now();
    updateTestResult(suiteIndex, 1, { status: 'running' });
    
    try {
      if (advancedContext.isLoading) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      if (!advancedContext.context) {
        throw new Error('useAdvancedContext no generó contexto');
      }
      
      if (!advancedContext.analysis) {
        throw new Error('useAdvancedContext no generó análisis');
      }
      
      if (!Array.isArray(advancedContext.recommendations) || advancedContext.recommendations.length === 0) {
        throw new Error('useAdvancedContext no generó recomendaciones');
      }
      
      if (!Array.isArray(advancedContext.nextActions) || advancedContext.nextActions.length === 0) {
        throw new Error('useAdvancedContext no generó próximas acciones');
      }
      
      const duration2 = performance.now() - startTime2;
      updateTestResult(suiteIndex, 1, {
        status: 'passed',
        details: `Hook avanzado funcional. ${advancedContext.recommendations.length} recomendaciones, ${advancedContext.nextActions.length} acciones`,
        duration: Math.round(duration2),
        data: {
          recommendationsCount: advancedContext.recommendations.length,
          nextActionsCount: advancedContext.nextActions.length,
          focusArea: advancedContext.focusArea,
          hasHighQualityContext: advancedContext.hasHighQualityContext
        }
      });
      
      log(`✓ Integración - useAdvancedContext: PASADO (${Math.round(duration2)}ms)`);
    } catch (error) {
      const duration2 = performance.now() - startTime2;
      updateTestResult(suiteIndex, 1, {
        status: 'failed',
        details: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration: Math.round(duration2)
      });
      log(`✗ Integración - useAdvancedContext: FALLIDO`);
    }
  };

  const initializeTestSuites = () => {
    const suites: TestSuite[] = [
      {
        name: 'ContextAnalyzer',
        description: 'Tests del analizador de contexto y situación',
        status: 'pending',
        progress: 0,
        tests: [
          { name: 'Análisis básico de situación', status: 'pending', details: '' },
          { name: 'Consistencia del análisis', status: 'pending', details: '' }
        ]
      },
      {
        name: 'ContextCache',
        description: 'Tests del sistema de cache inteligente',
        status: 'pending',
        progress: 0,
        tests: [
          { name: 'Operaciones básicas del cache', status: 'pending', details: '' },
          { name: 'Estadísticas del cache', status: 'pending', details: '' }
        ]
      },
      {
        name: 'ContextPrioritizer',
        description: 'Tests del sistema de priorización',
        status: 'pending',
        progress: 0,
        tests: [
          { name: 'Priorización de contexto', status: 'pending', details: '' }
        ]
      },
      {
        name: 'Integración',
        description: 'Tests de integración completa del sistema',
        status: 'pending',
        progress: 0,
        tests: [
          { name: 'Hook useContextualData', status: 'pending', details: '' },
          { name: 'Hook useAdvancedContext', status: 'pending', details: '' }
        ]
      }
    ];
    
    setTestSuites(suites);
    setSelectedSuite(suites[0].name);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestLogs([]);
    log('=== INICIANDO TESTING COMPLETO DE FASE 2 ===');
    
    try {
      // Ejecutar cada suite de tests
      for (let i = 0; i < testSuites.length; i++) {
        const suite = testSuites[i];
        log(`\n--- Ejecutando suite: ${suite.name} ---`);
        
        setTestSuites(prev => prev.map((s, idx) => 
          idx === i ? { ...s, status: 'running' } : s
        ));
        
        switch (suite.name) {
          case 'ContextAnalyzer':
            await testContextAnalyzer(i);
            break;
          case 'ContextCache':
            await testContextCache(i);
            break;
          case 'ContextPrioritizer':
            await testContextPrioritizer(i);
            break;
          case 'Integración':
            await testIntegration(i);
            break;
        }
        
        // Pequeña pausa entre suites
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      log('\n=== TESTING COMPLETO FINALIZADO ===');
    } catch (error) {
      log(`ERROR CRÍTICO: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSuiteIcon = (name: string) => {
    switch (name) {
      case 'ContextAnalyzer': return <Brain className="h-5 w-5" />;
      case 'ContextCache': return <Zap className="h-5 w-5" />;
      case 'ContextPrioritizer': return <Target className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  useEffect(() => {
    initializeTestSuites();
  }, []);

  const selectedSuiteData = testSuites.find(s => s.name === selectedSuite);
  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const completedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(t => t.status === 'passed' || t.status === 'failed').length, 0
  );
  const passedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(t => t.status === 'passed').length, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testing Fase 2 - Context Engine</h2>
          <p className="text-muted-foreground">
            Testing completo y robusto del Context Engine Avanzado
          </p>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? 'Ejecutando Tests...' : 'Ejecutar Todos los Tests'}
        </Button>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Total Tests</p>
                <p className="text-2xl font-bold">{totalTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Completados</p>
                <p className="text-2xl font-bold">{completedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Pasados</p>
                <p className="text-2xl font-bold">{passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Fallidos</p>
                <p className="text-2xl font-bold">{completedTests - passedTests}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedSuite} onValueChange={setSelectedSuite}>
        <TabsList className="grid w-full grid-cols-4">
          {testSuites.map((suite) => (
            <TabsTrigger key={suite.name} value={suite.name} className="flex items-center space-x-2">
              {getSuiteIcon(suite.name)}
              <span>{suite.name}</span>
              {suite.status === 'completed' && (
                <Badge variant={suite.tests.every(t => t.status === 'passed') ? 'default' : 'destructive'} className="ml-1">
                  {suite.tests.filter(t => t.status === 'passed').length}/{suite.tests.length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {testSuites.map((suite) => (
          <TabsContent key={suite.name} value={suite.name} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {getSuiteIcon(suite.name)}
                  <span>{suite.name}</span>
                  <Badge variant={suite.status === 'completed' ? 'default' : 'secondary'}>
                    {suite.status}
                  </Badge>
                </CardTitle>
                <CardDescription>{suite.description}</CardDescription>
                {suite.progress > 0 && (
                  <Progress value={suite.progress} className="w-full" />
                )}
              </CardHeader>
              
              <CardContent className="space-y-3">
                {suite.tests.map((test, idx) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      {test.duration && (
                        <Badge variant="outline">{test.duration}ms</Badge>
                      )}
                    </div>
                    
                    {test.details && (
                      <p className={`text-sm ${
                        test.status === 'passed' ? 'text-green-600' : 
                        test.status === 'failed' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {test.details}
                      </p>
                    )}
                    
                    {test.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">Ver datos</summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Logs de Testing */}
      {testLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Logs de Testing</CardTitle>
            <CardDescription>Registro detallado de la ejecución de tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-auto">
              {testLogs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de los Hooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Estado useContextualData</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Cargando:</span>
              <Badge variant={contextualData.isLoading ? 'destructive' : 'default'}>
                {contextualData.isLoading ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Calidad de datos:</span>
              <Badge variant={contextualData.dataQuality > 70 ? 'default' : 'secondary'}>
                {contextualData.dataQuality}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Recomendaciones:</span>
              <Badge variant="outline">{contextualData.recommendations.length}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Datos de alta calidad:</span>
              <Badge variant={contextualData.hasHighQualityData ? 'default' : 'secondary'}>
                {contextualData.hasHighQualityData ? 'Sí' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado useAdvancedContext</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Cargando:</span>
              <Badge variant={advancedContext.isLoading ? 'destructive' : 'default'}>
                {advancedContext.isLoading ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Analizando:</span>
              <Badge variant={advancedContext.isAnalyzing ? 'destructive' : 'default'}>
                {advancedContext.isAnalyzing ? 'Sí' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Área de foco:</span>
              <Badge variant="outline">{advancedContext.focusArea}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Última actualización:</span>
              <Badge variant="secondary">
                {advancedContext.lastUpdate ? advancedContext.lastUpdate.toLocaleTimeString() : 'Nunca'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
