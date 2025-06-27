
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Download,
  Bug,
  Zap
} from 'lucide-react';
import { useFilterTesting, TestResult, TestLog } from '@/hooks/useFilterTesting';
import { Task } from '@/hooks/useTasks';
import { FilterState } from '@/types/filters';

interface FilterTestingSuiteProps {
  tasks: Task[];
  applyFilters: (filters: FilterState) => Task[];
  taskAssignments?: any[];
  taskDependencies?: any[];
}

const getStatusIcon = (status: TestResult['status']) => {
  switch (status) {
    case 'passed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'running':
      return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
};

const getStatusColor = (status: TestResult['status']) => {
  switch (status) {
    case 'passed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'running':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getLogIcon = (level: TestLog['level']) => {
  switch (level) {
    case 'ERROR':
      return <XCircle className="h-3 w-3 text-red-500" />;
    case 'WARNING':
      return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    default:
      return <CheckCircle className="h-3 w-3 text-blue-500" />;
  }
};

const FilterTestingSuite = ({ 
  tasks, 
  applyFilters, 
  taskAssignments = [], 
  taskDependencies = [] 
}: FilterTestingSuiteProps) => {
  const {
    testResults,
    testLogs,
    isRunning,
    progress,
    runAllTests,
    clearResults,
    getTestStats
  } = useFilterTesting(tasks, applyFilters, taskAssignments, taskDependencies);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const stats = getTestStats();

  const filteredResults = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(test => test.category === selectedCategory);

  const exportResults = () => {
    const report = {
      timestamp: new Date().toISOString(),
      stats,
      tests: testResults,
      logs: testLogs.slice(0, 50) // Last 50 logs
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filter-test-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Suite de Testing de Filtros
            <Badge variant="outline" className="ml-2">
              {stats.total} tests
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {stats.total > 0 && (
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={clearResults}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Ejecutando...' : 'Ejecutar Tests'}
            </Button>
          </div>
        </CardTitle>
        
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progreso del testing</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Dashboard */}
        {stats.total > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
                  <div className="text-xs text-muted-foreground">Pasaron</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                  <div className="text-xs text-muted-foreground">Fallaron</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
                  <div className="text-xs text-muted-foreground">Advertencias</div>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.running}</div>
                  <div className="text-xs text-muted-foreground">Ejecutando</div>
                </div>
              </div>
            </Card>
          </div>
        )}

        <Tabs defaultValue="tests" className="w-full">
          <TabsList>
            <TabsTrigger value="tests">Resultados de Tests</TabsTrigger>
            <TabsTrigger value="logs">Logs del Sistema</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tests" className="space-y-4">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                Todos ({testResults.length})
              </Button>
              <Button
                variant={selectedCategory === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('basic')}
              >
                Básicos ({testResults.filter(t => t.category === 'basic').length})
              </Button>
              <Button
                variant={selectedCategory === 'smart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('smart')}
              >
                Inteligentes ({testResults.filter(t => t.category === 'smart').length})
              </Button>
              <Button
                variant={selectedCategory === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('advanced')}
              >
                Avanzados ({testResults.filter(t => t.category === 'advanced').length})
              </Button>
            </div>

            {/* Test Results */}
            <ScrollArea className="h-96 w-full border rounded-md">
              <div className="p-4 space-y-3">
                {filteredResults.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    {testResults.length === 0 
                      ? "No hay tests ejecutados. Presiona 'Ejecutar Tests' para comenzar."
                      : "No hay tests en esta categoría."
                    }
                  </div>
                ) : (
                  filteredResults.map((test) => (
                    <Card key={test.id} className={`border-l-4 ${getStatusColor(test.status)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getStatusIcon(test.status)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{test.name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {test.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {test.message}
                              </p>
                              {test.timestamp && (
                                <p className="text-xs text-muted-foreground">
                                  {new Date(test.timestamp).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <ScrollArea className="h-96 w-full border rounded-md">
              <div className="p-4 space-y-2">
                {testLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No hay logs disponibles.
                  </div>
                ) : (
                  testLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                      {getLogIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.details && (
                          <pre className="text-xs text-muted-foreground mt-1 bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FilterTestingSuite;
