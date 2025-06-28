
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, Zap, Brain, Database } from 'lucide-react';
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
        details: error
      };
    }
  };

  const contextTests = [
    {
      name: 'Generación de Contexto Básico',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        if (!currentContext) {
          return { status: 'failed', message: 'No se pudo generar contexto' };
        }
        
        const hasUserInfo = currentContext.userInfo && currentContext.userInfo.id;
        const hasSessionInfo = currentContext.currentSession && currentContext.currentSession.timeOfDay;
        const hasActivityInfo = currentContext.recentActivity;
        
        if (hasUserInfo && hasSessionInfo && hasActivityInfo) {
          return { 
            status: 'passed', 
            message: 'Contexto generado correctamente',
            details: {
              userInfo: !!hasUserInfo,
              sessionInfo: !!hasSessionInfo,
              activityInfo: !!hasActivityInfo
            }
          };
        }
        
        return { 
          status: 'warning', 
          message: 'Contexto parcialmente generado',
          details: { hasUserInfo, hasSessionInfo, hasActivityInfo }
        };
      }
    },
    {
      name: 'Datos de Tareas Recientes',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const hasRecentTasks = currentContext?.recentTasks && currentContext.recentTasks.length > 0;
        
        if (hasRecentTasks) {
          return { 
            status: 'passed', 
            message: `${currentContext.recentTasks.length} tareas recientes encontradas`,
            details: currentContext.recentTasks
          };
        }
        
        return { 
          status: 'warning', 
          message: 'No hay tareas recientes disponibles',
          details: { recentTasksCount: 0 }
        };
      }
    },
    {
      name: 'Datos de Proyectos Activos',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const hasActiveProjects = currentContext?.recentProjects && currentContext.recentProjects.length > 0;
        
        if (hasActiveProjects) {
          return { 
            status: 'passed', 
            message: `${currentContext.recentProjects.length} proyectos activos encontrados`,
            details: currentContext.recentProjects
          };
        }
        
        return { 
          status: 'warning', 
          message: 'No hay proyectos activos disponibles',
          details: { activeProjectsCount: 0 }
        };
      }
    }
  ];

  const promptTests = [
    {
      name: 'Generación de Prompt General',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const prompt = generateSmartPrompt({ type: 'general', includeData: true });
        
        if (prompt && prompt.length > 50) {
          return { 
            status: 'passed', 
            message: `Prompt generado (${prompt.length} caracteres)`,
            details: { prompt: prompt.substring(0, 200) + '...' }
          };
        }
        
        return { 
          status: 'failed', 
          message: 'No se pudo generar prompt o es muy corto',
          details: { prompt }
        };
      }
    },
    {
      name: 'Prompt Contextual del Sistema',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const systemPrompt = getContextualSystemPrompt();
        
        if (systemPrompt && systemPrompt.length > 100) {
          return { 
            status: 'passed', 
            message: `System prompt generado (${systemPrompt.length} caracteres)`,
            details: { systemPrompt: systemPrompt.substring(0, 200) + '...' }
          };
        }
        
        return { 
          status: 'failed', 
          message: 'No se pudo generar system prompt',
          details: { systemPrompt }
        };
      }
    },
    {
      name: 'PromptBuilder con Datos de Supabase',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        if (!user) {
          return { status: 'failed', message: 'Usuario no autenticado' };
        }
        
        const builder = createPromptBuilder(user.id, {
          includeTaskDetails: true,
          includeProjectContext: true,
          maxTasksToInclude: 3
        });
        
        const enrichedPrompt = await builder.buildEnrichedPrompt(
          'Ayúdame con mis tareas',
          smartContext,
          { type: 'general', includeData: true }
        );
        
        if (enrichedPrompt && enrichedPrompt.content.length > 100) {
          return { 
            status: 'passed', 
            message: `Prompt enriquecido generado (${enrichedPrompt.content.length} caracteres)`,
            details: { 
              content: enrichedPrompt.content.substring(0, 300) + '...',
              timestamp: enrichedPrompt.timestamp
            }
          };
        }
        
        return { 
          status: 'failed', 
          message: 'Error al generar prompt enriquecido',
          details: enrichedPrompt
        };
      }
    }
  ];

  const performanceTests = [
    {
      name: 'Tiempo de Generación de Contexto',
      test: async (): Promise<Omit<TestResult, 'name' | 'duration'>> => {
        const start = performance.now();
        refreshContext();
        const end = performance.now();
        const duration = end - start;
        
        if (duration < 1000) {
          return { 
            status: 'passed', 
            message: `Contexto generado en ${duration.toFixed(2)}ms`,
            details: { generationTime: duration }
          };
        } else if (duration < 3000) {
          return { 
            status: 'warning', 
            message: `Contexto generado en ${duration.toFixed(2)}ms (lento)`,
            details: { generationTime: duration }
          };
        }
        
        return { 
          status: 'failed', 
          message: `Contexto muy lento: ${duration.toFixed(2)}ms`,
          details: { generationTime: duration }
        };
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
      const result = await runTest(test.name, test.test);
      results.push(result);
      setTestResults([...results]);
      
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
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
            Testing del Sistema de IA Contextual
          </CardTitle>
          <CardDescription>
            Validación completa del sistema de prompts inteligentes y contexto automático
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
              {isRunning ? 'Ejecutando Tests...' : 'Ejecutar Todos los Tests'}
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
            </TabsList>
            
            <TabsContent value="results" className="space-y-4">
              {testResults.length === 0 && !isRunning && (
                <div className="text-center py-8 text-muted-foreground">
                  Haz clic en "Ejecutar Todos los Tests" para comenzar la validación
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
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
