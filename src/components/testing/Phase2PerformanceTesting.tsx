
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Activity, Zap, Timer, TrendingUp, AlertTriangle } from 'lucide-react';
import { ContextAnalyzer } from '@/utils/ai/ContextAnalyzer';
import { ContextPrioritizer } from '@/utils/ai/ContextPrioritizer';
import { contextCache } from '@/utils/ai/ContextCache';
import { useAuth } from '@/hooks/useAuth';
import { useContextualData } from '@/hooks/ai/useContextualData';
import { PerformanceMonitor } from '@/utils/performanceMonitor';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface StressTestResult {
  iterations: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  memoryUsage: number;
}

export const Phase2PerformanceTesting = () => {
  const { user } = useAuth();
  const contextualData = useContextualData();
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [stressResults, setStressResults] = useState<StressTestResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const performanceRef = useRef<{ [key: string]: number[] }>({});

  const log = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-50), `[${timestamp}] ${message}`]);
    console.log(`[Phase2Performance] ${message}`);
  };

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
    }
  };

  const determineStatus = (value: number, thresholds: number[]): PerformanceMetric['status'] => {
    if (value <= thresholds[0]) return 'excellent';
    if (value <= thresholds[1]) return 'good';
    if (value <= thresholds[2]) return 'warning';
    return 'critical';
  };

  // Test de rendimiento del ContextAnalyzer
  const testAnalyzerPerformance = async (): Promise<PerformanceMetric[]> => {
    log('Testing rendimiento de ContextAnalyzer...');
    const results: PerformanceMetric[] = [];
    const durations: number[] = [];

    if (!contextualData.context) {
      throw new Error('No hay contexto disponible para testing');
    }

    // Test de 50 análisis consecutivos
    for (let i = 0; i < 50; i++) {
      const start = performance.now();
      ContextAnalyzer.analyzeSituation(contextualData.context);
      const duration = performance.now() - start;
      durations.push(duration);
    }

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    
    results.push({
      name: 'Análisis promedio',
      value: Math.round(avgDuration),
      unit: 'ms',
      status: determineStatus(avgDuration, [10, 25, 50])
    });

    results.push({
      name: 'Análisis máximo',
      value: Math.round(maxDuration),
      unit: 'ms',
      status: determineStatus(maxDuration, [20, 50, 100])
    });

    performanceRef.current.analyzer = durations;
    return results;
  };

  // Test de rendimiento del Cache
  const testCachePerformance = async (): Promise<PerformanceMetric[]> => {
    log('Testing rendimiento de ContextCache...');
    const results: PerformanceMetric[] = [];

    if (!user?.id || !contextualData.context) {
      throw new Error('No hay usuario o contexto para testing de cache');
    }

    // Limpiar cache
    contextCache.clear();

    // Test de escritura (100 operaciones)
    const writeDurations: number[] = [];
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      contextCache.set(user.id, contextualData.context, undefined, `test-${i}`, 60000);
      writeDurations.push(performance.now() - start);
    }

    // Test de lectura (1000 operaciones)
    const readDurations: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const testKey = `test-${i % 100}`;
      const start = performance.now();
      contextCache.get(user.id, testKey);
      readDurations.push(performance.now() - start);
    }

    const avgWrite = writeDurations.reduce((sum, d) => sum + d, 0) / writeDurations.length;
    const avgRead = readDurations.reduce((sum, d) => sum + d, 0) / readDurations.length;

    results.push({
      name: 'Escritura cache',
      value: Math.round(avgWrite * 1000), // En microsegundos
      unit: 'μs',
      status: determineStatus(avgWrite, [0.1, 0.5, 1])
    });

    results.push({
      name: 'Lectura cache',
      value: Math.round(avgRead * 1000), // En microsegundos
      unit: 'μs',
      status: determineStatus(avgRead, [0.05, 0.2, 0.5])
    });

    // Test de estadísticas del cache
    const start = performance.now();
    const stats = contextCache.getStats();
    const statsDuration = performance.now() - start;

    results.push({
      name: 'Estadísticas cache',
      value: Math.round(statsDuration),
      unit: 'ms',
      status: determineStatus(statsDuration, [1, 5, 10])
    });

    results.push({
      name: 'Hit rate cache',
      value: Math.round(stats.hitRate),
      unit: '%',
      status: stats.hitRate > 90 ? 'excellent' : stats.hitRate > 75 ? 'good' : stats.hitRate > 50 ? 'warning' : 'critical'
    });

    performanceRef.current.cache = [...writeDurations, ...readDurations];
    return results;
  };

  // Test de rendimiento del Prioritizer
  const testPrioritizerPerformance = async (): Promise<PerformanceMetric[]> => {
    log('Testing rendimiento de ContextPrioritizer...');
    const results: PerformanceMetric[] = [];
    const durations: number[] = [];

    if (!contextualData.context || !contextualData.analysis) {
      throw new Error('No hay contexto o análisis para testing del prioritizer');
    }

    // Test de 25 priorizaciones
    for (let i = 0; i < 25; i++) {
      const start = performance.now();
      ContextPrioritizer.prioritizeContext(contextualData.context, contextualData.analysis);
      durations.push(performance.now() - start);
    }

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const maxDuration = Math.max(...durations);

    results.push({
      name: 'Priorización promedio',
      value: Math.round(avgDuration),
      unit: 'ms',
      status: determineStatus(avgDuration, [25, 50, 100])
    });

    results.push({
      name: 'Priorización máxima',
      value: Math.round(maxDuration),
      unit: 'ms',
      status: determineStatus(maxDuration, [50, 100, 200])
    });

    performanceRef.current.prioritizer = durations;
    return results;
  };

  // Test de uso de memoria
  const testMemoryUsage = (): PerformanceMetric[] => {
    log('Testing uso de memoria...');
    const results: PerformanceMetric[] = [];

    PerformanceMonitor.logMemoryUsage('Phase2 Performance Test');
    const memory = PerformanceMonitor.getMemoryUsage();

    if (memory.used > 0) {
      const usedMB = Math.round(memory.used / 1024 / 1024);
      const totalMB = Math.round(memory.total / 1024 / 1024);

      results.push({
        name: 'Memoria usada',
        value: usedMB,
        unit: 'MB',
        status: determineStatus(usedMB, [50, 100, 200])
      });

      results.push({
        name: 'Memoria total',
        value: totalMB,
        unit: 'MB',
        status: 'good'
      });

      const usage = (usedMB / totalMB) * 100;
      results.push({
        name: 'Uso de memoria',
        value: Math.round(usage),
        unit: '%',
        status: determineStatus(usage, [50, 70, 85])
      });
    }

    return results;
  };

  // Test de estrés completo
  const runStressTest = async (): Promise<StressTestResult> => {
    log('Iniciando test de estrés...');
    const iterations = 100;
    const durations: number[] = [];
    let successCount = 0;

    if (!contextualData.context || !user?.id) {
      throw new Error('No hay contexto o usuario para test de estrés');
    }

    for (let i = 0; i < iterations; i++) {
      try {
        const start = performance.now();
        
        // Secuencia completa: Análisis -> Cache -> Priorización
        const analysis = ContextAnalyzer.analyzeSituation(contextualData.context);
        contextCache.set(user.id, contextualData.context, analysis, `stress-${i}`, 10000);
        const cached = contextCache.get(user.id, `stress-${i}`);
        ContextPrioritizer.prioritizeContext(contextualData.context, analysis);
        
        const duration = performance.now() - start;
        durations.push(duration);
        
        if (cached) successCount++;
        
        setProgress(Math.round((i + 1) / iterations * 100));
        
        // Pausa mínima para no bloquear la UI
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      } catch (error) {
        log(`Error en iteración ${i}: ${error}`);
      }
    }

    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const successRate = (successCount / iterations) * 100;
    
    const finalMemory = PerformanceMonitor.getMemoryUsage();
    const memoryUsage = Math.round(finalMemory.used / 1024 / 1024);

    return {
      iterations,
      avgDuration: Math.round(avgDuration),
      minDuration: Math.round(minDuration),
      maxDuration: Math.round(maxDuration),
      successRate: Math.round(successRate),
      memoryUsage
    };
  };

  const runPerformanceTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setMetrics([]);
    setStressResults(null);
    setProgress(0);

    try {
      log('=== INICIANDO TESTS DE RENDIMIENTO FASE 2 ===');

      const allMetrics: PerformanceMetric[] = [];

      // Test ContextAnalyzer
      setProgress(20);
      const analyzerMetrics = await testAnalyzerPerformance();
      allMetrics.push(...analyzerMetrics);

      // Test ContextCache
      setProgress(40);
      const cacheMetrics = await testCachePerformance();
      allMetrics.push(...cacheMetrics);

      // Test ContextPrioritizer
      setProgress(60);
      const prioritizerMetrics = await testPrioritizerPerformance();
      allMetrics.push(...prioritizerMetrics);

      // Test Memoria
      setProgress(70);
      const memoryMetrics = testMemoryUsage();
      allMetrics.push(...memoryMetrics);

      // Test de Estrés
      setProgress(80);
      const stressResult = await runStressTest();
      setStressResults(stressResult);

      setMetrics(allMetrics);
      setProgress(100);
      
      log('=== TESTS DE RENDIMIENTO COMPLETADOS ===');
    } catch (error) {
      log(`ERROR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const getOverallStatus = (): 'excellent' | 'good' | 'warning' | 'critical' => {
    if (metrics.length === 0) return 'good';
    
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const excellentCount = metrics.filter(m => m.status === 'excellent').length;

    if (criticalCount > 0) return 'critical';
    if (warningCount > 2) return 'warning';
    if (excellentCount >= metrics.length * 0.7) return 'excellent';
    return 'good';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Testing Fase 2</h2>
          <p className="text-muted-foreground">
            Testing de rendimiento y estrés del Context Engine
          </p>
        </div>
        <Button 
          onClick={runPerformanceTests}
          disabled={isRunning}
          size="lg"
        >
          {isRunning ? 'Ejecutando...' : 'Ejecutar Tests de Rendimiento'}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Activity className="h-5 w-5 animate-pulse" />
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Progreso</span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de Métricas */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.name}
                    </p>
                    <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                      <span className="text-sm ml-1">{metric.unit}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge 
                      variant={metric.status === 'critical' ? 'destructive' : 
                              metric.status === 'warning' ? 'secondary' : 'default'}
                    >
                      {metric.status}
                    </Badge>
                    {metric.status === 'critical' && (
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-1" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resultados del Test de Estrés */}
      {stressResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Resultados del Test de Estrés</span>
            </CardTitle>
            <CardDescription>
              Test de {stressResults.iterations} iteraciones completas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stressResults.avgDuration}ms
                </p>
                <p className="text-sm text-muted-foreground">Duración Promedio</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stressResults.minDuration}ms
                </p>
                <p className="text-sm text-muted-foreground">Duración Mínima</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {stressResults.maxDuration}ms
                </p>
                <p className="text-sm text-muted-foreground">Duración Máxima</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${
                  stressResults.successRate >= 95 ? 'text-green-600' : 
                  stressResults.successRate >= 90 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stressResults.successRate}%
                </p>
                <p className="text-sm text-muted-foreground">Tasa de Éxito</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {stressResults.memoryUsage}MB
                </p>
                <p className="text-sm text-muted-foreground">Memoria Usada</p>
              </div>
            </div>

            {stressResults.successRate < 95 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  La tasa de éxito está por debajo del 95%. Revisar posibles problemas de rendimiento.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado General del Sistema */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Estado General del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className={`text-3xl font-bold ${getStatusColor(getOverallStatus())}`}>
                {getOverallStatus().toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-sm font-medium text-green-600">Excelente</p>
                    <p className="text-lg font-bold">
                      {metrics.filter(m => m.status === 'excellent').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-600">Bueno</p>
                    <p className="text-lg font-bold">
                      {metrics.filter(m => m.status === 'good').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Advertencia</p>
                    <p className="text-lg font-bold">
                      {metrics.filter(m => m.status === 'warning').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-600">Crítico</p>
                    <p className="text-lg font-bold">
                      {metrics.filter(m => m.status === 'critical').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Timer className="h-5 w-5" />
              <span>Logs de Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-auto">
              {logs.map((log, idx) => (
                <div key={idx}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
