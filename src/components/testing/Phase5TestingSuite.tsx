
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

// FASE 8: PASO 4 - Función de espera OPTIMIZADA para BD en producción
const waitForCondition = async (
  condition: () => Promise<boolean>,
  timeout: number = 12000, // FASE 8: Timeout realista para BD en producción
  pollInterval: number = 1000, // FASE 8: Polling más espaciado para BD real
  description: string = 'condition'
): Promise<boolean> => {
  const startTime = Date.now();
  const maxAttempts = Math.ceil(timeout / pollInterval);
  
  console.log(`⏳ FASE 8 - PASO 4: Waiting for ${description} (timeout: ${timeout}ms, interval: ${pollInterval}ms)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await condition();
      if (result) {
        const elapsed = Date.now() - startTime;
        console.log(`✅ FASE 8 - PASO 4: ${description} met after ${elapsed}ms (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ FASE 8 - PASO 4: Condition check failed on attempt ${attempt}:`, error);
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  const elapsed = Date.now() - startTime;
  console.log(`❌ FASE 8 - PASO 4: ${description} not met after ${elapsed}ms (${maxAttempts} attempts)`);
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

  // FASE 8: PASO 2 - Preparar ambiente con RESET TOTAL y desactivación Smart Messaging
  const prepareTestEnvironment = async () => {
    console.log('🧹 FASE 8 - PASO 2: Preparando ambiente con RESET TOTAL...');
    
    // FASE 8: PASO 2 - Pausar Smart Messaging para evitar interferencias
    console.log('⏸️ FASE 8 - PASO 2: Pausando Smart Messaging...');
    pauseForTesting();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // FASE 8: PASO 2 - Reset COMPLETO del sistema
    console.log('🔄 FASE 8 - PASO 2: Ejecutando RESET TOTAL del sistema...');
    await forceFullReset();
    await new Promise(resolve => setTimeout(resolve, 4000)); // Más tiempo para reset completo
    
    // FASE 8: PASO 3 - Validar que el reset fue exitoso
    console.log('🔍 FASE 8 - PASO 2: Validando limpieza total...');
    const isClean = await validatePersistence(0, 'total-reset-validation');
    if (!isClean) {
      console.error('❌ FASE 8 - PASO 2: Reset total falló');
      throw new Error('Reset total falló - ambiente no está limpio');
    }
    
    // FASE 8: PASO 3 - Validar consistencia post-reset
    const isConsistent = await validateConsistency();
    if (!isConsistent) {
      console.warn('⚠️ FASE 8 - PASO 2: Advertencia de consistencia post-reset');
    }
    
    console.log('✅ FASE 8 - PASO 2: Ambiente preparado con RESET TOTAL y validado');
  };

  // FASE 8: PASO 2 - Restaurar estado con validación completa
  const cleanupTestEnvironment = async () => {
    console.log('🧹 FASE 8 - PASO 2: Limpiando ambiente de test con VALIDACIÓN TOTAL...');
    
    // FASE 8: PASO 2 - Reset completo final
    await forceFullReset();
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // FASE 8: PASO 3 - Validar limpieza final
    const isClean = await validatePersistence(0, 'final-total-cleanup');
    if (!isClean) {
      console.warn('⚠️ FASE 8 - PASO 2: Validación de limpieza final falló');
    }
    
    // FASE 8: PASO 3 - Validar consistencia final
    const isConsistent = await validateConsistency();
    if (!isConsistent) {
      console.warn('⚠️ FASE 8 - PASO 2: Validación de consistencia final falló');
    }
    
    // FASE 8: PASO 2 - Reanudar Smart Messaging
    console.log('▶️ FASE 8 - PASO 2: Reanudando Smart Messaging...');
    resumeAfterTesting();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ FASE 8 - PASO 2: Ambiente limpiado con VALIDACIÓN TOTAL');
  };

  // FASE 8: PASO 4 - Test cases con timeouts REALISTAS para BD en producción
  const testCases = [
    {
      name: 'initialization-check',
      description: 'Verificar inicialización del sistema',
      timeout: 8000 // FASE 8: Timeout realista
    },
    {
      name: 'message-creation-basic',
      description: 'Crear mensajes básicos',
      timeout: 15000 // FASE 8: Más tiempo para BD real
    },
    {
      name: 'notification-badge-real',
      description: 'Sistema de badges en tiempo real',
      timeout: 18000 // FASE 8: Más tiempo para BD real
    },
    {
      name: 'message-persistence',
      description: 'Persistencia de mensajes',
      timeout: 16000
    },
    {
      name: 'priority-system',
      description: 'Sistema de prioridades',
      timeout: 20000 // FASE 8: Más tiempo para múltiples operaciones
    },
    {
      name: 'bulk-operations',
      description: 'Operaciones en lote',
      timeout: 22000 // FASE 8: Más tiempo para operaciones bulk
    },
    {
      name: 'cleanup-verification',
      description: 'Verificación de limpieza',
      timeout: 15000
    }
  ];

  const runIndividualTest = async (testCase: typeof testCases[0]): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testCase.description);
    
    console.log(`🧪 FASE 8 - PASO 4: Running test: ${testCase.name}`);
    
    try {
      let success = false;
      let details = '';
      let validationDetails = '';

      switch (testCase.name) {
        case 'initialization-check':
          // FASE 8: PASO 3 - Verificar inicialización y consistencia
          const consistencyCheck = await validateConsistency();
          success = isInitialized && messages !== undefined && consistencyCheck;
          details = `Initialized: ${isInitialized}, Strategy: ${currentStrategy}, Messages: ${messages?.length || 0}, Consistent: ${consistencyCheck}`;
          validationDetails = `Sistema inicializado con consistencia verificada en FASE 8`;
          break;

        case 'message-creation-basic':
          // FASE 8: PASO 4 - Test básico con validación BD DIRECTA
          const initialCount = messages.length;
          console.log(`📊 FASE 8 - PASO 4: Initial message count: ${initialCount}`);
          
          const userMessageId = await addMessage({
            type: 'user',
            content: 'FASE 8 test message - creation basic',
            isRead: true
          });
          
          // FASE 8: PASO 4 - Validación directa con timeout REALISTA
          const messageCreated = await waitForCondition(
            async () => {
              const isValid = await validatePersistence(initialCount + 1, 'message-creation-test');
              return isValid;
            },
            15000, // FASE 8: Timeout realista para BD en producción
            1500, // FASE 8: Polling más espaciado
            'message creation validation'
          );
          
          success = messageCreated && !!userMessageId;
          details = `Messages: ${initialCount} → ${messages.length}, ID: ${userMessageId}`;
          validationDetails = 'Mensaje creado y validado contra BD real con FASE 8';
          break;

        case 'notification-badge-real':
          // FASE 8: PASO 4 - Test de badge con validación COMPLETA
          const initialBadgeState = getBadgeInfo;
          console.log(`🏷️ FASE 8 - PASO 4: Initial badge info:`, initialBadgeState);
          
          const testNotificationId = await addNotification('FASE 8 test notification - badge verification', 'high');
          console.log(`📬 FASE 8 - PASO 4: Created notification: ${testNotificationId}`);
          
          // FASE 8: PASO 4 - Validar persistencia, badge Y consistencia
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
              console.log(`🔍 FASE 8 - PASO 4: Current badge info:`, currentBadgeState);
              return currentBadgeState.count > initialBadgeState.count && currentBadgeState.hasHigh;
            },
            18000, // FASE 8: Timeout realista
            1500, // FASE 8: Polling espaciado
            'notification badge complete validation'
          );
          
          const notificationBadgeInfo = getBadgeInfo;
          
          success = badgeUpdated;
          details = `Badge: ${initialBadgeState.count} → ${notificationBadgeInfo.count}, High: ${notificationBadgeInfo.hasHigh}`;
          validationDetails = `Notificación persistida en BD real, badge validado y consistencia verificada con FASE 8, ID: ${testNotificationId}`;
          break;

        case 'message-persistence':
          // FASE 8: PASO 4 - Test de persistencia COMPLETA en BD real
          const beforePersistence = messages.length;
          
          const suggestionId = await addSuggestion('FASE 8 test suggestion - persistence', 'medium');
          
          // FASE 8: PASO 4 - Validación completa BD + consistencia
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
            16000, // FASE 8: Timeout realista
            1500, // FASE 8: Polling espaciado
            'message persistence complete validation'
          );
          
          const afterPersistence = messages.length;
          
          success = persistenceVerified;
          details = `Messages: ${beforePersistence} → ${afterPersistence}, Suggestion ID: ${suggestionId}`;
          validationDetails = 'Mensaje persistido en BD real, validado en estado local y consistencia verificada con FASE 8';
          break;

        case 'priority-system':
          // FASE 8: PASO 4 - Test completo del sistema de prioridades
          const initialPriorityCount = messages.length;
          
          await addNotification('FASE 8 urgent test notification', 'urgent');
          await addNotification('FASE 8 high priority test', 'high');
          await addSuggestion('FASE 8 low priority suggestion', 'low');
          
          // FASE 8: PASO 4 - Validación completa de prioridades
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
              console.log(`🏷️ FASE 8 - PASO 4: Badge priorities check:`, currentBadgePriorities);
              return currentBadgePriorities.hasUrgent && currentBadgePriorities.hasHigh;
            },
            20000, // FASE 8: Timeout realista para múltiples operaciones
            1500, // FASE 8: Polling espaciado
            'priority system complete validation'
          );
          
          const prioritiesBadgeInfo = getBadgeInfo;
          
          success = prioritiesUpdated;
          details = `Urgent: ${prioritiesBadgeInfo.hasUrgent}, High: ${prioritiesBadgeInfo.hasHigh}, Count: ${prioritiesBadgeInfo.count}`;
          validationDetails = 'Sistema de prioridades persistido en BD real, validado en badges y consistencia verificada con FASE 8';
          break;

        case 'bulk-operations':
          // FASE 8: PASO 4 - Test de operaciones en lote COMPLETO
          const beforeBulk = messages.filter(m => !m.isRead).length;
          const totalBulk = messages.length;
          console.log(`📊 FASE 8 - PASO 4: Unread messages before bulk: ${beforeBulk}, total: ${totalBulk}`);
          
          await markAllAsRead();
          
          // FASE 8: PASO 4 - Validación completa de operación bulk
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
              console.log(`📊 FASE 8 - PASO 4: Current unread count: ${unreadCount}`);
              return unreadCount === 0;
            },
            22000, // FASE 8: Timeout realista para operaciones bulk
            2000, // FASE 8: Polling más espaciado para operaciones pesadas
            'bulk mark as read complete validation'
          );
          
          const afterBulk = messages.filter(m => !m.isRead).length;
          
          success = bulkCompleted;
          details = `Unread: ${beforeBulk} → ${afterBulk}, Total: ${totalBulk}`;
          validationDetails = 'Operación bulk persistida en BD real, validada en estado local y consistencia verificada con FASE 8';
          break;

        case 'cleanup-verification':
          // FASE 8: PASO 2 - Verificar limpieza completa
          const preCleanup = messages.length;
          
          await clearChat();
          
          // FASE 8: PASO 4 - Validación completa de limpieza
          const cleanupCompleted = await waitForCondition(
            async () => {
              // 1. Validar limpieza en BD real
              const isClean = await validatePersistence(0, 'cleanup-verification-test');
              if (!isClean) return false;
              
              // 2. Validar consistencia final
              const isConsistent = await validateConsistency();
              return isConsistent;
            },
            15000, // FASE 8: Timeout realista para limpieza
            1500, // FASE 8: Polling espaciado
            'cleanup complete verification'
          );
          
          success = cleanupCompleted;
          details = `Messages: ${preCleanup} → ${messages.length}`;
          validationDetails = 'Limpieza completada en BD real, validada en estado local y consistencia verificada con FASE 8';
          break;

        default:
          success = false;
          details = `Unknown test case: ${testCase.name}`;
          validationDetails = 'Test case no implementado en FASE 8';
      }

      const duration = Date.now() - startTime;
      console.log(`✅ FASE 8 - PASO 4: Test ${testCase.name} completed in ${duration}ms:`, { success, details });

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
      console.error(`❌ FASE 8 - PASO 4: Test ${testCase.name} failed:`, error);
      
      return {
        testName: testCase.name,
        success: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        validationDetails: 'Test falló con excepción en FASE 8',
        duration,
        timestamp: new Date()
      };
    }
  };

  const runTestSuite = async () => {
    if (isRunning) return;

    console.log('🚀 Starting Phase 5 Test Suite (FASE 8 - PLAN DE CORRECCIÓN DEFINITIVO)');
    setIsRunning(true);
    setResults(null);
    setTestProgress(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = Date.now();
    const testResults: TestResult[] = [];

    try {
      // FASE 8: PASO 2 - Preparar ambiente con reset total
      await prepareTestEnvironment();

      // FASE 8: PASO 4 - Ejecutar tests con aislamiento total
      for (let i = 0; i < testCases.length; i++) {
        if (abortController.signal.aborted) {
          console.log('🛑 Test suite aborted');
          break;
        }

        const testCase = testCases[i];
        console.log(`\n📋 Running test ${i + 1}/${testCases.length}: ${testCase.name}`);
        
        const result = await runIndividualTest(testCase);
        testResults.push(result);
        
        setTestProgress(((i + 1) / testCases.length) * 100);
        
        // FASE 8: PASO 4 - Delay entre tests para BD real
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Más tiempo entre tests
        }
      }

    } finally {
      // FASE 8: PASO 2 - Limpiar ambiente con validación total
      await cleanupTestEnvironment();
      
      const totalDuration = Date.now() - startTime;
      const passedTests = testResults.filter(r => r.success).length;
      const failedTests = testResults.filter(r => !r.success).length;

      const finalResults: TestSuiteResults = {
        totalTests: testResults.length,
        passedTests,
        failedTests,
        results: testResults,
        overallSuccess: failedTests === 0 && testResults.length > 0,
        totalDuration
      };

      setResults(finalResults);
      setIsRunning(false);
      setCurrentTest('');
      setTestProgress(0);
      abortControllerRef.current = null;

      console.log('🏁 Phase 5 Test Suite (FASE 8) completed:', finalResults);
    }
  };

  const stopTestSuite = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      console.log('🛑 Test suite stop requested');
    }
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-blue-600" />
            <CardTitle>Phase 5 Testing Suite - FASE 8 PLAN DE CORRECCIÓN DEFINITIVO</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {pausedByTest && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Smart Messaging Paused
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Strategy: {currentStrategy}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Messages: {messages.length}
            </Badge>
            <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
              FASE 8 - CORRECCIÓN DEFINITIVA
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Control Panel */}
        <div className="flex items-center gap-4">
          <Button
            onClick={runTestSuite}
            disabled={isRunning || !isInitialized}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running Tests...' : 'Run Test Suite'}
          </Button>

          {isRunning && (
            <Button
              onClick={stopTestSuite}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Tests
            </Button>
          )}

          {!isInitialized && (
            <Alert className="flex-1">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Sistema no inicializado. Espera a que se complete la carga.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Progress Bar */}
        {isRunning && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progreso: {Math.round(testProgress)}%</span>
              <span className="text-blue-600">{currentTest}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${testProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Results Summary */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{results.totalTests}</div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{results.passedTests}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">{results.failedTests}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-600">{results.totalDuration}ms</div>
                <div className="text-sm text-gray-600">Duration</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(results.overallSuccess)}
              <span className="font-semibold">
                Overall Result: {results.overallSuccess ? 'SUCCESS' : 'FAILURE'}
              </span>
              {results.overallSuccess && (
                <Badge className="bg-green-600">
                  <Zap className="h-3 w-3 mr-1" />
                  All Tests Passed
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Detailed Results */}
        {results && results.results.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              Detailed Results
            </h3>
            
            <ScrollArea className="h-96 w-full border rounded-lg p-4">
              <div className="space-y-4">
                {results.results.map((result, index) => (
                  <div key={index} className="border-l-4 border-l-blue-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <span className="font-medium">{result.testName}</span>
                        {getStatusBadge(result.success)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {result.duration}ms
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mb-1">
                      <strong>Details:</strong> {result.details}
                    </div>
                    {result.validationDetails && (
                      <div className="text-sm text-blue-600">
                        <strong>Validation:</strong> {result.validationDetails}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* FASE 8 Information Panel */}
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-2">FASE 8 - PLAN DE CORRECCIÓN DEFINITIVO</h4>
          <div className="text-sm text-red-700 space-y-1">
            <p><strong>✅ PASO 1:</strong> Estrategia de persistencia corregida (siempre Supabase con usuario)</p>
            <p><strong>✅ PASO 2:</strong> Reset total implementado con desactivación Smart Messaging</p>
            <p><strong>✅ PASO 3:</strong> Sincronización forzada con validación directa BD</p>
            <p><strong>✅ PASO 4:</strong> Tests rediseñados con timeouts realistas (12-22s)</p>
            <p><strong>✅ PASO 5:</strong> Monitoreo automático de consistencia BD-Estado</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
