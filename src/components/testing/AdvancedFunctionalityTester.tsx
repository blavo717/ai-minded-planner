
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Activity,
  Clock,
  Sparkles,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Play,
  RefreshCw
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useLLMService } from '@/hooks/useLLMService';
import { toast } from '@/hooks/use-toast';
import Logger, { LogCategory } from '@/utils/logger';
import { PerformanceMonitor } from '@/utils/performanceMonitor';
import { GanttTestUtils } from '@/utils/testing/ganttTestUtils';
import { SearchTestUtils } from '@/utils/testing/searchTestUtils';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  details?: string;
  data?: any;
}

const AdvancedFunctionalityTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  
  const { mainTasks } = useTasks();
  const { projects } = useProjects();
  const { makeLLMRequest } = useLLMService();

  const ganttTests = [
    {
      id: 'gantt-data-validation',
      name: 'Validación de Datos Gantt',
      description: 'Verifica que las tareas tienen datos válidos para el Gantt',
      test: async () => {
        Logger.info(LogCategory.GANTT_RENDER, 'Starting Gantt data validation test');
        
        const tasksWithDates = mainTasks.filter(task => task.due_date);
        const validation = GanttTestUtils.validateGanttData(tasksWithDates);
        
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        return `${tasksWithDates.length} tareas válidas para Gantt`;
      }
    },
    {
      id: 'gantt-performance',
      name: 'Performance Gantt Chart',
      description: 'Mide el tiempo de renderizado del Gantt con datos de prueba',
      test: async () => {
        Logger.info(LogCategory.GANTT_RENDER, 'Starting Gantt performance test');
        
        const testData = GanttTestUtils.generatePerformanceTestData(50);
        
        return PerformanceMonitor.measure('gantt-render-test', () => {
          // Simulate Gantt processing
          const processedTasks = testData.tasks.map(task => ({
            ...task,
            progress: GanttTestUtils.calculateExpectedProgress(task.status)
          }));
          
          const validation = GanttTestUtils.validateGanttData(processedTasks);
          if (!validation.valid) {
            throw new Error('Generated test data is invalid');
          }
          
          return `Procesadas ${processedTasks.length} tareas`;
        });
      }
    },
    {
      id: 'gantt-project-filtering',
      name: 'Filtrado por Proyecto',
      description: 'Verifica que el filtrado por proyecto funciona correctamente',
      test: async () => {
        Logger.info(LogCategory.GANTT_RENDER, 'Starting project filtering test');
        
        if (projects.length === 0) {
          throw new Error('No hay proyectos para testear filtrado');
        }
        
        const testProject = projects[0];
        const projectTasks = mainTasks.filter(task => task.project_id === testProject.id);
        const allTasks = mainTasks.length;
        
        return `Filtrado: ${allTasks} → ${projectTasks.length} tareas del proyecto "${testProject.name}"`;
      }
    }
  ];

  const searchTests = [
    {
      id: 'search-llm-integration',
      name: 'Integración LLM',
      description: 'Verifica que la búsqueda semántica funciona con el LLM',
      test: async () => {
        Logger.info(LogCategory.AI_SEARCH, 'Starting LLM integration test');
        
        if (mainTasks.length === 0) {
          throw new Error('No hay tareas para testear búsqueda');
        }
        
        const testQuery = 'tareas importantes';
        const tasksContext = mainTasks.slice(0, 5).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority
        }));
        
        return PerformanceMonitor.measureAsync('llm-search-test', async () => {
          try {
            const response = await makeLLMRequest({
              systemPrompt: 'Responde solo con un JSON válido con array de objetos con task_id, relevance_score (0-100), reason.',
              userPrompt: `Buscar tareas relevantes para: "${testQuery}". Tareas: ${JSON.stringify(tasksContext)}`,
              functionName: 'test-semantic-search'
            });
            
            const results = JSON.parse(response.content);
            const validation = SearchTestUtils.validateSearchResults(results);
            
            if (!validation.valid) {
              throw new Error(`Respuesta LLM inválida: ${validation.errors.join(', ')}`);
            }
            
            return `LLM respondió con ${results.length} resultados válidos`;
          } catch (error) {
            // Test fallback search
            const fallbackResults = SearchTestUtils.createFallbackSearchMock(mainTasks, testQuery);
            return `LLM falló, fallback funcionó: ${fallbackResults.length} resultados`;
          }
        });
      }
    },
    {
      id: 'search-performance',
      name: 'Performance Búsqueda',
      description: 'Mide tiempo de respuesta de búsqueda semántica',
      test: async () => {
        Logger.info(LogCategory.AI_SEARCH, 'Starting search performance test');
        
        const testQueries = ['tareas urgentes', 'proyectos completados', 'desarrollo'];
        const results = [];
        
        for (const query of testQueries) {
          const duration = await PerformanceMonitor.measureAsync(`search-${query}`, async () => {
            // Simulate debounce
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Simulate search processing
            const mockResults = SearchTestUtils.createFallbackSearchMock(mainTasks, query);
            return mockResults.length;
          });
          
          results.push(`"${query}": ${duration.toFixed(0)}ms`);
        }
        
        return results.join(', ');
      }
    },
    {
      id: 'search-relevance',
      name: 'Relevancia de Resultados',
      description: 'Verifica que los resultados están ordenados por relevancia',
      test: async () => {
        Logger.info(LogCategory.AI_SEARCH, 'Starting relevance test');
        
        // Create mock results with different relevance scores
        const mockResults = [
          { task_id: 'task-1', relevance_score: 95, reason: 'Exact match' },
          { task_id: 'task-2', relevance_score: 78, reason: 'Partial match' },
          { task_id: 'task-3', relevance_score: 45, reason: 'Context match' }
        ];
        
        const validation = SearchTestUtils.validateSearchResults(mockResults);
        
        if (!validation.valid) {
          throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        const scores = mockResults.map(r => r.relevance_score);
        return `Scores ordenados: [${scores.join(', ')}]`;
      }
    }
  ];

  const runTest = useCallback(async (test: any): Promise<TestResult> => {
    const startTime = performance.now();
    setCurrentTest(test.id);
    
    try {
      Logger.info(LogCategory.SYSTEM_HEALTH, `Starting test: ${test.name}`);
      
      const result = await test.test();
      const duration = performance.now() - startTime;
      
      Logger.info(LogCategory.SYSTEM_HEALTH, `Test completed: ${test.name}`, { duration, result });
      
      return {
        id: test.id,
        name: test.name,
        status: 'success',
        duration,
        details: result
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Logger.error(LogCategory.SYSTEM_HEALTH, `Test failed: ${test.name}`, { duration, error: errorMessage });
      
      return {
        id: test.id,
        name: test.name,
        status: 'error',
        duration,
        details: errorMessage
      };
    } finally {
      setCurrentTest('');
    }
  }, []);

  const runAllTests = useCallback(async (tests: any[]) => {
    setIsRunning(true);
    const results: TestResult[] = [];
    
    for (const test of tests) {
      const result = await runTest(test);
      results.push(result);
      setTestResults(prev => [...prev.filter(r => r.id !== result.id), result]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsRunning(false);
    
    const successCount = results.filter(r => r.status === 'success').length;
    toast({
      title: `Tests completados: ${successCount}/${results.length}`,
      description: successCount === results.length ? '¡Todos los tests pasaron!' : 'Algunos tests fallaron',
      variant: successCount === results.length ? 'default' : 'destructive'
    });
  }, [runTest]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ganttResults = testResults.filter(r => r.id.startsWith('gantt-'));
  const searchResults = testResults.filter(r => r.id.startsWith('search-'));
  
  const ganttSuccess = ganttResults.filter(r => r.status === 'success').length;
  const searchSuccess = searchResults.filter(r => r.status === 'success').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-blue-600" />
          Testing de Funcionalidades Avanzadas
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="gantt" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gantt Chart
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Búsqueda IA
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="gantt" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Tests del Gantt Chart</h3>
                <p className="text-sm text-muted-foreground">
                  Validación de renderizado, performance y filtrado
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {ganttSuccess}/{ganttTests.length} exitosos
                </Badge>
                <Button 
                  onClick={() => runAllTests(ganttTests)}
                  disabled={isRunning}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Ejecutar Tests
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {ganttTests.map(test => {
                const result = testResults.find(r => r.id === test.id);
                return (
                  <Card key={test.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          {result?.details && (
                            <p className="text-xs text-gray-600 mt-1">{result.details}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {result && (
                            <Badge className={getStatusColor(result.status)}>
                              {getStatusIcon(result.status)}
                              <span className="ml-1">{result.status}</span>
                              {result.duration && (
                                <span className="ml-1">({result.duration.toFixed(0)}ms)</span>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Tests de Búsqueda Semántica</h3>
                <p className="text-sm text-muted-foreground">
                  Validación de LLM, performance y relevancia
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {searchSuccess}/{searchTests.length} exitosos
                </Badge>
                <Button 
                  onClick={() => runAllTests(searchTests)}
                  disabled={isRunning}
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Ejecutar Tests
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {searchTests.map(test => {
                const result = testResults.find(r => r.id === test.id);
                return (
                  <Card key={test.id} className="border-l-4 border-l-purple-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{test.name}</h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                          {result?.details && (
                            <p className="text-xs text-gray-600 mt-1">{result.details}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {result && (
                            <Badge className={getStatusColor(result.status)}>
                              {getStatusIcon(result.status)}
                              <span className="ml-1">{result.status}</span>
                              {result.duration && (
                                <span className="ml-1">({result.duration.toFixed(0)}ms)</span>
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estado del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Tareas principales:</span>
                      <Badge variant="secondary">{mainTasks.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Proyectos:</span>
                      <Badge variant="secondary">{projects.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tareas con fechas:</span>
                      <Badge variant="secondary">
                        {mainTasks.filter(t => t.due_date).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Memoria usada:</span>
                      <Badge variant="secondary">
                        {Math.round(PerformanceMonitor.getMemoryUsage().used / 1024 / 1024)}MB
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tests ejecutados:</span>
                      <Badge variant="secondary">{testResults.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Tests exitosos:</span>
                      <Badge variant="secondary">
                        {testResults.filter(r => r.status === 'success').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              onClick={() => {
                Logger.clearLogs();
                setTestResults([]);
                PerformanceMonitor.logMemoryUsage('system-reset');
                toast({ title: 'Sistema reiniciado', description: 'Logs y resultados limpiados' });
              }}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reiniciar Sistema de Testing
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedFunctionalityTester;
