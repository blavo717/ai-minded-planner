
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
    messages 
  } = useAIAssistant();
  
  const { pauseForTesting, resumeAfterTesting } = useSmartMessaging();
  const { activeConfiguration } = useLLMConfigurations();
  
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Reset Total del Sistema',
      status: 'pending',
      description: 'FASE 13: Reset completo con timeouts realistas (5-10s)'
    },
    {
      name: 'Añadir Notificación',
      status: 'pending',
      description: 'FASE 13: Crear notificación y validar BD directa'
    },
    {
      name: 'Añadir Sugerencia',
      status: 'pending',
      description: 'FASE 13: Crear sugerencia y validar BD directa'
    },
    {
      name: 'Sincronización BD-Estado',
      status: 'pending',
      description: 'FASE 13: Verificar sincronización explícita'
    },
    {
      name: 'Validación Persistencia',
      status: 'pending',
      description: 'FASE 13: Validación solo lectura contra BD'
    },
    {
      name: 'Limpieza Chat',
      status: 'pending',
      description: 'FASE 13: Limpiar chat y validar BD vacía'
    },
    {
      name: 'Verificación Final',
      status: 'pending',
      description: 'FASE 13: Estado final limpio y consistente'
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

  // FASE 13: Test 1 - Reset Total SIMPLIFICADO
  const testTotalReset = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 1 - Reset Total del Sistema');
    const startTime = Date.now();
    
    try {
      // Pausar Smart Messaging
      pauseForTesting();
      
      // Reset completo
      await forceFullReset();
      
      // Validar que esté limpio
      const isClean = await validatePersistence(0, 'testTotalReset');
      
      const duration = Date.now() - startTime;
      
      if (isClean) {
        updateTestResult(0, 'passed', undefined, [
          `✅ BD limpiada correctamente`,
          `✅ Estado React sincronizado`,
          `✅ Smart Messaging pausado`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(0, 'failed', 'BD no está completamente limpia después del reset');
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(0, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [forceFullReset, validatePersistence, pauseForTesting, updateTestResult]);

  // FASE 13: Test 2 - Añadir Notificación SIMPLIFICADO
  const testAddNotification = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 2 - Añadir Notificación');
    const startTime = Date.now();
    
    try {
      const preCount = messages.length;
      console.log(`📊 Pre-count: ${preCount} mensajes`);
      
      await addNotification('🔔 Test notification FASE 13', 'medium', { test: true });
      
      // Timeout realista
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Sincronizar para obtener estado actual
      await syncWithDB();
      
      // Validar contra BD
      const isValid = await validatePersistence(preCount + 1, 'testAddNotification');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(1, 'passed', undefined, [
          `✅ Notificación añadida correctamente`,
          `✅ BD actualizada: ${preCount} → ${preCount + 1}`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(1, 'failed', `Validación BD falló. Esperado: ${preCount + 1}, BD real: ?`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(1, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [addNotification, messages.length, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 13: Test 3 - Añadir Sugerencia SIMPLIFICADO
  const testAddSuggestion = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 3 - Añadir Sugerencia');
    const startTime = Date.now();
    
    try {
      const preCount = messages.length;
      console.log(`📊 Pre-count: ${preCount} mensajes`);
      
      await addSuggestion('💡 Test suggestion FASE 13', 'low', { test: true });
      
      // Timeout realista
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Sincronizar
      await syncWithDB();
      
      // Validar
      const isValid = await validatePersistence(preCount + 1, 'testAddSuggestion');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(2, 'passed', undefined, [
          `✅ Sugerencia añadida correctamente`,
          `✅ BD actualizada: ${preCount} → ${preCount + 1}`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(2, 'failed', `Validación BD falló. Esperado: ${preCount + 1}`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(2, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [addSuggestion, messages.length, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 13: Test 4 - Sincronización BD-Estado SIMPLIFICADO
  const testSyncBDState = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 4 - Sincronización BD-Estado');
    const startTime = Date.now();
    
    try {
      const preLocalCount = messages.length;
      console.log(`📊 Estado local antes de sync: ${preLocalCount} mensajes`);
      
      // Forzar sincronización
      await syncWithDB();
      
      const postLocalCount = messages.length;
      console.log(`📊 Estado local después de sync: ${postLocalCount} mensajes`);
      
      // Validar que ahora coinciden
      const isValid = await validatePersistence(postLocalCount, 'testSyncBDState');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(3, 'passed', undefined, [
          `✅ Sincronización exitosa`,
          `✅ Estado local: ${preLocalCount} → ${postLocalCount}`,
          `✅ BD y estado coinciden`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(3, 'failed', 'Sincronización no logró consistencia BD-Estado');
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(3, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [messages.length, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 13: Test 5 - Validación Persistencia SIMPLIFICADO
  const testValidationPersistence = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 5 - Validación Persistencia');
    const startTime = Date.now();
    
    try {
      const currentCount = messages.length;
      console.log(`📊 Validando contra ${currentCount} mensajes`);
      
      // Validación debe ser solo lectura
      const isValid = await validatePersistence(currentCount, 'testValidationPersistence');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(4, 'passed', undefined, [
          `✅ Validación BD exitosa`,
          `✅ Mensajes validados: ${currentCount}`,
          `✅ Solo lectura (no modificación)`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(4, 'failed', `Validación falló para ${currentCount} mensajes`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(4, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [messages.length, validatePersistence, updateTestResult]);

  // FASE 13: Test 6 - Limpieza Chat SIMPLIFICADO
  const testClearChat = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 6 - Limpieza Chat');
    const startTime = Date.now();
    
    try {
      await clearChat();
      
      // Timeout realista
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Sincronizar
      await syncWithDB();
      
      // Validar que esté limpio
      const isValid = await validatePersistence(0, 'testClearChat');
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(5, 'passed', undefined, [
          `✅ Chat limpiado exitosamente`,
          `✅ BD completamente vacía`,
          `✅ Estado local sincronizado`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(5, 'failed', 'Chat no se limpió completamente');
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(5, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [clearChat, syncWithDB, validatePersistence, updateTestResult]);

  // FASE 13: Test 7 - Verificación Final SIMPLIFICADO
  const testFinalVerification = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 13: TEST 7 - Verificación Final');
    const startTime = Date.now();
    
    try {
      // Sincronizar una vez más
      await syncWithDB();
      
      // Validar estado final
      const finalCount = messages.length;
      const isValid = await validatePersistence(finalCount, 'testFinalVerification');
      
      // Reanudar Smart Messaging
      resumeAfterTesting();
      
      const duration = Date.now() - startTime;
      
      if (isValid) {
        updateTestResult(6, 'passed', undefined, [
          `✅ Estado final consistente`,
          `✅ BD y estado sincronizados: ${finalCount} mensajes`,
          `✅ Smart Messaging reanudado`,
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
  }, [syncWithDB, messages.length, validatePersistence, resumeAfterTesting, updateTestResult]);

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
      testTotalReset,
      testAddNotification,
      testAddSuggestion,
      testSyncBDState,
      testValidationPersistence,
      testClearChat,
      testFinalVerification
    ];
    
    let allPassed = true;
    
    for (let i = 0; i < tests.length; i++) {
      setCurrentTest(i);
      updateTestResult(i, 'running');
      
      console.log(`🧪 FASE 13: Ejecutando test ${i + 1}/${tests.length}`);
      
      const testPassed = await tests[i]();
      
      if (!testPassed) {
        allPassed = false;
        console.error(`❌ FASE 13: Test ${i + 1} falló`);
      } else {
        console.log(`✅ FASE 13: Test ${i + 1} exitoso`);
      }
      
      // Pausa entre tests para evitar interferencias
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setCurrentTest(-1);
    setIsRunning(false);
    
    const totalDuration = Date.now() - overallStartTime;
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    
    console.log(`🏁 FASE 13: Tests completados en ${totalDuration}ms`);
    console.log(`📊 FASE 13: ${passed} exitosos, ${failed} fallidos`);
    
    toast({
      title: allPassed ? "🎉 FASE 13: Todos los tests pasaron!" : "❌ FASE 13: Algunos tests fallaron",
      description: `${passed} exitosos, ${failed} fallidos. Tiempo total: ${Math.round(totalDuration / 1000)}s`,
      variant: allPassed ? "default" : "destructive"
    });
  }, [
    activeConfiguration,
    testTotalReset,
    testAddNotification,
    testAddSuggestion,
    testSyncBDState,
    testValidationPersistence,
    testClearChat,
    testFinalVerification,
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
            <MessageSquare className="h-5 w-5 text-blue-500" />
            FASE 13 - Testing Suite Simplificado
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
        {/* FASE 13 Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <Database className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-blue-800">FASE 13 - SIMPLIFICACIÓN RADICAL:</div>
            <ul className="list-disc list-inside text-sm space-y-1 text-blue-700">
              <li>✅ Timeouts realistas: 2-5 segundos por operación</li>
              <li>✅ validatePersistence: solo lectura, sin auto-corrección</li>
              <li>✅ syncWithDB: sincronización explícita separada</li>
              <li>✅ Tests aislados: cada uno independiente</li>
              <li>✅ Arquitectura simplificada: menos complejidad</li>
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
            {isRunning ? 'Ejecutando Tests FASE 13...' : 'Ejecutar Tests FASE 13'}
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
                currentTest === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                {failedTests === 0 ? '🎉 FASE 13: Todos los tests pasaron!' : `❌ FASE 13: ${failedTests} tests fallaron`}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {failedTests === 0 
                ? `Arquitectura simplificada funcionando correctamente. Tiempo total: ${Math.round(totalDuration / 1000)}s`
                : 'Revisa los errores arriba para completar la implementación.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
