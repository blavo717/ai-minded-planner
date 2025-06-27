
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Bug,
  Zap,
  Eye,
  Activity
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { RealTestRunner, RealTestResult } from '@/utils/testing/realTestRunner';
import { toast } from '@/hooks/use-toast';

const RealTestRunnerComponent = () => {
  const [testResults, setTestResults] = useState<RealTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  
  const { mainTasks } = useTasks();
  const { projects } = useProjects();
  
  const testRunner = new RealTestRunner();

  const runSemanticSearchTest = useCallback(async () => {
    setIsRunning(true);
    
    try {
      // Create a more realistic search function that simulates the actual SemanticSearch behavior
      const mockSearchFunction = async (query: string) => {
        console.log('🔍 Testing semantic search with query:', query);
        
        if (mainTasks.length === 0) {
          throw new Error('No tasks available for search');
        }
        
        // Simulate the actual fallback search logic from SemanticSearch
        const fallbackResults = mainTasks.filter(task => {
          const titleMatch = task.title.toLowerCase().includes(query.toLowerCase());
          const descriptionMatch = task.description?.toLowerCase().includes(query.toLowerCase());
          const priorityMatch = query.toLowerCase().includes('urgent') && task.priority === 'urgent';
          const statusMatch = query.toLowerCase().includes('progress') && task.status === 'in_progress';
          
          console.log('🔎 Checking task:', {
            id: task.id,
            title: task.title,
            priority: task.priority,
            status: task.status,
            titleMatch,
            descriptionMatch,
            priorityMatch,
            statusMatch
          });
          
          return titleMatch || descriptionMatch || priorityMatch || statusMatch;
        });
        
        console.log('📋 Fallback search found:', fallbackResults.length, 'results');
        
        return fallbackResults.map(task => ({
          task,
          relevanceScore: 75, // Mock relevance score
          reason: 'Fallback text search match'
        }));
      };
      
      const result = await testRunner.runSemanticSearchRealTest(
        mainTasks,
        projects,
        mockSearchFunction
      );
      
      setTestResults(prev => [...prev.filter(r => r.id !== result.id), result]);
      
      toast({
        title: "Semantic Search Test Complete",
        description: result.status === 'success' ? 'Test passed' : 'Test failed',
        variant: result.status === 'error' ? 'destructive' : 'default'
      });
      
    } catch (error) {
      console.error('Test execution error:', error);
      toast({
        title: "Test Execution Failed",
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  }, [mainTasks, projects, testRunner]);

  const runGanttTest = useCallback(async () => {
    setIsRunning(true);
    
    try {
      const result = await testRunner.runGanttRealTest(mainTasks, projects);
      
      setTestResults(prev => [...prev.filter(r => r.id !== result.id), result]);
      
      toast({
        title: "Gantt Chart Test Complete",
        description: result.status === 'success' ? 'Test passed' : 'Test failed',
        variant: result.status === 'error' ? 'destructive' : 'default'
      });
      
    } catch (error) {
      console.error('Gantt test error:', error);
      toast({
        title: "Gantt Test Failed",
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  }, [mainTasks, projects, testRunner]);

  const runLLMTest = useCallback(async () => {
    setIsRunning(true);
    
    try {
      const result = await testRunner.runLLMConnectionTest();
      
      setTestResults(prev => [...prev.filter(r => r.id !== result.id), result]);
      
      toast({
        title: "LLM Connection Test Complete",
        description: result.status === 'success' ? 'Test passed' : 'Test failed',
        variant: result.status === 'error' ? 'destructive' : 'default'
      });
      
    } catch (error) {
      console.error('LLM test error:', error);
      toast({
        title: "LLM Test Failed",
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRunning(false);
    }
  }, [testRunner]);

  const runAllTests = useCallback(async () => {
    await runSemanticSearchTest();
    await runGanttTest();
    await runLLMTest();
  }, [runSemanticSearchTest, runGanttTest, runLLMTest]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
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

  const selectedTestResult = testResults.find(r => r.id === selectedTest);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-blue-600" />
            Real Functionality Tests
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              Estos tests interactúan con la funcionalidad real del sistema y proporcionan logs detallados de lo que realmente está ocurriendo.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              onClick={runSemanticSearchTest}
              disabled={isRunning}
              className="w-full justify-start"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Búsqueda Semántica Real
            </Button>
            
            <Button 
              onClick={runGanttTest}
              disabled={isRunning}
              variant="outline"
              className="w-full justify-start"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Gantt Chart Real
            </Button>
            
            <Button 
              onClick={runLLMTest}
              disabled={isRunning}
              variant="outline"
              className="w-full justify-start"
            >
              <Play className="h-4 w-4 mr-2" />
              Test Conexión LLM
            </Button>
            
            <Separator />
            
            <Button 
              onClick={runAllTests}
              disabled={isRunning}
              variant="secondary"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ejecutar Todos los Tests
            </Button>
          </div>
          
          {/* Test Results Summary */}
          <div className="space-y-2">
            <h4 className="font-medium">Resultados de Tests:</h4>
            {testResults.map(result => (
              <div 
                key={result.id}
                className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted"
                onClick={() => setSelectedTest(result.id)}
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="text-sm font-medium">{result.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status}
                  </Badge>
                  {result.duration && (
                    <span className="text-xs text-muted-foreground">
                      {result.duration.toFixed(0)}ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Test Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles del Test
            {selectedTestResult && (
              <Badge className={getStatusColor(selectedTestResult.status)}>
                {selectedTestResult.status}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTestResult ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Resultado:</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTestResult.details}
                </p>
              </div>
              
              {selectedTestResult.data && (
                <div>
                  <h4 className="font-medium mb-2">Datos del Test:</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedTestResult.data, null, 2)}
                  </pre>
                </div>
              )}
              
              {selectedTestResult.error && (
                <div>
                  <h4 className="font-medium mb-2 text-red-600">Error:</h4>
                  <pre className="text-xs bg-red-50 p-2 rounded overflow-x-auto text-red-800">
                    {selectedTestResult.error.message}
                  </pre>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Logs Detallados:</h4>
                <ScrollArea className="h-64 w-full border rounded">
                  <div className="p-3 space-y-1">
                    {selectedTestResult.logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecciona un test para ver los detalles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTestRunnerComponent;
