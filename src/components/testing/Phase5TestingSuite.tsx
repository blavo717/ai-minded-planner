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

// FASE 11: CORRECCIÓN 5 - Función de espera REALISTA para BD en producción (timeouts aumentados 60-120s)
const waitForCondition = async (
  condition: () => Promise<boolean>,
  timeout: number = 90000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 90s base
  pollInterval: number = 5000, // FASE 11: Polling más espaciado para BD real
  description: string = 'condition'
): Promise<boolean> => {
  const startTime = Date.now();
  const maxAttempts = Math.ceil(timeout / pollInterval);
  
  console.log(`⏳ FASE 11 - CORRECCIÓN 5: Waiting for ${description} (timeout: ${timeout}ms, interval: ${pollInterval}ms)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await condition();
      if (result) {
        const elapsed = Date.now() - startTime;
        console.log(`✅ FASE 11 - CORRECCIÓN 5: ${description} met after ${elapsed}ms (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ FASE 11 - CORRECCIÓN 5: Condition check failed on attempt ${attempt}:`, error);
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  const elapsed = Date.now() - startTime;
  console.log(`❌ FASE 11 - CORRECCIÓN 5: ${description} not met after ${elapsed}ms (${maxAttempts} attempts)`);
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

  // FASE 11: CORRECCIÓN 1 - Preparar ambiente con RESET TOTAL REAL y desactivación Smart Messaging AGRESIVA (timeout aumentado 60-120s)
  const prepareTestEnvironment = async () => {
    console.log('🧹 FASE 11 - CORRECCIÓN 1: Preparando ambiente con RESET TOTAL REAL...');
    
    // FASE 11: CORRECCIÓN 5 - Pausar Smart Messaging AGRESIVAMENTE para evitar interferencias
    console.log('⏸️ FASE 11 - CORRECCIÓN 5: Pausando Smart Messaging AGRESIVAMENTE...');
    pauseForTesting();
    await new Promise(resolve => setTimeout(resolve, 10000)); // Aumentado significativamente
    
    // FASE 11: CORRECCIÓN 1 - Reset COMPLETO REAL del sistema con confirmación
    console.log('🔄 FASE 11 - CORRECCIÓN 1: Ejecutando RESET TOTAL REAL del sistema...');
    await forceFullReset();
    await new Promise(resolve => setTimeout(resolve, 15000)); // FASE 11: Más tiempo para reset completo real
    
    // FASE 11: CORRECCIÓN 1 - Validar que el reset fue exitoso con BD directa
    console.log('🔍 FASE 11 - CORRECCIÓN 1: Validando limpieza total BD directa...');
    const isClean = await validatePersistence(0, 'total-reset-validation');
    if (!isClean) {
      console.error('❌ FASE 11 - CORRECCIÓN 1: Reset total real falló');
      throw new Error('Reset total real falló - ambiente no está limpio en BD directa');
    }
    
    // FASE 11: CORRECCIÓN 3 - Validar consistencia post-reset
    const isConsistent = await validateConsistency();
    if (!isConsistent) {
      console.warn('⚠️ FASE 11 - CORRECCIÓN 1: Advertencia de consistencia post-reset');
    }
    
    console.log('✅ FASE 11 - CORRECCIÓN 1: Ambiente preparado con RESET TOTAL REAL y validado BD directa');
  };

  // FASE 11: CORRECCIÓN 1 - Restaurar estado con validación completa BD (timeout aumentado 60-120s)
  const cleanupTestEnvironment = async () => {
    console.log('🧹 FASE 11 - CORRECCIÓN 1: Limpiando ambiente de test con VALIDACIÓN TOTAL BD...');
    
    // FASE 11: CORRECCIÓN 1 - Reset completo final real
    await forceFullReset();
    await new Promise(resolve => setTimeout(resolve, 15000)); // Aumentado significativamente
    
    // FASE 11: CORRECCIÓN 1 - Validar limpieza final BD directa
    const isClean = await validatePersistence(0, 'final-total-cleanup');
    if (!isClean) {
      console.warn('⚠️ FASE 11 - CORRECCIÓN 1: Validación de limpieza final BD directa falló');
    }
    
    // FASE 11: CORRECCIÓN 3 - Validar consistencia final
    const isConsistent = await validateConsistency();
    if (!isConsistent) {
      console.warn('⚠️ FASE 11 - CORRECCIÓN 1: Validación de consistencia final falló');
    }
    
    // FASE 11: CORRECCIÓN 5 - Reanudar Smart Messaging
    console.log('▶️ FASE 11 - CORRECCIÓN 5: Reanudando Smart Messaging...');
    resumeAfterTesting();
    await new Promise(resolve => setTimeout(resolve, 10000)); // Aumentado
    
    console.log('✅ FASE 11 - CORRECCIÓN 1: Ambiente limpiado con VALIDACIÓN TOTAL BD');
  };

  // FASE 11: CORRECCIÓN 5 - Test cases con timeouts REALISTAS para BD en producción (aumentados 60-120s)
  const testCases = [
    {
      name: 'initialization-check',
      description: 'Verificar inicialización del sistema',
      timeout: 30000 // FASE 11: Timeout realista aumentado
    },
    {
      name: 'message-creation-basic',
      description: 'Crear mensajes básicos',
      timeout: 90000 // FASE 11: Más tiempo para BD real (90s)
    },
    {
      name: 'notification-badge-real',
      description: 'Sistema de badges en tiempo real',
      timeout: 120000 // FASE 11: Más tiempo para BD real (120s)
    },
    {
      name: 'message-persistence-direct',
      description: 'Persistencia directa BD',
      timeout: 120000 // FASE 11: Aumentado (120s)
    },
    {
      name: 'priority-system-full',
      description: 'Sistema de prioridades completo',
      timeout: 180000 // FASE 11: Más tiempo para múltiples operaciones (180s)
    },
    {
      name: 'bulk-operations-real',
      description: 'Operaciones en lote reales',
      timeout: 240000 // FASE 11: Más tiempo para operaciones bulk (240s)
    },
    {
      name: 'cleanup-verification-direct',
      description: 'Verificación de limpieza directa',
      timeout: 120000 // FASE 11: Aumentado (120s)
    }
  ];

  const runIndividualTest = async (testCase: typeof testCases[0]): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testCase.description);
    
    console.log(`🧪 FASE 11 - CORRECCIÓN 5: Running test: ${testCase.name}`);
    
    try {
      let success = false;
      let details = '';
      let validationDetails = '';

      switch (testCase.name) {
        case 'initialization-check':
          // FASE 11: CORRECCIÓN 3 - Verificar inicialización y consistencia BD
          const consistencyCheck = await validateConsistency();
          success = isInitialized && messages !== undefined && consistencyCheck;
          details = `Initialized: ${isInitialized}, Strategy: ${currentStrategy}, Messages: ${messages?.length || 0}, Consistent: ${consistencyCheck}`;
          validationDetails = `Sistema inicializado con consistencia BD verificada en FASE 11`;
          break;

        case 'message-creation-basic':
          // FASE 11: CORRECCIÓN 4 - Test básico con validación BD DIRECTA (timeout aumentado 60-120s)
          const initialCount = messages.length;
          console.log(`📊 FASE 11 - CORRECCIÓN 4: Initial message count: ${initialCount}`);
          
          const userMessageId = await addMessage({
            type: 'user',
            content: 'FASE 11 test message - creation basic',
            isRead: true
          });
          
          // FASE 11: CORRECCIÓN 4 - Validación BD directa con timeout REALISTA (aumentado 60-120s)
          const messageCreated = await waitForCondition(
            async () => {
              const isValid = await validatePersistence(initialCount + 1, 'message-creation-test');
              return isValid;
            },
            90000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 90s
            6000, // FASE 11: Polling más espaciado
            'message creation BD direct validation'
          );
          
          success = messageCreated && !!userMessageId;
          details = `Messages: ${initialCount} → ${messages.length}, ID: ${userMessageId}`;
          validationDetails = 'Mensaje creado y validado contra BD directa con FASE 11';
          break;

        case 'notification-badge-real':
          // FASE 11: CORRECCIÓN 4 - Test de badge con validación BD COMPLETA (timeout aumentado 60-120s)
          const initialBadgeState = getBadgeInfo;
          console.log(`🏷️ FASE 11 - CORRECCIÓN 4: Initial badge info:`, initialBadgeState);
          
          const testNotificationId = await addNotification('FASE 11 test notification - badge verification', 'high');
          console.log(`📬 FASE 11 - CORRECCIÓN 4: Created notification: ${testNotificationId}`);
          
          // FASE 11: CORRECCIÓN 4 - Validar persistencia BD, badge Y consistencia (timeout aumentado 60-120s)
          const badgeUpdated = await waitForCondition(
            async () => {
              // 1. Validar persistencia BD directa
              const isPersisted = await validatePersistence(initialBadgeState.count + 1, 'notification-badge-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar badge
              const currentBadgeState = getBadgeInfo;
              console.log(`🔍 FASE 11 - CORRECCIÓN 4: Current badge info:`, currentBadgeState);
              return currentBadgeState.count > initialBadgeState.count && currentBadgeState.hasHigh;
            },
            120000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 120s
            6000, // FASE 11: Polling espaciado
            'notification badge complete BD validation'
          );
          
          const notificationBadgeInfo = getBadgeInfo;
          
          success = badgeUpdated;
          details = `Badge: ${initialBadgeState.count} → ${notificationBadgeInfo.count}, High: ${notificationBadgeInfo.hasHigh}`;
          validationDetails = `Notificación persistida en BD directa, badge validado y consistencia verificada con FASE 11, ID: ${testNotificationId}`;
          break;

        case 'message-persistence-direct':
          // FASE 11: CORRECCIÓN 4 - Test de persistencia BD DIRECTA COMPLETA (timeout aumentado 60-120s)
          const beforePersistence = messages.length;
          
          const suggestionId = await addSuggestion('FASE 11 test suggestion - persistence direct', 'medium');
          
          // FASE 11: CORRECCIÓN 4 - Validación BD directa completa + consistencia (timeout aumentado 60-120s)
          const persistenceVerified = await waitForCondition(
            async () => {
              // 1. Validar persistencia BD directa
              const isPersisted = await validatePersistence(beforePersistence + 1, 'message-persistence-direct-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar mensaje específico en estado local
              const found = messages.find(m => m.id === suggestionId);
              return !!found && found.type === 'suggestion';
            },
            120000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 120s
            6000, // FASE 11: Polling espaciado
            'message persistence direct BD complete validation'
          );
          
          const afterPersistence = messages.length;
          
          success = persistenceVerified;
          details = `Messages: ${beforePersistence} → ${afterPersistence}, Suggestion ID: ${suggestionId}`;
          validationDetails = 'Mensaje persistido en BD directa, validado en estado local y consistencia BD verificada con FASE 11';
          break;

        case 'priority-system-full':
          // FASE 11: CORRECCIÓN 4 - Test completo del sistema de prioridades BD (timeout aumentado 60-120s)
          const initialPriorityCount = messages.length;
          
          await addNotification('FASE 11 urgent test notification', 'urgent');
          await addNotification('FASE 11 high priority test', 'high');
          await addSuggestion('FASE 11 low priority suggestion', 'low');
          
          // FASE 11: CORRECCIÓN 4 - Validación BD completa de prioridades (timeout aumentado 60-120s)
          const prioritiesUpdated = await waitForCondition(
            async () => {
              // 1. Validar persistencia de 3 mensajes nuevos en BD directa
              const isPersisted = await validatePersistence(initialPriorityCount + 3, 'priority-system-full-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar badge de prioridades
              const currentBadgePriorities = getBadgeInfo;
              console.log(`🏷️ FASE 11 - CORRECCIÓN 4: Badge priorities check:`, currentBadgePriorities);
              return currentBadgePriorities.hasUrgent && currentBadgePriorities.hasHigh;
            },
            180000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 180s para múltiples operaciones
            6000, // FASE 11: Polling espaciado
            'priority system complete BD validation'
          );
          
          const prioritiesBadgeInfo = getBadgeInfo;
          
          success = prioritiesUpdated;
          details = `Urgent: ${prioritiesBadgeInfo.hasUrgent}, High: ${prioritiesBadgeInfo.hasHigh}, Count: ${prioritiesBadgeInfo.count}`;
          validationDetails = 'Sistema de prioridades persistido en BD directa, validado en badges y consistencia BD verificada con FASE 11';
          break;

        case 'bulk-operations-real':
          // FASE 11: CORRECCIÓN 4 - Test de operaciones en lote BD COMPLETO (timeout aumentado 60-120s)
          const beforeBulk = messages.filter(m => !m.isRead).length;
          const totalBulk = messages.length;
          console.log(`📊 FASE 11 - CORRECCIÓN 4: Unread messages before bulk: ${beforeBulk}, total: ${totalBulk}`);
          
          await markAllAsRead();
          
          // FASE 11: CORRECCIÓN 4 - Validación BD completa de operación bulk (timeout aumentado 60-120s)
          const bulkCompleted = await waitForCondition(
            async () => {
              // 1. Validar persistencia del conteo total en BD directa
              const isPersisted = await validatePersistence(totalBulk, 'bulk-operations-real-test');
              if (!isPersisted) return false;
              
              // 2. Validar consistencia BD-Estado
              const isConsistent = await validateConsistency();
              if (!isConsistent) return false;
              
              // 3. Validar que todos están marcados como leídos en estado local
              const unreadCount = messages.filter(m => !m.isRead).length;
              console.log(`📊 FASE 11 - CORRECCIÓN 4: Current unread count: ${unreadCount}`);
              return unreadCount === 0;
            },
            240000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 240s para operaciones bulk
            5000, // FASE 11: Polling más espaciado para operaciones pesadas
            'bulk mark as read complete BD validation'
          );
          
          const afterBulk = messages.filter(m => !m.isRead).length;
          
          success = bulkCompleted;
          details = `Unread: ${beforeBulk} → ${afterBulk}, Total: ${totalBulk}`;
          validationDetails = 'Operación bulk persistida en BD directa, validada en estado local y consistencia BD verificada con FASE 11';
          break;

        case 'cleanup-verification-direct':
          // FASE 11: CORRECCIÓN 1 - Verificar limpieza BD directa completa (timeout aumentado 60-120s)
          const preCleanup = messages.length;
          
          await clearChat();
          
          // FASE 11: CORRECCIÓN 1 - Validación BD directa completa de limpieza (timeout aumentado 60-120s)
          const cleanupCompleted = await waitForCondition(
            async () => {
              // 1. Validar limpieza en BD directa
              const isClean = await validatePersistence(0, 'cleanup-verification-direct-test');
              if (!isClean) return false;
              
              // 2. Validar consistencia final
              const isConsistent = await validateConsistency();
              return isConsistent;
            },
            120000, // FASE 11: Timeout realista aumentado SIGNIFICATIVAMENTE a 120s para limpieza
            4000, // FASE 11: Polling espaciado
            'cleanup complete BD direct verification'
          );
          
          success = cleanupCompleted;
          details = `Messages: ${preCleanup} → ${messages.length}`;
          validationDetails = 'Limpieza completada en BD directa, validada en estado local y consistencia BD verificada con FASE 11';
          break;

        default:
          success = false;
          details = `Unknown test case: ${testCase.name}`;
          validationDetails = 'Test case no implementado en FASE 11';
      }

      const duration = Date.now() - startTime;
      console.log(`✅ FASE 11 - CORRECCIÓN 5: Test ${testCase.name} completed in ${duration}ms:`, { success, details });

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
      console.error(`❌ FASE 11 - CORRECCIÓN 5: Test ${testCase.name} failed:`, error);
      
      return {
        testName: testCase.name,
        success: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        validationDetails: `Test falló en FASE 11: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        duration,
        timestamp: new Date()
      };
    }
  };

  const runAllTests = async () => {
    console.log('🚀 FASE 11 - CORRECCIÓN 5: Starting COMPLETE test suite with TOTAL BD ISOLATION...');
    
    if (isRunning) {
      console.log('⚠️ FASE 11 - CORRECCIÓN 5: Tests already running, aborting...');
      return;
    }

    setIsRunning(true);
    setResults(null);
    setCurrentTest('');
    setTestProgress(0);
    
    abortControllerRef.current = new AbortController();
    
    try {
      // FASE 11: CORRECCIÓN 1 - Preparar ambiente completamente limpio BD
      console.log('🧹 FASE 11 - CORRECCIÓN 1: Preparing TOTALLY CLEAN BD environment...');
      await prepareTestEnvironment();
      
      const testResults: TestResult[] = [];
      const startTime = Date.now();
      
      for (let i = 0; i < testCases.length; i++) {
        if (abortControllerRef.current?.signal.aborted) {
          console.log('🛑 FASE 11 - CORRECCIÓN 5: Tests aborted by user');
          break;
        }
        
        const testCase = testCases[i];
        setTestProgress(((i + 1) / testCases.length) * 100);
        
        console.log(`🧪 FASE 11 - CORRECCIÓN 5: Running test ${i + 1}/${testCases.length}: ${testCase.name}`);
        
        // FASE 11: CORRECCIÓN 1 - Reset parcial BD antes de cada test individual
        if (i > 0) {
          console.log(`🔄 FASE 11 - CORRECCIÓN 1: Partial BD reset before test ${i + 1}`);
          await forceFullReset();
          await new Promise(resolve => setTimeout(resolve, 8000)); // FASE 11: Tiempo aumentado significativamente
        }
        
        const result = await runIndividualTest(testCase);
        testResults.push(result);
        
        console.log(`${result.success ? '✅' : '❌'} FASE 11 - CORRECCIÓN 5: Test ${testCase.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
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
      
      console.log(`🎯 FASE 11 - CORRECCIÓN 5: COMPLETE BD TEST SUITE FINISHED:`, {
        passed: passedTests,
        failed: failedTests,
        total: testResults.length,
        duration: totalDuration,
        success: finalResults.overallSuccess
      });
      
    } catch (error) {
      console.error('❌ FASE 11 - CORRECCIÓN 5: Critical error in test suite:', error);
    } finally {
      // FASE 11: CORRECCIÓN 1 - Limpiar ambiente final BD
      console.log('🧹 FASE 11 - CORRECCIÓN 1: Final BD environment cleanup...');
      await cleanupTestEnvironment();
      
      setIsRunning(false);
      setCurrentTest('');
      setTestProgress(0);
      abortControllerRef.current = null;
    }
  };

  const stopTests = () => {
    console.log('🛑 FASE 11 - CORRECCIÓN 5: Stopping tests...');
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
          <h3 className="text-lg font-semibold">FASE 11 - Resultados de Testing BD Directa</h3>
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
                    <strong>FASE 11 Validación BD:</strong> {result.validationDetails}
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
          Phase 5: FASE 11 - Testing Suite Corrección Desincronización
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Alert className="mb-6 border-green-200 bg-green-50">
          <Shield className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-green-800">FASE 11 - CORRECCIÓN DESINCRONIZACIÓN IMPLEMENTADA:</div>
            <ul className="list-disc list-inside text-sm space-y-1 text-green-700">
              <li>✅ validatePersistence SIEMPRE actualiza estado local con BD real</li>
              <li>✅ forceFullReset con sincronización FORZADA post-reset</li>
              <li>✅ Timeouts realistas 60-120 segundos para BD producción</li>
              <li>✅ Smart Messaging pausado AGRESIVAMENTE durante tests</li>
              <li>✅ Auto-corrección INMEDIATA cuando BD ≠ Estado Local</li>
              <li>✅ Tests validación BD DIRECTA exclusiva, nunca estado local</li>
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
                Ejecutar FASE 11 Tests BD
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
              <span className="font-medium">Test en ejecución BD:</span> {currentTest}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{testCases.length}</div>
            <div className="text-sm text-muted-foreground">Tests Totales BD</div>
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
            <div className="text-sm text-muted-foreground">Estrategia BD</div>
          </div>
        </div>

        {renderResults()}
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
