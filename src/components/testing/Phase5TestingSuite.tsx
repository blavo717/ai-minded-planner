
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

// FASE 6: Función de espera con validación REAL contra BD - CORREGIDA PARA ASYNC
const waitForCondition = async (
  condition: () => Promise<boolean>,
  timeout: number = 5000,
  pollInterval: number = 250,
  description: string = 'condition'
): Promise<boolean> => {
  const startTime = Date.now();
  const maxAttempts = Math.ceil(timeout / pollInterval);
  
  console.log(`⏳ FASE 6 - Waiting for ${description} (timeout: ${timeout}ms, interval: ${pollInterval}ms)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await condition();
      if (result) {
        const elapsed = Date.now() - startTime;
        console.log(`✅ FASE 6 - ${description} met after ${elapsed}ms (attempt ${attempt}/${maxAttempts})`);
        return true;
      }
    } catch (error) {
      console.warn(`⚠️ FASE 6 - Condition check failed on attempt ${attempt}:`, error);
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  const elapsed = Date.now() - startTime;
  console.log(`❌ FASE 6 - ${description} not met after ${elapsed}ms (${maxAttempts} attempts)`);
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
    validatePersistence // FASE 6: Recibir validación directa
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

  // FASE 6: Preparar ambiente con limpieza REAL de BD
  const prepareTestEnvironment = async () => {
    console.log('🧹 FASE 6 - Preparing test environment with REAL database cleanup...');
    
    // FASE 6: Pausar Smart Messaging
    pauseForTesting();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // FASE 6: Limpiar mensajes existentes REALMENTE
    await clearChat();
    await new Promise(resolve => setTimeout(resolve, 1500)); // Más tiempo para BD real
    
    // FASE 6: Validar limpieza REAL
    const isClean = await validatePersistence(0, 'test-environment-cleanup');
    if (!isClean) {
      console.error('❌ FASE 6 - Test environment cleanup failed');
      throw new Error('Test environment cleanup failed');
    }
    
    console.log('✅ FASE 6 - Test environment prepared and validated');
  };

  // FASE 6: Restaurar estado con validación
  const cleanupTestEnvironment = async () => {
    console.log('🧹 FASE 6 - Cleaning up test environment with validation...');
    
    // FASE 6: Limpiar mensajes de test REALMENTE
    await clearChat();
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // FASE 6: Validar limpieza final
    const isClean = await validatePersistence(0, 'final-cleanup');
    if (!isClean) {
      console.warn('⚠️ FASE 6 - Final cleanup validation failed');
    }
    
    // FASE 6: Reanudar Smart Messaging
    resumeAfterTesting();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ FASE 6 - Test environment cleaned up and validated');
  };

  // FASE 6: Test cases con timeouts realistas para BD real
  const testCases = [
    {
      name: 'initialization-check',
      description: 'Verificar inicialización del sistema',
      timeout: 3000
    },
    {
      name: 'message-creation-basic',
      description: 'Crear mensajes básicos',
      timeout: 6000 // Más tiempo para BD real
    },
    {
      name: 'notification-badge-real',
      description: 'Sistema de badges en tiempo real',
      timeout: 8000 // Más tiempo para BD real
    },
    {
      name: 'message-persistence',
      description: 'Persistencia de mensajes',
      timeout: 7000
    },
    {
      name: 'priority-system',
      description: 'Sistema de prioridades',
      timeout: 8000
    },
    {
      name: 'bulk-operations',
      description: 'Operaciones en lote',
      timeout: 10000 // Más tiempo para operaciones bulk
    },
    {
      name: 'cleanup-verification',
      description: 'Verificación de limpieza',
      timeout: 6000
    }
  ];

  const runIndividualTest = async (testCase: typeof testCases[0]): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testCase.description);
    
    console.log(`🧪 FASE 6 - Running test: ${testCase.name}`);
    
    try {
      let success = false;
      let details = '';
      let validationDetails = '';

      switch (testCase.name) {
        case 'initialization-check':
          // FASE 6: Verificar inicialización básica
          success = isInitialized && messages !== undefined;
          details = `Initialized: ${isInitialized}, Strategy: ${currentStrategy}, Messages: ${messages?.length || 0}`;
          validationDetails = `Sistema correctamente inicializado con estrategia ${currentStrategy}`;
          break;

        case 'message-creation-basic':
          // FASE 6: Test básico de creación de mensajes con validación REAL
          const initialCount = messages.length;
          console.log(`📊 FASE 6 - Initial message count: ${initialCount}`);
          
          const userMessageId = await addMessage({
            type: 'user',
            content: 'FASE 6 test message - creation basic',
            isRead: true
          });
          
          // FASE 6: Usar validación directa contra BD
          const messageCreated = await waitForCondition(
            async () => {
              const isValid = await validatePersistence(initialCount + 1, 'message-creation-test');
              return isValid;
            },
            6000,
            500,
            'message creation validation'
          );
          
          success = messageCreated && !!userMessageId;
          details = `Messages: ${initialCount} → ${messages.length}, ID: ${userMessageId}`;
          validationDetails = 'Mensaje creado y validado contra BD';
          break;

        case 'notification-badge-real':
          // FASE 6: Test de badge con validación REAL de persistencia
          const initialBadgeState = getBadgeInfo;
          console.log(`🏷️ FASE 6 - Initial badge info:`, initialBadgeState);
          
          const testNotificationId = await addNotification('FASE 6 test notification - badge verification', 'high');
          console.log(`📬 FASE 6 - Created notification: ${testNotificationId}`);
          
          // FASE 6: Validar tanto persistencia como badge
          const badgeUpdated = await waitForCondition(
            async () => {
              // Primero validar persistencia
              const isPersisted = await validatePersistence(initialBadgeState.count + 1, 'notification-badge-test');
              if (!isPersisted) return false;
              
              // Luego validar badge
              const currentBadgeState = getBadgeInfo;
              console.log(`🔍 FASE 6 - Current badge info:`, currentBadgeState);
              return currentBadgeState.count > initialBadgeState.count && currentBadgeState.hasHigh;
            },
            8000,
            500,
            'notification badge validation'
          );
          
          const notificationBadgeInfo = getBadgeInfo;
          
          success = badgeUpdated;
          details = `Badge: ${initialBadgeState.count} → ${notificationBadgeInfo.count}, High: ${notificationBadgeInfo.hasHigh}`;
          validationDetails = `Notificación persistida y badge validado, ID: ${testNotificationId}`;
          break;

        case 'message-persistence':
          // FASE 6: Test de persistencia REAL contra BD
          const beforePersistence = messages.length;
          
          const suggestionId = await addSuggestion('FASE 6 test suggestion - persistence', 'medium');
          
          // FASE 6: Validación directa contra BD
          const persistenceVerified = await waitForCondition(
            async () => {
              const isPersisted = await validatePersistence(beforePersistence + 1, 'message-persistence-test');
              if (!isPersisted) return false;
              
              // Validar también que el mensaje específico existe
              const found = messages.find(m => m.id === suggestionId);
              return !!found && found.type === 'suggestion';
            },
            7000,
            500,
            'message persistence validation'
          );
          
          const afterPersistence = messages.length;
          
          success = persistenceVerified;
          details = `Messages: ${beforePersistence} → ${afterPersistence}, Suggestion ID: ${suggestionId}`;
          validationDetails = 'Mensaje persistido y validado en BD real';
          break;

        case 'priority-system':
          // FASE 6: Test completo del sistema de prioridades con validación BD
          const initialPriorityCount = messages.length;
          
          await addNotification('FASE 6 urgent test notification', 'urgent');
          await addNotification('FASE 6 high priority test', 'high');
          await addSuggestion('FASE 6 low priority suggestion', 'low');
          
          // FASE 6: Validar persistencia y prioridades
          const prioritiesUpdated = await waitForCondition(
            async () => {
              // Validar persistencia de 3 mensajes nuevos
              const isPersisted = await validatePersistence(initialPriorityCount + 3, 'priority-system-test');
              if (!isPersisted) return false;
              
              // Validar badge de prioridades
              const currentBadgePriorities = getBadgeInfo;
              console.log(`🏷️ FASE 6 - Badge priorities check:`, currentBadgePriorities);
              return currentBadgePriorities.hasUrgent && currentBadgePriorities.hasHigh;
            },
            8000,
            500,
            'priority system validation'
          );
          
          const prioritiesBadgeInfo = getBadgeInfo;
          
          success = prioritiesUpdated;
          details = `Urgent: ${prioritiesBadgeInfo.hasUrgent}, High: ${prioritiesBadgeInfo.hasHigh}, Count: ${prioritiesBadgeInfo.count}`;
          validationDetails = 'Sistema de prioridades persistido y validado en BD';
          break;

        case 'bulk-operations':
          // FASE 6: Test de operaciones en lote con validación BD REAL
          const beforeBulk = messages.filter(m => !m.isRead).length;
          const totalBulk = messages.length;
          console.log(`📊 FASE 6 - Unread messages before bulk: ${beforeBulk}, total: ${totalBulk}`);
          
          await markAllAsRead();
          
          // FASE 6: Validar operación bulk contra BD
          const bulkCompleted = await waitForCondition(
            async () => {
              // Validar que el conteo total se mantiene
              const isPersisted = await validatePersistence(totalBulk, 'bulk-operations-test');
              if (!isPersisted) return false;
              
              // Validar que todos están marcados como leídos
              const unreadCount = messages.filter(m => !m.isRead).length;
              console.log(`📊 FASE 6 - Current unread count: ${unreadCount}`);
              return unreadCount === 0;
            },
            10000,
            750,
            'bulk mark as read validation'
          );
          
          const afterBulk = messages.filter(m => !m.isRead).length;
          
          success = bulkCompleted;
          details = `Unread: ${beforeBulk} → ${afterBulk}, Total: ${totalBulk}`;
          validationDetails = 'Operación bulk persistida y validada en BD';
          break;

        case 'cleanup-verification':
          // FASE 6: Verificar limpieza final con validación BD REAL
          const preCleanup = messages.length;
          
          await clearChat();
          
          // FASE 6: Validar limpieza REAL contra BD
          const cleanupCompleted = await waitForCondition(
            async () => {
              const isClean = await validatePersistence(0, 'cleanup-verification-test');
              return isClean;
            },
            6000,
            500,
            'cleanup verification'
          );
          
          success = cleanupCompleted;
          details = `Messages: ${preCleanup} → ${messages.length}`;
          validationDetails = 'Limpieza completada y validada en BD';
          break;

        default:
          success = false;
          details = `Unknown test case: ${testCase.name}`;
          validationDetails = 'Test case no implementado';
      }

      const duration = Date.now() - startTime;
      console.log(`✅ FASE 6 - Test ${testCase.name} completed in ${duration}ms:`, { success, details });

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
      console.error(`❌ FASE 6 - Test ${testCase.name} failed:`, error);
      
      return {
        testName: testCase.name,
        success: false,
        details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        validationDetails: 'Test falló con excepción',
        duration,
        timestamp: new Date()
      };
    }
  };

  const runTestSuite = async () => {
    if (isRunning) return;

    console.log('🚀 Starting Phase 5 Test Suite (FASE 6 QUIRÚRGICA)');
    setIsRunning(true);
    setResults(null);
    setTestProgress(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = Date.now();
    const testResults: TestResult[] = [];

    try {
      // FASE 6: Preparar ambiente de test con limpieza REAL
      await prepareTestEnvironment();

      // FASE 6: Ejecutar tests con control de aborto
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
        
        // FASE 6: Delay entre tests para evitar condiciones de carrera
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } finally {
      // FASE 6: Limpiar ambiente de test con validación
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

      console.log('🏁 Phase 5 Test Suite completed:', finalResults);
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
            <CardTitle>Phase 5 Testing Suite - FASE 6 QUIRÚRGICA</CardTitle>
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
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
              FASE 6 - BD REAL
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
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
