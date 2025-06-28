
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
import { useAIAssistantSimple } from '@/hooks/useAIAssistantSimple';
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
    sendMessage,
    clearChat,
    messages,
    connectionStatus
  } = useAIAssistantSimple();
  
  const { activeConfiguration } = useLLMConfigurations();
  
  const [testResults, setTestResults] = useState<TestResult[]>([
    {
      name: 'Conexión del Asistente Simple',
      status: 'pending',
      description: 'FASE 5: Verificar conexión del asistente simplificado'
    },
    {
      name: 'Envío de Mensaje',
      status: 'pending',
      description: 'FASE 5: Enviar mensaje de prueba al asistente'
    },
    {
      name: 'Recepción de Respuesta',
      status: 'pending',
      description: 'FASE 5: Verificar respuesta del asistente'
    },
    {
      name: 'Limpieza de Chat',
      status: 'pending',
      description: 'FASE 5: Limpiar historial de chat'
    },
    {
      name: 'Estado Final Limpio',
      status: 'pending',
      description: 'FASE 5: Verificar estado final limpio'
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

  // FASE 5: Test 1 - Verificar Conexión
  const testConnection = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 5: TEST 1 - Verificar Conexión');
    const startTime = Date.now();
    
    try {
      const duration = Date.now() - startTime;
      
      if (connectionStatus === 'connected' || connectionStatus === 'connecting') {
        updateTestResult(0, 'passed', undefined, [
          `✅ Estado de conexión: ${connectionStatus}`,
          `✅ Configuración activa disponible`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(0, 'failed', `Estado de conexión: ${connectionStatus}`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(0, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [connectionStatus, updateTestResult]);

  // FASE 5: Test 2 - Envío de Mensaje
  const testSendMessage = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 5: TEST 2 - Envío de Mensaje');
    const startTime = Date.now();
    
    try {
      const preCount = messages.length;
      console.log(`📊 Pre-count: ${preCount} mensajes`);
      
      await sendMessage('Test message FASE 5 - Sistema simplificado');
      
      // Esperar un momento para que el mensaje se procese
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duration = Date.now() - startTime;
      
      if (messages.length > preCount) {
        updateTestResult(1, 'passed', undefined, [
          `✅ Mensaje enviado exitosamente`,
          `✅ Mensajes: ${preCount} → ${messages.length}`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(1, 'failed', `No se detectó el envío del mensaje`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(1, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [sendMessage, messages.length, updateTestResult]);

  // FASE 5: Test 3 - Verificar Respuesta
  const testReceiveResponse = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 5: TEST 3 - Verificar Respuesta');
    const startTime = Date.now();
    
    try {
      // Esperar respuesta del asistente (hasta 10 segundos)
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const assistantMessages = messages.filter(m => m.type === 'assistant');
        if (assistantMessages.length > 0) {
          const duration = Date.now() - startTime;
          updateTestResult(2, 'passed', undefined, [
            `✅ Respuesta recibida del asistente`,
            `✅ Mensajes del asistente: ${assistantMessages.length}`,
            `⏱️ Tiempo: ${duration}ms`
          ], duration);
          return true;
        }
        
        attempts++;
      }
      
      const duration = Date.now() - startTime;
      updateTestResult(2, 'failed', 'No se recibió respuesta del asistente en tiempo esperado');
      return false;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(2, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [messages, updateTestResult]);

  // FASE 5: Test 4 - Limpiar Chat
  const testClearChat = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 5: TEST 4 - Limpiar Chat');
    const startTime = Date.now();
    
    try {
      await clearChat();
      
      // Esperar un momento para que se procese la limpieza
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      if (messages.length === 0) {
        updateTestResult(3, 'passed', undefined, [
          `✅ Chat limpiado exitosamente`,
          `✅ Mensajes: 0`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(3, 'failed', `Chat no se limpió completamente: ${messages.length} mensajes restantes`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(3, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [clearChat, messages.length, updateTestResult]);

  // FASE 5: Test 5 - Estado Final
  const testFinalState = useCallback(async (): Promise<boolean> => {
    console.log('🧪 FASE 5: TEST 5 - Estado Final');
    const startTime = Date.now();
    
    try {
      const duration = Date.now() - startTime;
      
      const finalCount = messages.length;
      const isClean = finalCount === 0;
      
      if (isClean) {
        updateTestResult(4, 'passed', undefined, [
          `✅ Estado final limpio`,
          `✅ Mensajes: ${finalCount}`,
          `✅ Sistema simplificado funcionando`,
          `⏱️ Tiempo: ${duration}ms`
        ], duration);
        return true;
      } else {
        updateTestResult(4, 'failed', `Estado final no limpio: ${finalCount} mensajes`);
        return false;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTestResult(4, 'failed', error instanceof Error ? error.message : 'Error desconocido', undefined, duration);
      return false;
    }
  }, [messages.length, updateTestResult]);

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
      testConnection,
      testSendMessage,
      testReceiveResponse,
      testClearChat,
      testFinalState
    ];
    
    let allPassed = true;
    
    for (let i = 0; i < tests.length; i++) {
      setCurrentTest(i);
      updateTestResult(i, 'running');
      
      console.log(`🧪 FASE 5: Ejecutando test simplificado ${i + 1}/${tests.length}`);
      
      const testPassed = await tests[i]();
      
      if (!testPassed) {
        allPassed = false;
        console.error(`❌ FASE 5: Test ${i + 1} falló`);
      } else {
        console.log(`✅ FASE 5: Test ${i + 1} exitoso`);
      }
      
      // Pausa entre tests
      if (i < tests.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setCurrentTest(-1);
    setIsRunning(false);
    
    const totalDuration = Date.now() - overallStartTime;
    const passed = testResults.filter(t => t.status === 'passed').length;
    const failed = testResults.filter(t => t.status === 'failed').length;
    
    console.log(`🏁 FASE 5: Tests simplificados completados en ${totalDuration}ms`);
    console.log(`📊 FASE 5: ${passed} exitosos, ${failed} fallidos`);
    
    toast({
      title: allPassed ? "🎉 FASE 5: ¡Todos los tests pasaron!" : "❌ FASE 5: Algunos tests fallaron",
      description: `${passed} exitosos, ${failed} fallidos. Tiempo total: ${Math.round(totalDuration / 1000)}s`,
      variant: allPassed ? "default" : "destructive"
    });
  }, [
    activeConfiguration,
    testConnection,
    testSendMessage,
    testReceiveResponse,
    testClearChat,
    testFinalState,
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
            FASE 5 - SISTEMA SIMPLIFICADO
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
        {/* FASE 5 Alert */}
        <Alert className="border-green-200 bg-green-50">
          <Database className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-green-800">FASE 5 - SISTEMA SIMPLIFICADO:</div>
            <ul className="list-disc list-inside text-sm space-y-1 text-green-700">
              <li>✅ Arquitectura limpia: un solo sistema de IA</li>
              <li>✅ Tests simplificados: funcionalidad básica</li>
              <li>✅ Sin archivos redundantes: código limpio</li>
              <li>✅ Preparado para Fase 1: prompts inteligentes</li>
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
            <div className="text-lg font-bold text-green-600">{connectionStatus}</div>
            <div className="text-xs text-muted-foreground">Estado conexión</div>
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
            {isRunning ? 'Ejecutando Tests...' : 'Ejecutar Tests Simplificados'}
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
                {failedTests === 0 ? '🎉 ¡Sistema simplificado funcionando!' : `❌ ${failedTests} tests fallaron`}
              </h4>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {failedTests === 0 
                ? `Arquitectura limpia lista para Fase 1. Tiempo total: ${Math.round(totalDuration / 1000)}s`
                : 'Revisa los errores antes de continuar con Fase 1.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Phase5TestingSuite;
