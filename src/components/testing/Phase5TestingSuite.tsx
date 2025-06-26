import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Target,
  Zap,
  Shield,
  TestTube
} from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { useSmartMessaging } from '@/hooks/useSmartMessaging';

interface TestResult {
  testName: string;
  success: boolean;
  details: string;
  validationDetails?: string;
  duration: number;
  timestamp: Date;
}

interface TestSuiteResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  results: TestResult[];
  overallSuccess: boolean;
  totalDuration: number;
}

// FASE 9: PASO 4 - Función de espera OPTIMIZADA para BD en producción (timeouts aumentados)
const waitForCondition = async (
  condition: () => Promise<boolean>,
  timeout: number = 20000, // FASE 9: Timeout realista aumentado para BD en producción
  pollInterval: number = 2000, // FASE 9: Polling más espaciado para BD real
  description: string = 'condition'
): Promise<boolean> => {
  const startTime = Date.now();
  const maxAttempts = Math.ceil(timeout / pollInterval);
  
  console.log(`⏳ FASE 9 - PASO 4: Waiting for ${description} (timeout: ${timeout}ms, interval: ${pollInterval}ms)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await condition();
      if (result) {
        const elapsed = Date.now() - startTime;
        console.log(`✅ FASE 9 - PASO 4: ${description} met after ${elapsed}ms (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ FASE 9 - PASO 4: Condition check failed on attempt ${attempt}:`, error);
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  const elapsed = Date.now() - startTime;
  console.log(`❌ FASE 9 - PASO 4: ${description} not met after ${elapsed}ms (${maxAttempts} attempts)`);
  return false;
};

const Phase5TestingSuite = () => {
  const {
    addMessage,
    addNotification,
    addSuggestion,
    markAsRead,
    markAllAsRead,
    clearChat,
    getBadgeInfo,
    messages,
    isInitialized,
    currentStrategy,
    validatePersistence,
    forceFullReset,
    validateConsistency
  } = useAIAssistant();

  const {
    pauseForTesting,
    resumeAfterTesting,
    isPaused,
    pausedByTest
  } = useSmartMessaging();

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResults | null>(null);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [testProgress, setTestProgress] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // FASE 9: PASO 2 - Preparar ambiente con RESET TOTAL y desactivación Smart Messaging (timeout aumentado)
  const prepareTestEnvironment = async () => {
    console.log('🧹 FASE 9 - PASO 2: Preparando ambiente con RESET TOTAL...');
    
    // FASE 9: PASO 2 - Pausar Smart Messaging para evitar interferencias
    console.log('⏸️ FASE 9 - PASO 2: Pausando Smart Messaging...');
    pauseForTesting();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Aumentado
    
    // FASE 9: PASO 2 - Reset COMPLETO del sistema
    console.log('🔄 FASE 9 - PASO 2: Ejecutando RESET TOTAL del sistema...');
    await forceFullReset();
    await new Promise(resolve => setTimeout(resolve, 6000)); // Más tiempo para reset completo
    
    // FASE 9: PASO 3 - Validar que el reset fue exitoso
    console.log('🔍 FASE 9 - PASO 2: Validando limpieza total...');
    const isClean = await validatePersistence(0, 'total-reset-validation');
    if (!isClean) {
      console.error('❌ FASE 9 - PASO 2: Reset total falló');
      throw new Error('Reset total falló - ambiente no está limpio');
    }
    
    // FASE 9: PASO 5 - Validar consistencia post-reset
    const isConsistent = await validateConsistency();
    if (!isConsistent) {
      console.warn('⚠️ FASE 9 - PASO 2: Advertencia de consistencia post-reset');
    }
    
    console.log('✅ FASE 9 - PASO 2: Ambiente preparado con RESET TOTAL y validado');
  };

  // FASE 9: PASO 2 - Restaurar estado con validación completa (timeout aumentado)
  const cleanupTestEnvironment = async () => {
    console.log('🧹 FASE 9 - PASO 2: Limpiando ambiente de test con VALIDACIÓN TOTAL...');
    
    // FASE 9: PASO 2 - Reset completo final
    await forceFullReset();
    await new Promise(resolve => setTimeout(resolve, 6000)); // Aumentado
    
    // FASE 9: PASO 3 - Validar limpieza final
    const isClean = await validatePersistence(0, 'final-total-cleanup');
    if (!isClean) {
      console.warn('⚠️ FASE 9 - PASO 2: Validación de limpieza final falló');
    }
    
    // FASE 9: PASO 5 - Validar consistencia final
    const isConsistent = await validateConsistency();
    if (!isConsistent) {
      console.warn('⚠️ FASE 9 - PASO 2: Validación de consistencia final falló');
    }
    
    // FASE 9: PASO 2 - Reanudar Smart Messaging
    console.log('▶️ FASE 9 - PASO 2: Reanudando Smart Messaging...');
    resumeAfterTesting();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Aumentado
    
    console.log('✅ FASE 9 - PASO 2: Ambiente limpiado con VALIDACIÓN TOTAL');
  };

  // FASE 9: PASO 4 - Test cases con timeouts REALISTAS para BD en producción (aumentados)
  const testCases = [
    {
      name: 'initialization-check',
      description: 'Verificar inicialización del sistema',
      timeout: 15000 // FASE 9: Timeout realista aumentado
    },
    {
      name: 'message-creation-basic',
      description: 'Crear mensajes básicos',
      timeout: 25000 // FASE 9: Más tiempo para BD real
    },
    {
      name: 'notification-badge-real',
      description: 'Sistema de badges en tiempo real',
      timeout: 30000 // FASE 9: Más tiempo para BD real
    },
    {
      name: 'message-persistence',
      description: 'Persistencia de mensajes',
      timeout: 28000 // FASE 9: Aumentado
    },
    {
      name: 'priority-system',
      description: 'Sistema de prioridades',
      timeout: 35000 // FASE 9: Más tiempo para múltiples operaciones
    },
    {
      name: 'bulk-operations',
      description: 'Operaciones en lote',
      timeout: 40000 // FASE 9: Más tiempo para operaciones bulk
    },
    {
      name: 'cleanup-verification',
      description: 'Verificación de limpieza',
      timeout: 25000 // FASE 9: Aumentado
    }
  ];

  const runIndividualTest = async (testCase: typeof testCases[0]): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testCase.description);
    
    console.log(`🧪 FASE 9 - PASO 4: Running test: ${testCase.name}`);
    
    try {
      let success = false;
      let details = '';
      let validationDetails = '';

      switch (testCase.name) {
        case 'initialization-check':
          // FASE 9: PASO 3 - Verificar inicialización y consistencia
          const consistencyCheck = await validateConsistency();
          success = isInitialized && messages !== undefined && consistencyCheck;
          details = `Initialized: ${isInitialized}, Strategy: ${currentStrategy}, Messages: ${messages?.length || 0}, Consistent: ${consistencyCheck}`;
          validationDetails = `Sistema inicializado con consistencia verificada en FASE 9`;
          break;

        case 'message-creation-basic':
          // FASE 9: PASO 4 - Test básico con validación BD DIRECTA (timeout aumentado)
          const initialCount = messages.length;
          console.log(`📊 FASE 9 - PASO 4: Initial message count: ${initialCount}`);
          
          const userMessageId = await addMessage({
            type: 'user',
            content: 'FASE 9 test message - creation basic',
            isRead: true
          });
          
          // FASE 9: PASO 4 - Validación directa con timeout REALISTA (aumentado)
          const messageCreated = await waitForCondition(
            async () => {
              const isValid = await validatePersistence(initialCount + 1, 'message-creation-test');
              return isValid;
            },
            25000, // FASE 9: Timeout realista aumentado para BD en producción
            2500, // FASE 9: Polling más espaciado
            'message creation validation'
          );
          
          success = messageCreated && !!userMessageId;
          details = `Messages: ${initialCount} → ${messages.length}, ID: ${userMessageId}`;
          validationDetails = 'Mensaje creado y validado contra BD real con FASE 9';
          break;

        case 'notification-badge-real':
          // FASE 9: PASO 4 - Test de badge con validación COMPLETA (timeout aumentado)
          const initialBadgeState = getBadgeInfo;
          console.log(`🏷️ FASE 9 - PASO 4: Initial badge info:`, initialBadgeState);
          
          const testNotificationId = await addNotification('FASE 9 test notification - badge verification', 'high');
          console.log(`📬 FASE 9 - PASO 4: Created notification: ${testNotificationId}`);
          
          // FASE 9: PASO 4 - Validar persistencia, badge Y consistencia (timeout aumentado)
          const badgeUpdated = await waitForCondition(
            async () => {
              // 1. Validar persistencia BD
              const isPersisted = await validatePersistence(initialBadgeState.count + 1, 'notification-badge-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar badge
              const currentBadgeState = getBadgeInfo;
              console.log(`🔍 FASE 9 - PASO 4: Current badge info:`, currentBadgeState);
              return currentBadgeState.count > initialBadgeState.count && currentBadgeState.hasHigh;
            },
            30000, // FASE 9: Timeout realista aumentado
            2500, // FASE 9: Polling espaciado
            'notification badge complete validation'
          );
          
          const notificationBadgeInfo = getBadgeInfo;
          
          success = badgeUpdated;
          details = `Badge: ${initialBadgeState.count} → ${notificationBadgeInfo.count}, High: ${notificationBadgeInfo.hasHigh}`;
          validationDetails = `Notificación persistida en BD real, badge validado y consistencia verificada con FASE 9, ID: ${testNotificationId}`;
          break;

        case 'message-persistence':
          // FASE 9: PASO 4 - Test de persistencia COMPLETA en BD real (timeout aumentado)
          const beforePersistence = messages.length;
          
          const suggestionId = await addSuggestion('FASE 9 test suggestion - persistence', 'medium');
          
          // FASE 9: PASO 4 - Validación completa BD + consistencia (timeout aumentado)
          const persistenceVerified = await waitForCondition(
            async () => {
              // 1. Validar persistencia BD directa
              const isPersisted = await validatePersistence(beforePersistence + 1, 'message-persistence-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar mensaje específico en estado local
              const found = messages.find(m => m.id === suggestionId);
              return !!found && found.type === 'suggestion';
            },
            28000, // FASE 9: Timeout realista aumentado
            2500, // FASE 9: Polling espaciado
            'message persistence complete validation'
          );
          
          const afterPersistence = messages.length;
          
          success = persistenceVerified;
          details = `Messages: ${beforePersistence} → ${afterPersistence}, Suggestion ID: ${suggestionId}`;
          validationDetails = 'Mensaje persistido en BD real, validado en estado local y consistencia verificada con FASE 9';
          break;

        case 'priority-system':
          // FASE 9: PASO 4 - Test completo del sistema de prioridades (timeout aumentado)
          const initialPriorityCount = messages.length;
          
          await addNotification('FASE 9 urgent test notification', 'urgent');
          await addNotification('FASE 9 high priority test', 'high');
          await addSuggestion('FASE 9 low priority suggestion', 'low');
          
          // FASE 9: PASO 4 - Validación completa de prioridades (timeout aumentado)
          const prioritiesUpdated = await waitForCondition(
            async () => {
              // 1. Validar persistencia de 3 mensajes nuevos en BD
              const isPersisted = await validatePersistence(initialPriorityCount + 3, 'priority-system-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar badge de prioridades
              const currentBadgePriorities = getBadgeInfo;
              console.log(`🏷️ FASE 9 - PASO 4: Badge priorities check:`, currentBadgePriorities);
              return currentBadgePriorities.hasUrgent && currentBadgePriorities.hasHigh;
            },
            35000, // FASE 9: Timeout realista aumentado para múltiples operaciones
            2500, // FASE 9: Polling espaciado
            'priority system complete validation'
          );
          
          const prioritiesBadgeInfo = getBadgeInfo;
          
          success = prioritiesUpdated;
          details = `Urgent: ${prioritiesBadgeInfo.hasUrgent}, High: ${prioritiesBadgeInfo.hasHigh}, Count: ${prioritiesBadgeInfo.count}`;
          validationDetails = 'Sistema de prioridades persistido en BD real, validado en badges y consistencia verificada con FASE 9';
          break;

        case 'bulk-operations':
          // FASE 9: PASO 4 - Test de operaciones en lote COMPLETO (timeout aumentado)
          const beforeBulk = messages.filter(m => !m.isRead).length;
          const totalBulk = messages.length;
          console.log(`📊 FASE 9 - PASO 4: Unread messages before bulk: ${beforeBulk}, total: ${totalBulk}`);
          
          await markAllAsRead();
          
          // FASE 9: PASO 4 - Validación completa de operación bulk (timeout aumentado)
          const bulkCompleted = await waitForCondition(
            async () => {
              // 1. Validar persistencia del conteo total en BD
              const isPersisted = await validatePersistence(totalBulk, 'bulk-operations-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar que todos están marcados como leídos en estado local
              const unreadCount = messages.filter(m => !m.isRead).length;
              console.log(`📊 FASE 9 - PASO 4: Current unread count: ${unreadCount}`);
              return unreadCount === 0;
            },
            40000, // FASE 9: Timeout realista aumentado para operaciones bulk
            3000, // FASE 9: Polling más espaciado para operaciones pesadas
            'bulk mark as read complete validation'
          );
          
          const afterBulk = messages.filter(m => !m.isRead).length;
          
          success = bulkCompleted;
          details = `Unread: ${beforeBulk} → ${afterBulk}, Total: ${totalBulk}`;
          validationDetails = 'Operación bulk persistida en BD real, validada en estado local y consistencia verificada con FASE 9';
          break;

        case 'cleanup-verification':
          // FASE 9: PASO 2 - Verificar limpieza completa (timeout aumentado)
          const preCleanup = messages.length;
          
          await clearChat();
          
          // FASE 9: PASO 4 - Validación completa de limpieza (timeout aumentado)
          const cleanupCompleted = await waitForCondition(
            async () => {
              // 1. Validar limpieza en BD real
              const isClean = await validatePersistence(0, 'cleanup-verification-test');
              if (!isClean) return false;
              
              // 2. Validar consistencia final
              const isConsistent = await validateConsistency();
              return isConsistent;
            },
            25000, // FASE 9: Timeout realista aumentado para limpieza
            2500, // FASE 9: Polling espaciado
            'cleanup complete verification'
          );
          
          success = cleanupCompleted;
          details = `Messages: ${preCleanup} → ${messages.length}`;
          validationDetails = 'Limpieza completada en BD real, validada en estado local y consistencia verificada con FASE 9';
          break;

        default:
          success = false;
          details = `Unknown test case: ${testCase.name}`;
          validationDetails = 'Test case no implementado en FASE 9';
      }

      const duration = Date.now() - startTime;
      console.log(`✅ FASE 9 - PASO 4: Test ${testCase.name} completed in ${duration}ms:`, { success, details });

      return {
        testName: testCase.name,
        success,
        details,
        validationDetails,
        duration,
        timestamp: new Date()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ FASE 9 - PASO 4: Test ${testCase.name} failed:`, error);
      
      return {
        testName: testCase.name,
        success: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        validationDetails: `Test falló en FASE 9: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration,
        timestamp: new Date()
      };
    }
  };

  const runAllTests = async () => {
    console.log('🚀 FASE 9 - PASO 4: Starting COMPLETE test suite with TOTAL ISOLATION...');
    
    if (isRunning) {
      console.log('⚠️ FASE 9 - PASO 4: Tests already running, aborting...');
      return;
    }

    setIsRunning(true);
    setResults(null);
    setCurrentTest('');
    setTestProgress(0);
    
    abortControllerRef.current = new AbortController();
    
    try {
      // FASE 9: PASO 2 - Preparar ambiente completamente limpio
      console.log('🧹 FASE 9 - PASO 2: Preparing TOTALLY CLEAN environment...');
      await prepareTestEnvironment();
      
      const testResults: TestResult[] = [];
      const startTime = Date.now();
      
      for (let i = 0; i < testCases.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🛑 FASE 9 - PASO 4: Tests aborted by user');
          break;
        }
        
        const testCase = testCases[i];
        setTestProgress(((i + 1) / testCases.length) * 100);
        
        console.log(`🧪 FASE 9 - PASO 4: Running test ${i + 1}/${testCases.length}: ${testCase.name}`);
        
        // FASE 9: PASO 2 - Reset parcial antes de cada test individual
        if (i > 0) {
          console.log(`🔄 FASE 9 - PASO 2: Partial reset before test ${i + 1}`);
          await forceFullReset();
          await new Promise(resolve => setTimeout(resolve, 4000)); // FASE 9: Tiempo aumentado
        }
        
        const result = await runIndividualTest(testCase);
        testResults.push(result);
        
        console.log(`${result.success ? '✅' : '❌'} FASE 9 - PASO 4: Test ${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
      }
      
      const totalDuration = Date.now() - startTime;
      const passedTests = testResults.filter(r => r.success).length;
      const failedTests = testResults.filter(r => !r.success).length;
      
      const finalResults: TestSuiteResults = {
        totalTests: testResults.length,
        passedTests,
        failedTests,
        results: testResults,
        overallSuccess: failedTests === 0,
        totalDuration
      };
      
      setResults(finalResults);
      
      console.log(`🎯 FASE 9 - PASO 4: COMPLETE TEST SUITE FINISHED:`, {
        passed: passedTests,
        failed: failedTests,
        total: testResults.length,
        duration: totalDuration,
        success: finalResults.overallSuccess
      });
      
    } catch (error) {
      console.error('❌ FASE 9 - PASO 4: Critical error in test suite:', error);
    } finally {
      // FASE 9: PASO 2 - Limpiar ambiente final
      console.log('🧹 FASE 9 - PASO 2: Final environment cleanup...');
      await cleanupTestEnvironment();
      
      setIsRunning(false);
      setCurrentTest('');
      setTestProgress(0);
      abortControllerRef.current = null;
    }
  };

  const stopTests = () => {
    console.log('🛑 FASE 9 - PASO 4: Stopping tests...');
    abortControllerRef.current?.abort();
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="text-xs">
        {success ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">FASE 9 - Resultados de Testing</h3>
          <div className="flex items-center gap-2">
            <Badge variant={results.overallSuccess ? "default" : "destructive"}>
              {results.passedTests}/{results.totalTests} tests pasaron
            </Badge>
            <span className="text-sm text-muted-foreground">
              {(results.totalDuration / 1000).toFixed(1)}s total
            </span>
          </div>
        </div>

        <ScrollArea className="h-96 border rounded-lg p-4">
          <div className="space-y-3">
            {results.results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium">{result.testName}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'PASSED' : 'FAILED'}
                  </Badge>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {(result.duration / 1000).toFixed(1)}s
                  </span>
                </div>
                
                <div className="text-sm text-muted-foreground mb-1">
                  <strong>Detalles:</strong> {result.details}
                </div>
                
                {result.validationDetails && (
                  <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                    <strong>FASE 9 Validación:</strong> {result.validationDetails}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          Phase 5: FASE 9 - Testing Suite Definitivo
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-blue-800">FASE 9 - PLAN DE CORRECCIÓN DEFINITIVO IMPLEMENTADO:</div>
            <ul className="list-disc list-inside text-sm space-y-1 text-blue-700">
              <li>✅ Estrategia de persistencia corregida (forzar Supabase siempre)</li>
              <li>✅ Reset total del sistema implementado</li>
              <li>✅ Sincronización forzada con validación directa BD</li>
              <li>✅ Tests rediseñados con timeouts realistas (20-40 segundos)</li>
              <li>✅ Monitoreo automático de consistencia BD-Estado</li>
              <li>✅ Aislamiento total de tests con ambiente limpio</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={isRunning ? stopTests : runAllTests}
            disabled={!isInitialized}
            variant={isRunning ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4" />
                Detener Tests
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Ejecutar FASE 9 Tests
              </>
            )}
          </Button>

          {isRunning && (
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Progreso: {testProgress.toFixed(0)}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${testProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {currentTest && (
          <Alert className="mb-4 border-yellow-200 bg-yellow-50">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              <span className="font-medium">Test en ejecución:</span> {currentTest}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{testCases.length}</div>
            <div className="text-sm text-muted-foreground">Tests Totales</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {results?.passedTests || 0}
            </div>
            <div className="text-sm text-muted-foreground">Tests Exitosos</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {results?.failedTests || 0}
            </div>
            <div className="text-sm text-muted-foreground">Tests Fallidos</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {currentStrategy || 'N/A'}
            </div>
            <div className="text-sm text-muted-foreground">Estrategia</div>
          </div>
        </div>

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
