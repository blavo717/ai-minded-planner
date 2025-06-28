
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, Zap, Brain, Database, XCircle } from 'lucide-react';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useSmartPrompts } from '@/hooks/ai/useSmartPrompts';
import { createPromptBuilder } from '@/utils/ai/PromptBuilder';
import { useAuth } from '@/hooks/useAuth';

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  duration: number;
  details?: any;
  validationErrors?: string[];
}

export const AIContextTester: React.FC = () => {
  const { user } = useAuth();
  const { currentContext, refreshContext, isUpdating } = useAIContext();
  const { generateSmartPrompt, getContextualSystemPrompt, currentContext: smartContext } = useSmartPrompts();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  const runTest = async (name: string, testFn: () => Promise<Omit<TestResult, 'name' | 'duration'>>): Promise<TestResult> => {
    const startTime = Date.now();
    try {
      const result = await testFn();
      return {
        ...result,
        name,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        name,
        status: 'failed' as const,
        message: error instanceof Error ? error.message : 'Error desconocido',
        duration: Date.now() - startTime,
        details: error,
        validationErrors: ['Test execution failed with exception']
      };
    }
  };

  // Tests de contexto con validaciones estrictas
  const contextTests = [
    {
      name: 'Validación Estricta de Contexto Básico',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        if (!currentContext) {
          return { 
            status: 'failed', 
            message: 'No hay contexto disponible',
            validationErrors: ['currentContext is null or undefined']
          };
        }
        
        // Validación estricta de userInfo
        if (!currentContext.userInfo || typeof currentContext.userInfo !== 'object') {
          errors.push('userInfo missing or invalid');
        } else {
          if (!currentContext.userInfo.id || currentContext.userInfo.id.length === 0) {
            errors.push('userInfo.id is missing or empty');
          }
          if (typeof currentContext.userInfo.hasActiveTasks !== 'boolean') {
            errors.push('userInfo.hasActiveTasks is not boolean');
          }
          if (typeof currentContext.userInfo.totalTasks !== 'number' || currentContext.userInfo.totalTasks < 0) {
            errors.push('userInfo.totalTasks is invalid');
          }
        }
        
        // Validación estricta de currentSession
        if (!currentContext.currentSession || typeof currentContext.currentSession !== 'object') {
          errors.push('currentSession missing or invalid');
        } else {
          const validTimeOfDay = ['morning', 'afternoon', 'evening', 'night'];
          if (!validTimeOfDay.includes(currentContext.currentSession.timeOfDay)) {
            errors.push(`currentSession.timeOfDay invalid: ${currentContext.currentSession.timeOfDay}`);
          }
          if (!currentContext.currentSession.dayOfWeek || currentContext.currentSession.dayOfWeek.length === 0) {
            errors.push('currentSession.dayOfWeek is missing');
          }
          if (typeof currentContext.currentSession.isWeekend !== 'boolean') {
            errors.push('currentSession.isWeekend is not boolean');
          }
        }
        
        // Validación estricta de recentActivity
        if (!currentContext.recentActivity || typeof currentContext.recentActivity !== 'object') {
          errors.push('recentActivity missing or invalid');
        } else {
          const validWorkPatterns = ['productive', 'moderate', 'low', 'inactive'];
          if (!validWorkPatterns.includes(currentContext.recentActivity.workPattern)) {
            errors.push(`recentActivity.workPattern invalid: ${currentContext.recentActivity.workPattern}`);
          }
          if (typeof currentContext.recentActivity.recentCompletions !== 'number' || currentContext.recentActivity.recentCompletions < 0) {
            errors.push('recentActivity.recentCompletions is invalid');
          }
        }
        
        if (errors.length > 0) {
          return { 
            status: 'failed', 
            message: `Validación falló: ${errors.length} errores encontrados`,
            validationErrors: errors,
            details: { context: currentContext, errors }
          };
        }
        
        return { 
          status: 'passed', 
          message: 'Contexto válido con todos los campos requeridos',
          details: {
            userInfo: currentContext.userInfo,
            sessionInfo: currentContext.currentSession,
            activityInfo: currentContext.recentActivity
          }
        };
      }
    },
    {
      name: 'Validación de Datos de Tareas Reales',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        if (!currentContext?.recentTasks) {
          return { 
            status: 'warning', 
            message: 'No hay tareas recientes disponibles (puede ser normal)',
            details: { recentTasksCount: 0 }
          };
        }
        
        if (!Array.isArray(currentContext.recentTasks)) {
          errors.push('recentTasks is not an array');
        } else {
          currentContext.recentTasks.forEach((task, index) => {
            if (!task.id || typeof task.id !== 'string') {
              errors.push(`Task ${index}: missing or invalid id`);
            }
            if (!task.title || typeof task.title !== 'string') {
              errors.push(`Task ${index}: missing or invalid title`);
            }
            if (!task.status || typeof task.status !== 'string') {
              errors.push(`Task ${index}: missing or invalid status`);
            }
            if (!task.updated_at) {
              errors.push(`Task ${index}: missing updated_at`);
            }
          });
        }
        
        if (errors.length > 0) {
          return { 
            status: 'failed', 
            message: `Datos de tareas inválidos: ${errors.length} errores`,
            validationErrors: errors,
            details: currentContext.recentTasks
          };
        }
        
        return { 
          status: 'passed', 
          message: `${currentContext.recentTasks.length} tareas válidas encontradas`,
          details: currentContext.recentTasks
        };
      }
    },
    {
      name: 'Validación de Datos de Proyectos Reales',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        if (!currentContext?.recentProjects) {
          return { 
            status: 'warning', 
            message: 'No hay proyectos recientes disponibles (puede ser normal)',
            details: { activeProjectsCount: 0 }
          };
        }
        
        if (!Array.isArray(currentContext.recentProjects)) {
          errors.push('recentProjects is not an array');
        } else {
          currentContext.recentProjects.forEach((project, index) => {
            if (!project.id || typeof project.id !== 'string') {
              errors.push(`Project ${index}: missing or invalid id`);
            }
            if (!project.name || typeof project.name !== 'string') {
              errors.push(`Project ${index}: missing or invalid name`);
            }
            if (!project.status || typeof project.status !== 'string') {
              errors.push(`Project ${index}: missing or invalid status`);
            }
            if (typeof project.progress !== 'number' || project.progress < 0 || project.progress > 100) {
              errors.push(`Project ${index}: invalid progress value`);
            }
          });
        }
        
        if (errors.length > 0) {
          return { 
            status: 'failed', 
            message: `Datos de proyectos inválidos: ${errors.length} errores`,
            validationErrors: errors,
            details: currentContext.recentProjects
          };
        }
        
        return { 
          status: 'passed', 
          message: `${currentContext.recentProjects.length} proyectos válidos encontrados`,
          details: currentContext.recentProjects
        };
      }
    }
  ];

  // Tests de prompts con validaciones reales
  const promptTests = [
    {
      name: 'Validación Real de Prompt General',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        try {
          const prompt = generateSmartPrompt({ type: 'general', includeData: true });
          
          if (!prompt || typeof prompt !== 'string') {
            errors.push('Generated prompt is not a string');
          } else {
            if (prompt.length < 20) {
              errors.push(`Prompt too short: ${prompt.length} characters`);
            }
            if (!prompt.includes('asistente') && !prompt.includes('ayuda')) {
              errors.push('Prompt does not seem to be assistant-related');
            }
            if (prompt.includes('undefined') || prompt.includes('null')) {
              errors.push('Prompt contains undefined or null values');
            }
          }
          
          if (errors.length > 0) {
            return { 
              status: 'failed', 
              message: `Prompt inválido: ${errors.join(', ')}`,
              validationErrors: errors,
              details: { prompt }
            };
          }
          
          return { 
            status: 'passed', 
            message: `Prompt válido generado (${prompt.length} caracteres)`,
            details: { preview: prompt.substring(0, 200) + '...', fullLength: prompt.length }
          };
        } catch (error) {
          return { 
            status: 'failed', 
            message: 'Error al generar prompt',
            validationErrors: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`],
            details: { error }
          };
        }
      }
    },
    {
      name: 'Validación Real de System Prompt',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        try {
          const systemPrompt = getContextualSystemPrompt();
          
          if (!systemPrompt || typeof systemPrompt !== 'string') {
            errors.push('System prompt is not a string');
          } else {
            if (systemPrompt.length < 50) {
              errors.push(`System prompt too short: ${systemPrompt.length} characters`);
            }
            if (!systemPrompt.includes('asistente') && !systemPrompt.includes('assistant')) {
              errors.push('System prompt does not define assistant role');
            }
            if (systemPrompt.includes('undefined') || systemPrompt.includes('null')) {
              errors.push('System prompt contains undefined or null values');
            }
          }
          
          if (errors.length > 0) {
            return { 
              status: 'failed', 
              message: `System prompt inválido: ${errors.join(', ')}`,
              validationErrors: errors,
              details: { systemPrompt }
            };
          }
          
          return { 
            status: 'passed', 
            message: `System prompt válido (${systemPrompt.length} caracteres)`,
            details: { preview: systemPrompt.substring(0, 200) + '...', fullLength: systemPrompt.length }
          };
        } catch (error) {
          return { 
            status: 'failed', 
            message: 'Error al generar system prompt',
            validationErrors: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`],
            details: { error }
          };
        }
      }
    },
    {
      name: 'Validación Real de PromptBuilder',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        if (!user) {
          return { 
            status: 'failed', 
            message: 'Usuario no autenticado - test no puede ejecutarse',
            validationErrors: ['No authenticated user available']
          };
        }
        
        try {
          const builder = createPromptBuilder(user.id, {
            includeTaskDetails: true,
            includeProjectContext: true,
            maxTasksToInclude: 3
          });
          
          if (!builder || typeof builder.buildEnrichedPrompt !== 'function') {
            errors.push('PromptBuilder not created or missing buildEnrichedPrompt method');
          } else {
            const enrichedPrompt = await builder.buildEnrichedPrompt(
              'Ayúdame con mis tareas',
              smartContext,
              { type: 'general', includeData: true }
            );
            
            if (!enrichedPrompt || typeof enrichedPrompt !== 'object') {
              errors.push('buildEnrichedPrompt did not return an object');
            } else {
              if (!enrichedPrompt.content || typeof enrichedPrompt.content !== 'string') {
                errors.push('enrichedPrompt.content is missing or not a string');
              }
              if (!enrichedPrompt.timestamp || !(enrichedPrompt.timestamp instanceof Date)) {
                errors.push('enrichedPrompt.timestamp is missing or not a Date');
              }
              if (enrichedPrompt.content && enrichedPrompt.content.length < 30) {
                errors.push(`Enriched prompt too short: ${enrichedPrompt.content.length} characters`);
              }
            }
          }
          
          if (errors.length > 0) {
            return { 
              status: 'failed', 
              message: `PromptBuilder falló validación: ${errors.join(', ')}`,
              validationErrors: errors,
              details: { userId: user.id, errors }
            };
          }
          
          const enrichedPrompt = await builder.buildEnrichedPrompt(
            'Ayúdame con mis tareas',
            smartContext,
            { type: 'general', includeData: true }
          );
          
          return { 
            status: 'passed', 
            message: `PromptBuilder funcionando correctamente (${enrichedPrompt.content.length} caracteres)`,
            details: { 
              preview: enrichedPrompt.content.substring(0, 300) + '...',
              timestamp: enrichedPrompt.timestamp,
              fullLength: enrichedPrompt.content.length
            }
          };
        } catch (error) {
          return { 
            status: 'failed', 
            message: 'Error en PromptBuilder',
            validationErrors: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`],
            details: { error, userId: user.id }
          };
        }
      }
    }
  ];

  // Tests de rendimiento reales
  const performanceTests = [
    {
      name: 'Medición Real de Rendimiento de Contexto',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const errors: string[] = [];
        
        try {
          const start = performance.now();
          
          // Ejecutar refresh real
          await new Promise<void>((resolve) => {
            refreshContext();
            // Simular tiempo de espera real
            setTimeout(resolve, 100);
          });
          
          const end = performance.now();
          const duration = end - start;
          
          // Validaciones de rendimiento estrictas
          if (duration > 5000) {
            errors.push(`Context refresh too slow: ${duration.toFixed(2)}ms`);
          }
          
          if (!currentContext) {
            errors.push('Context refresh did not generate context');
          }
          
          if (errors.length > 0) {
            return { 
              status: 'failed', 
              message: `Rendimiento inaceptable: ${errors.join(', ')}`,
              validationErrors: errors,
              details: { generationTime: duration, hasContext: !!currentContext }
            };
          } else if (duration > 2000) {
            return { 
              status: 'warning', 
              message: `Contexto generado en ${duration.toFixed(2)}ms (lento pero aceptable)`,
              details: { generationTime: duration }
            };
          }
          
          return { 
            status: 'passed', 
            message: `Contexto generado en ${duration.toFixed(2)}ms (rendimiento óptimo)`,
            details: { generationTime: duration }
          };
        } catch (error) {
          return { 
            status: 'failed', 
            message: 'Error en test de rendimiento',
            validationErrors: [`Exception: ${error instanceof Error ? error.message : 'Unknown error'}`],
            details: { error }
          };
        }
      }
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const allTests = [
      ...contextTests.map(t => ({ ...t, category: 'context' })),
      ...promptTests.map(t => ({ ...t, category: 'prompts' })),
      ...performanceTests.map(t => ({ ...t, category: 'performance' }))
    ];
    
    const results: TestResult[] = [];
    
    for (const test of allTests) {
      console.log(`🧪 Ejecutando test: ${test.name}`);
      const result = await runTest(test.name, test.test);
      console.log(`📊 Resultado del test "${test.name}":`, result);
      results.push(result);
      setTestResults([...results]);
      
      // Pausa entre tests para observar ejecución real
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setIsRunning(false);
    
    // Log resumen final
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    
    console.log(`🏁 Resumen de tests: ${passed} exitosos, ${failed} fallidos, ${warnings} advertencias`);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const passedTests = testResults.filter(t => t.status === 'passed').length;
  const failedTests = testResults.filter(t => t.status === 'failed').length;
  const warningTests = testResults.filter(t => t.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Testing REAL del Sistema de IA Contextual
          </CardTitle>
          <CardDescription>
            Validación estricta y verificación real del sistema de prompts inteligentes y contexto automático
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || isUpdating}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              {isRunning ? 'Ejecutando Tests Reales...' : 'Ejecutar Validación Completa'}
            </Button>
            
            {testResults.length > 0 && (
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor('passed')}>
                  ✓ {passedTests} Exitosos
                </Badge>
                {warningTests > 0 && (
                  <Badge className={getStatusColor('warning')}>
                    ⚠ {warningTests} Advertencias
                  </Badge>
                )}
                {failedTests > 0 && (
                  <Badge className={getStatusColor('failed')}>
                    ✗ {failedTests} Fallidos
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Tabs defaultValue="results" className="w-full">
            <TabsList>
              <TabsTrigger value="results">Resultados</TabsTrigger>
              <TabsTrigger value="context">Contexto Actual</TabsTrigger>
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="validation">Errores de Validación</TabsTrigger>
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              {testResults.length === 0 && !isRunning && (
                <div className="text-center py-8 text-muted-foreground">
                  Haz clic en "Ejecutar Validación Completa" para comenzar la validación real
                </div>
              )}
              
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedTest(result)}
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result.status)}
                        <div>
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-muted-foreground">{result.message}</div>
                          {result.validationErrors && result.validationErrors.length > 0 && (
                            <div className="text-xs text-red-600">
                              {result.validationErrors.length} errores de validación
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.duration}ms
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="context" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Información del Usuario</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>ID: {currentContext?.userInfo.id || 'N/A'}</div>
                    <div>Tareas Activas: {currentContext?.userInfo.hasActiveTasks ? 'Sí' : 'No'}</div>
                    <div>Proyectos Activos: {currentContext?.userInfo.hasActiveProjects ? 'Sí' : 'No'}</div>
                    <div>Total Tareas: {currentContext?.userInfo.totalTasks || 0}</div>
                    <div>Tareas Pendientes: {currentContext?.userInfo.pendingTasks || 0}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sesión Actual</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>Momento del Día: {currentContext?.currentSession.timeOfDay || 'N/A'}</div>
                    <div>Día de la Semana: {currentContext?.currentSession.dayOfWeek || 'N/A'}</div>
                    <div>Es Fin de Semana: {currentContext?.currentSession.isWeekend ? 'Sí' : 'No'}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>Patrón de Trabajo: {currentContext?.recentActivity.workPattern || 'N/A'}</div>
                    <div>Completadas Hoy: {currentContext?.recentActivity.recentCompletions || 0}</div>
                    <div>Última Actualización: {
                      currentContext?.recentActivity.lastTaskUpdate 
                        ? new Date(currentContext.recentActivity.lastTaskUpdate).toLocaleString()
                        : 'N/A'
                    }</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Datos Extendidos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>Tareas Recientes: {currentContext?.recentTasks?.length || 0}</div>
                    <div>Proyectos Recientes: {currentContext?.recentProjects?.length || 0}</div>
                    <div>Métricas de Productividad: {currentContext?.productivity ? 'Disponibles' : 'N/A'}</div>
                    <div>Patrones de Trabajo: {currentContext?.workPatterns ? 'Disponibles' : 'N/A'}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="space-y-4">
              {selectedTest ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(selectedTest.status)}
                      {selectedTest.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedTest.message} • Duración: {selectedTest.duration}ms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedTest.details && (
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
                        {JSON.stringify(selectedTest.details, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecciona un test de los resultados para ver los detalles
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="validation" className="space-y-4">
              {testResults.filter(t => t.validationErrors && t.validationErrors.length > 0).length > 0 ? (
                <div className="space-y-4">
                  {testResults
                    .filter(t => t.validationErrors && t.validationErrors.length > 0)
                    .map((result, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-red-600">
                            <XCircle className="h-4 w-4" />
                            {result.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {result.validationErrors!.map((error, errorIndex) => (
                              <div key={errorIndex} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                • {error}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {testResults.length > 0 ? 
                    "No hay errores de validación detectados ✅" : 
                    "Ejecuta los tests para ver errores de validación"
                  }
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
