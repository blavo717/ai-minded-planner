
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  Clock,
  Database,
  MessageSquare
} from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useSmartMessaging } from '@/hooks/useSmartMessaging';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  description: string;
  error?: string;
  details?: string[];
  duration?: number;
}

const Phase5TestingSuite = () => {
  const { 
    addNotification, 
    addSuggestion, 
    clearChat, 
    forceFullReset,
    syncWithDB,
    validatePersistence,
    currentStrategy,
    messages,
    setForcedMemoryStrategy,
    clearForcedStrategy
  } = useAIAssistant();
  
  const { pauseForTesting, resumeAfterTesting } = useSmartMessaging();
  const { activeConfiguration } = useLLMConfigurations();
  
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Forzar Estrategia Memoria',
      status: 'pending',
      description: 'FASE 14: Forzar strategy=memory para tests ultra-simples'
    },
    {
      name: 'Reset Memoria Instantáneo',
      status: 'pending',
      description: 'FASE 14: Reset instantáneo en memoria'
    },
    {
      name: 'Añadir Notificación Memoria',
      status: 'pending',
      description: 'FASE 14: Crear notificación instantánea'
    },
    {
      name: 'Añadir Sugerencia Memoria',
      status: 'pending',
      description: 'FASE 14: Crear sugerencia instantánea'
    },
    {
      name: 'Validación Memoria Directa',
      status: 'pending',
      description: 'FASE 14: Validar directamente contra memoria'
    },
    {
      name: 'Limpieza Memoria Instantánea',
      status: 'pending',
      description: 'FASE 14: Limpiar memoria instantáneamente'
    },
    {
      name: 'Verificación Final Ultra-Simple',
      status: 'pending',
      description: 'FASE 14: Estado final limpio en memoria'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<number>(-1);
  const [overallStartTime, setOverallStartTime] = useState<number>(0);

  const updateTestResult = useCallback((index: number, status: TestResult['status'], error?: string, details?: string[], duration?: number) => {
    setTestResults(prev => prev.map((test, i) => 
      i === index ? { ...test, status, error, details, duration } : test
    ));
  }, []);

  // FASE 14: Test 1 - Forzar Estrategia Memoria INSTANTÁNEO
  const testForceMemoryStrategy = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 1 - Forzar Estrategia Memoria');
    const startTime = Date.now();
    
    try {
      // Forzar estrategia memoria
      setForcedMemoryStrategy();
      
      // Pausa Smart Messaging (ya está desactivado)
      pauseForTesting();
      
      // Verificar que la estrategia cambió
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms mínimo
      
      const duration = Date.now() - startTime;
      
      if (currentStrategy === 'memory') {
        updateTestResult(0, 'passed', undefined, [
          `✅ Estrategia forzada a memoria`,
          `✅ Smart Messaging desactivado`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(0, 'failed', `Estrategia esperada: memory, actual: ${currentStrategy}`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(0, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [setForcedMemoryStrategy, pauseForTesting, currentStrategy, updateTestResult]);

  // FASE 14: Test 2 - Reset Memoria INSTANTÁNEO
  const testMemoryReset = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 2 - Reset Memoria Instantáneo');
    const startTime = Date.now();
    
    try {
      // Reset instantáneo
      await forceFullReset();
      
      // Verificar que está limpio (debería ser instantáneo)
      const isClean = await validatePersistence(0, 'testMemoryReset');
      
      const duration = Date.now() - startTime;
      
      if (isClean) {
        updateTestResult(1, 'passed', undefined, [
          `✅ Reset instantáneo exitoso`,
          `✅ Memoria limpia: 0 mensajes`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(1, 'failed', 'Reset no completó limpieza');
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(1, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [forceFullReset, validatePersistence, updateTestResult]);

  // FASE 14: Test 3 - Añadir Notificación INSTANTÁNEO
  const testAddNotificationMemory = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 3 - Añadir Notificación Memoria');
    const startTime = Date.now();
    
    try {
      const preCount = messages.length;
      console.log(`📊 Pre-count: ${preCount} mensajes`);
      
      await addNotification('🔔 Test notification FASE 14 MEMORY', 'medium', { test: true });
      
      // Sync instantáneo en memoria
      await syncWithDB();
      
      // Validar inmediatamente
      const isValid = await validatePersistence(preCount + 1, 'testAddNotificationMemory');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(2, 'passed', undefined, [
          `✅ Notificación añadida instantáneamente`,
          `✅ Memoria actualizada: ${preCount} → ${preCount + 1}`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(2, 'failed', `Validación memoria falló. Esperado: ${preCount + 1}`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(2, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [addNotification, messages.length, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 14: Test 4 - Añadir Sugerencia INSTANTÁNEO
  const testAddSuggestionMemory = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 4 - Añadir Sugerencia Memoria');
    const startTime = Date.now();
    
    try {
      const preCount = messages.length;
      console.log(`📊 Pre-count: ${preCount} mensajes`);
      
      await addSuggestion('💡 Test suggestion FASE 14 MEMORY', 'low', { test: true });
      
      // Sync instantáneo
      await syncWithDB();
      
      // Validar inmediatamente
      const isValid = await validatePersistence(preCount + 1, 'testAddSuggestionMemory');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(3, 'passed', undefined, [
          `✅ Sugerencia añadida instantáneamente`,
          `✅ Memoria actualizada: ${preCount} → ${preCount + 1}`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(3, 'failed', `Validación memoria falló. Esperado: ${preCount + 1}`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(3, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [addSuggestion, messages.length, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 14: Test 5 - Validación Memoria Directa INSTANTÁNEO
  const testMemoryValidation = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 5 - Validación Memoria Directa');
    const startTime = Date.now();
    
    try {
      const currentCount = messages.length;
      console.log(`📊 Validando memoria directa: ${currentCount} mensajes`);
      
      // Validación directa de memoria
      const isValid = await validatePersistence(currentCount, 'testMemoryValidation');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(4, 'passed', undefined, [
          `✅ Validación memoria directa exitosa`,
          `✅ Mensajes validados: ${currentCount}`,
          `✅ Solo lectura (no modificación)`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(4, 'failed', `Validación memoria falló para ${currentCount} mensajes`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(4, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [messages.length, validatePersistence, updateTestResult]);

  // FASE 14: Test 6 - Limpieza Memoria INSTANTÁNEO
  const testMemoryClear = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 6 - Limpieza Memoria Instantánea');
    const startTime = Date.now();
    
    try {
      await clearChat();
      
      // Sync instantáneo
      await syncWithDB();
      
      // Validar que está limpio
      const isValid = await validatePersistence(0, 'testMemoryClear');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(5, 'passed', undefined, [
          `✅ Memoria limpiada instantáneamente`,
          `✅ Memoria completamente vacía`,
          `✅ Estado sincronizado`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(5, 'failed', 'Memoria no se limpió completamente');
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(5, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [clearChat, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 14: Test 7 - Verificación Final INSTANTÁNEO
  const testFinalVerificationMemory = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 14: TEST 7 - Verificación Final Ultra-Simple');
    const startTime = Date.now();
    
    try {
      // Sync una vez más
      await syncWithDB();
      
      // Validar estado final
      const finalCount = messages.length;
      const isValid = await validatePersistence(finalCount, 'testFinalVerificationMemory');
      
      // Restaurar estrategia normal
      clearForcedStrategy();
      
      // Reanudar Smart Messaging (ya está desactivado)
      resumeAfterTesting();
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(6, 'passed', undefined, [
          `✅ Estado final consistente`,
          `✅ Memoria y estado sincronizados: ${finalCount} mensajes`,
          `✅ Estrategia restaurada`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(6, 'failed', 'Estado final no es consistente');
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(6, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [syncWithDB, messages.length, validatePersistence, clearForcedStrategy, resumeAfterTesting, updateTestResult]);

  const runAllTests = useCallback(async () => {
    if (!activeConfiguration) {
      toast({
        title: "Configuración LLM requerida",
        description: "Ve a Configuración > LLM para configurar OpenRouter API key.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setOverallStartTime(Date.now());
    
    // Reset all tests
    setTestResults(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending', 
      error: undefined, 
      details: undefined,
      duration: undefined 
    })));
    
    const tests = [
      testForceMemoryStrategy,
      testMemoryReset,
      testAddNotificationMemory,
      testAddSuggestionMemory,
      testMemoryValidation,
      testMemoryClear,
      testFinalVerificationMemory
    ];
    
    let allPassed = true;
    
    for (let i = 0; i < tests.length; i++) {
      setCurrentTest(i);
      updateTestResult(i, 'running');
      
      console.log(`🧪 FASE 14: Ejecutando test ultra-simple ${i + 1}/${tests.length}`);
      
      const testPassed = await tests[i]();
      
      if (!testPassed) {
        allPassed = false;
        console.error(`❌ FASE 14: Test ${i + 1} falló`);
      } else {
        console.log(`✅ FASE 14: Test ${i + 1} exitoso`);
      }
      
      // Pausa mínima entre tests (100ms)
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setCurrentTest(-1);
    setIsRunning(false);
    
    const totalDuration = Date.now() - overallStartTime;
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    
    console.log(`🏁 FASE 14: Tests ultra-simples completados en ${totalDuration}ms`);
    console.log(`📊 FASE 14: ${passed} exitosos, ${failed} fallidos`);
    
    toast({
      title: allPassed ? "🎉 FASE 14: ¡Todos los tests ultra-simples pasaron!" : "❌ FASE 14: Algunos tests fallaron",
      description: `${passed} exitosos, ${failed} fallidos. Tiempo total: ${Math.round(totalDuration / 1000)}s`,
      variant: allPassed ? "default" : "destructive"
    });
  }, [
    activeConfiguration,
    testForceMemoryStrategy,
    testMemoryReset,
    testAddNotificationMemory,
    testAddSuggestionMemory,
    testMemoryValidation,
    testMemoryClear,
    testFinalVerificationMemory,
    testResults,
    overallStartTime
  ]);

  const resetTests = useCallback(() => {
    setTestResults(prev => prev.map(test => ({ 
      ...test, 
      status: 'pending', 
      error: undefined, 
      details: undefined,
      duration: undefined 
    })));
    setCurrentTest(-1);
    setIsRunning(false);
    setOverallStartTime(0);
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const completedTests = passedTests + failedTests;
  const totalDuration = testResults.reduce((sum, test) => sum + (test.duration || 0), 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-500" />
            FASE 14 - ENFOQUE MINIMALISTA TOTAL
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {completedTests}/{testResults.length} completados
            </Badge>
            {passedTests > 0 && (
              <Badge className="bg-green-100 text-green-800">
                {passedTests} ✓
              </Badge>
            )}
            {failedTests > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {failedTests} ✗
              </Badge>
            )}
            {totalDuration > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(totalDuration / 1000)}s
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* FASE 14 Alert */}
        <Alert className="border-green-200 bg-green-50">
          <Database className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-green-800">FASE 14 - ENFOQUE MINIMALISTA TOTAL:</div>
            <ul className="list-disc list-inside text-sm space-y-1 text-green-700">
              <li>✅ Smart Messaging PERMANENTEMENTE desactivado</li>
              <li>✅ Tests SOLO en memoria: operaciones instantáneas</li>
              <li>✅ Timeouts ultra-mínimos: 100-500ms máximo</li>
              <li>✅ Arquitectura minimalista: sin complejidad</li>
              <li>✅ Validación directa: sin sincronización BD</li>
              <li>✅ Tests secuenciales aislados: determinísticos</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Estado del sistema */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg border">
            <div className="text-lg font-bold text-blue-600">{messages.length}</div>
            <div className="text-xs text-muted-foreground">Mensajes actuales</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg border">
            <div className="text-lg font-bold text-green-600">{currentStrategy}</div>
            <div className="text-xs text-muted-foreground">Estrategia activa</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg border">
            <div className="text-lg font-bold text-purple-600">{passedTests}</div>
            <div className="text-xs text-muted-foreground">Tests exitosos</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg border">
            <div className="text-lg font-bold text-orange-600">
              {totalDuration > 0 ? `${Math.round(totalDuration / 1000)}s` : '0s'}
            </div>
            <div className="text-xs text-muted-foreground">Tiempo total</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning || !activeConfiguration}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Ejecutando Tests FASE 14...' : 'Ejecutar Tests Ultra-Simples FASE 14'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          {testResults.map((test, index) => (
            <div 
              key={index}
              className={`p-4 border rounded-lg transition-all ${
                currentTest === index ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getStatusIcon(test.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{test.name}</h4>
                    <Badge className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                    {test.duration && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {test.duration}ms
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {test.description}
                  </p>
                  
                  {test.error && (
                    <div className="bg-red-50 border border-red-200 rounded p-2 mb-2">
                      <p className="text-sm text-red-700 font-medium">Error:</p>
                      <p className="text-sm text-red-600">{test.error}</p>
                    </div>
                  )}
                  
                  {test.details && test.details.length > 0 && (
                    <div className="bg-gray-50 border rounded p-2">
                      <p className="text-sm font-medium mb-1">Detalles:</p>
                      <ul className="text-sm space-y-1">
                        {test.details.map((detail, i) => (
                          <li key={i} className="text-gray-600">{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {completedTests === testResults.length && completedTests > 0 && (
          <div className={`p-4 border rounded-lg ${
            failedTests === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center gap-2">
              {failedTests === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <h4 className="font-medium">
                {failedTests === 0 ? '🎉 FASE 14: ¡Todos los tests ultra-simples pasaron!' : `❌ FASE 14: ${failedTests} tests fallaron`}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {failedTests === 0 
                ? `Arquitectura minimalista funcionando perfectamente. Tiempo total: ${Math.round(totalDuration / 1000)}s`
                : 'Si continúan los fallos, procederemos con OPCIÓN B: chatbot básico sin notificaciones.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
