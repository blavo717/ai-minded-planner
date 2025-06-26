
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

// FASE 4: Función de espera con polling más eficiente
const waitForCondition = async (
  condition: () => boolean,
  timeout: number = 3000,
  pollInterval: number = 100,
  description: string = 'condition'
): Promise<boolean> => {
  const startTime = Date.now();
  const maxAttempts = Math.ceil(timeout / pollInterval);
  
  console.log(`⏳ Waiting for ${description} (timeout: ${timeout}ms, interval: ${pollInterval}ms)`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (condition()) {
      const elapsed = Date.now() - startTime;
      console.log(`✅ ${description} met after ${elapsed}ms (attempt ${attempt}/${maxAttempts})`);
      return true;
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  const elapsed = Date.now() - startTime;
  console.log(`❌ ${description} not met after ${elapsed}ms (${maxAttempts} attempts)`);
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
    currentStrategy
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

  // FASE 3: Limpiar estado antes de cada test
  const prepareTestEnvironment = async () => {
    console.log('🧹 Preparing test environment...');
    
    // FASE 3: Pausar Smart Messaging
    pauseForTesting();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Limpiar mensajes existentes
    await clearChat();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Test environment prepared');
  };

  // FASE 3: Restaurar estado después de tests
  const cleanupTestEnvironment = async () => {
    console.log('🧹 Cleaning up test environment...');
    
    // Limpiar mensajes de test
    await clearChat();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // FASE 3: Reanudar Smart Messaging
    resumeAfterTesting();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Test environment cleaned up');
  };

  // FASE 4: Test cases con validación robusta
  const testCases = [
    {
      name: 'initialization-check',
      description: 'Verificar inicialización del sistema',
      timeout: 2000
    },
    {
      name: 'message-creation-basic',
      description: 'Crear mensajes básicos',
      timeout: 3000
    },
    {
      name: 'notification-badge-real',
      description: 'Sistema de badges en tiempo real',
      timeout: 5000
    },
    {
      name: 'message-persistence',
      description: 'Persistencia de mensajes',
      timeout: 4000
    },
    {
      name: 'priority-system',
      description: 'Sistema de prioridades',
      timeout: 5000
    },
    {
      name: 'bulk-operations',
      description: 'Operaciones en lote',
      timeout: 6000
    },
    {
      name: 'cleanup-verification',
      description: 'Verificación de limpieza',
      timeout: 3000
    }
  ];

  const runIndividualTest = async (testCase: typeof testCases[0]): Promise<TestResult> => {
    const startTime = Date.now();
    setCurrentTest(testCase.description);
    
    console.log(`🧪 Running test: ${testCase.name}`);
    
    try {
      let result: { success: boolean; details: string; validationDetails?: string };

      switch (testCase.name) {
        case 'initialization-check':
          // FASE 4: Verificar inicialización básica
          result = {
            success: isInitialized && messages !== undefined,
            details: `Initialized: ${isInitialized}, Strategy: ${currentStrategy}, Messages: ${messages?.length || 0}`,
            validationDetails: `Sistema correctamente inicializado con estrategia ${currentStrategy}`
          };
          break;

        case 'message-creation-basic':
          // FASE 4: Test básico de creación de mensajes
          const initialCount = messages.length;
          console.log(`📊 Initial message count: ${initialCount}`);
          
          const userMessageId = await addMessage({
            type: 'user',
            content: 'Test message from Phase 5 suite',
            isRead: true
          });
          
          // FASE 4: Usar polling para verificar creación
          const messageCreated = await waitForCondition(
            () => messages.length > initialCount,
            3000,
            200,
            'message creation'
          );
          
          result = {
            success: messageCreated && !!userMessageId,
            details: `Messages: ${initialCount} → ${messages.length}, ID: ${userMessageId}`,
            validationDetails: 'Mensaje creado y persistido correctamente'
          };
          break;

        case 'notification-badge-real':
          // FASE 1: Corregir acceso a getBadgeInfo (sin paréntesis)
          // FASE 4: Usar getBadgeInfo como valor directo, no función
          const initialBadgeState = getBadgeInfo;
          console.log(`🏷️ Initial badge info:`, initialBadgeState);
          
          const testNotificationId = await addNotification('Test notification for badge verification', 'high');
          console.log(`📬 Created notification: ${testNotificationId}`);
          
          // FASE 2: Aumentar timeout y usar polling
          const badgeUpdated = await waitForCondition(
            () => {
              const currentBadgeState = getBadgeInfo;
              console.log(`🔍 Current badge info:`, currentBadgeState);
              return currentBadgeState.count > initialBadgeState.count && currentBadgeState.hasHigh;
            },
            5000, // 5 segundos timeout
            250,  // 250ms polling
            'badge update'
          );
          
          const notificationBadgeInfo = getBadgeInfo;
          
          return { 
            success: badgeUpdated, 
            details: `Badge: ${initialBadgeState.count} → ${notificationBadgeInfo.count}, High: ${notificationBadgeInfo.hasHigh}`,
            validationDetails: `Notificación creada con ID: ${testNotificationId}`
          };

        case 'message-persistence':
          // FASE 4: Test de persistencia real
          const beforePersistence = messages.length;
          
          const suggestionId = await addSuggestion('Persistence test suggestion', 'medium');
          
          // FASE 2: Polling para verificar persistencia
          const persistenceVerified = await waitForCondition(
            () => {
              const found = messages.find(m => m.id === suggestionId);
              return !!found && found.type === 'suggestion';
            },
            4000,
            200,
            'message persistence'
          );
          
          const afterPersistence = messages.length;
          
          result = {
            success: persistenceVerified,
            details: `Messages: ${beforePersistence} → ${afterPersistence}, Suggestion ID: ${suggestionId}`,
            validationDetails: 'Mensaje persistido y verificado en storage'
          };
          break;

        case 'priority-system':
          // FASE 4: Test completo del sistema de prioridades
          await addNotification('Urgent test notification', 'urgent');
          await addNotification('High priority test', 'high');
          await addSuggestion('Low priority suggestion', 'low');
          
          // FASE 2: Usar polling para verificar prioridades
          const prioritiesUpdated = await waitForCondition(
            () => {
              const currentBadgePriorities = getBadgeInfo;
              console.log(`🏷️ Badge priorities check:`, currentBadgePriorities);
              return currentBadgePriorities.hasUrgent && currentBadgePriorities.hasHigh;
            },
            5000, // 5 segundos timeout
            250,  // 250ms polling
            'badge priorities update'
          );
          
          const prioritiesBadgeInfo = getBadgeInfo;
          
          return { 
            success: prioritiesUpdated, 
            details: `Urgent: ${prioritiesBadgeInfo.hasUrgent}, High: ${prioritiesBadgeInfo.hasHigh}, Count: ${prioritiesBadgeInfo.count}`,
            validationDetails: 'Sistema de prioridades funcionando correctamente'
          };

        case 'bulk-operations':
          // FASE 4: Test de operaciones en lote
          const beforeBulk = messages.filter(m => !m.isRead).length;
          console.log(`📊 Unread messages before bulk: ${beforeBulk}`);
          
          await markAllAsRead();
          
          // FASE 2: Polling para verificar operación bulk
          const bulkCompleted = await waitForCondition(
            () => {
              const unreadCount = messages.filter(m => !m.isRead).length;
              console.log(`📊 Current unread count: ${unreadCount}`);
              return unreadCount === 0;
            },
            6000, // 6 segundos para operaciones bulk
            300,  // 300ms polling
            'bulk mark as read'
          );
          
          const afterBulk = messages.filter(m => !m.isRead).length;
          
          result = {
            success: bulkCompleted,
            details: `Unread: ${beforeBulk} → ${afterBulk}`,
            validationDetails: 'Operación bulk completada correctamente'
          };
          break;

        case 'cleanup-verification':
          // FASE 4: Verificar limpieza final
          const preCleanup = messages.length;
          
          await clearChat();
          
          // FASE 2: Polling para verificar limpieza
          const cleanupCompleted = await waitForCondition(
            () => messages.length === 0,
            3000,
            200,
            'chat cleanup'
          );
          
          result = {
            success: cleanupCompleted,
            details: `Messages: ${preCleanup} → ${messages.length}`,
            validationDetails: 'Limpieza de chat completada'
          };
          break;

        default:
          result = {
            success: false,
            details: `Unknown test case: ${testCase.name}`,
            validationDetails: 'Test case no implementado'
          };
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Test ${testCase.name} completed in ${duration}ms:`, result);

      return {
        testName: testCase.name,
        success: result.success,
        details: result.details,
        validationDetails: result.validationDetails,
        duration,
        timestamp: new Date()
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Test ${testCase.name} failed:`, error);
      
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

    console.log('🚀 Starting Phase 5 Test Suite (CORRECTED & OPTIMIZED)');
    setIsRunning(true);
    setResults(null);
    setTestProgress(0);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = Date.now();
    const testResults: TestResult[] = [];

    try {
      // FASE 3: Preparar ambiente de test
      await prepareTestEnvironment();

      // FASE 4: Ejecutar tests con control de aborto
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
        
        // FASE 4: Delay entre tests para evitar condiciones de carrera
        if (i < testCases.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

    } finally {
      // FASE 3: Limpiar ambiente de test
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
            <CardTitle>Phase 5 Testing Suite - CORRECTED & OPTIMIZED</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* FASE 3: Indicador de estado Smart Messaging */}
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
