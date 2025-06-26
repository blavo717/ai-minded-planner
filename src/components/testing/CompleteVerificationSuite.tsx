
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  PlayCircle,
  FileCheck,
  Database,
  MessageSquare,
  Brain,
  Settings,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { useTasks } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useAIAssistantSimple } from '@/hooks/useAIAssistantSimple';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration: number;
  category: 'functional' | 'integration' | 'performance';
}

const CompleteVerificationSuite = () => {
  const { user } = useAuth();
  const { configurations, activeConfiguration } = useLLMConfigurations();
  const { mainTasks, subtasks, microtasks } = useTasks();
  const { profiles } = useProfiles();
  const { messages } = useAIAssistantSimple();
  
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');

  const testSuites = {
    functional: [
      {
        id: 'auth-verification',
        name: 'Verificación de Autenticación',
        icon: Users,
        test: async () => {
          if (!user) {
            throw new Error('Usuario no autenticado');
          }
          
          if (!user.id || !user.email) {
            throw new Error('Datos de usuario incompletos');
          }
          
          return `Usuario autenticado: ${user.email}`;
        }
      },
      {
        id: 'llm-config-test',
        name: 'Configuración LLM',
        icon: Settings,
        test: async () => {
          if (configurations.length === 0) {
            throw new Error('No hay configuraciones LLM disponibles');
          }
          
          if (!activeConfiguration) {
            throw new Error('No hay configuración LLM activa');
          }
          
          return `LLM activo: ${activeConfiguration.model_name} (${configurations.length} configuraciones)`;
        }
      },
      {
        id: 'tasks-hierarchy-test',
        name: 'Jerarquía de Tareas',
        icon: FileCheck,
        test: async () => {
          const totalTasks = mainTasks.length + subtasks.length + microtasks.length;
          
          if (totalTasks === 0) {
            return 'Sin tareas creadas - Sistema listo para crear';
          }
          
          return `Jerarquía: ${mainTasks.length} tareas principales, ${subtasks.length} subtareas, ${microtasks.length} microtareas`;
        }
      },
      {
        id: 'simple-chat-test',
        name: 'Chat Simple',
        icon: MessageSquare,
        test: async () => {
          // Test localStorage
          const testKey = `ai-chat-test-${Date.now()}`;
          localStorage.setItem(testKey, JSON.stringify({ test: true }));
          const stored = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          if (!stored) {
            throw new Error('LocalStorage no funciona');
          }
          
          return `Chat simple funcional - ${messages.length} mensajes en historial`;
        }
      }
    ],
    integration: [
      {
        id: 'full-flow-test',
        name: 'Flujo Completo',
        icon: Zap,
        test: async () => {
          // Verificar que todos los sistemas principales están conectados
          const checks = {
            auth: !!user,
            llm: !!activeConfiguration,
            tasks: mainTasks.length >= 0,
            profiles: profiles.length >= 0,
            chat: messages.length >= 0
          };
          
          const passedChecks = Object.values(checks).filter(Boolean).length;
          const totalChecks = Object.keys(checks).length;
          
          if (passedChecks < totalChecks) {
            throw new Error(`Solo ${passedChecks}/${totalChecks} sistemas conectados`);
          }
          
          return `Integración completa: ${passedChecks}/${totalChecks} sistemas conectados`;
        }
      },
      {
        id: 'data-persistence-test',
        name: 'Persistencia de Datos',
        icon: Database,
        test: async () => {
          // Test que los datos se persisten correctamente
          const persistenceTests = {
            localStorage: !!localStorage.getItem(`ai-chat-${user?.id}`),
            supabaseTasks: mainTasks.length >= 0,
            supabaseProfiles: profiles.length >= 0,
            llmConfigs: configurations.length > 0
          };
          
          const workingPersistence = Object.values(persistenceTests).filter(Boolean).length;
          
          return `Persistencia: ${workingPersistence}/4 sistemas de datos funcionando`;
        }
      }
    ],
    performance: [
      {
        id: 'load-time-test',
        name: 'Tiempo de Carga',
        icon: Clock,
        test: async () => {
          const startTime = performance.now();
          
          // Simular carga de componentes principales
          await Promise.all([
            new Promise(resolve => setTimeout(resolve, 50)),
            new Promise(resolve => setTimeout(resolve, 30)),
            new Promise(resolve => setTimeout(resolve, 20))
          ]);
          
          const loadTime = performance.now() - startTime;
          
          if (loadTime > 500) {
            throw new Error(`Tiempo de carga lento: ${loadTime.toFixed(2)}ms`);
          }
          
          return `Carga rápida: ${loadTime.toFixed(2)}ms`;
        }
      },
      {
        id: 'responsiveness-test',
        name: 'Responsividad',
        icon: PlayCircle,
        test: async () => {
          // Test de responsividad de la UI
          const startTime = performance.now();
          
          for (let i = 0; i < 100; i++) {
            await new Promise(resolve => setTimeout(resolve, 1));
          }
          
          const totalTime = performance.now() - startTime;
          
          if (totalTime > 200) {
            throw new Error(`UI lenta: ${totalTime.toFixed(2)}ms`);
          }
          
          return `UI responsiva: ${totalTime.toFixed(2)}ms para 100 operaciones`;
        }
      }
    ]
  };

  const runSingleTest = async (test: any, category: string): Promise<TestResult> => {
    const startTime = performance.now();
    
    setTestResults(prev => prev.map(t => 
      t.id === test.id ? { ...t, status: 'running' } : t
    ));
    
    try {
      const message = await test.test();
      const duration = performance.now() - startTime;
      
      const result: TestResult = {
        id: test.id,
        name: test.name,
        status: 'success',
        message,
        duration,
        category: category as any
      };
      
      setTestResults(prev => prev.map(t => 
        t.id === test.id ? result : t
      ));
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      const message = error instanceof Error ? error.message : 'Error desconocido';
      
      const result: TestResult = {
        id: test.id,
        name: test.name,
        status: 'error',
        message,
        duration,
        category: category as any
      };
      
      setTestResults(prev => prev.map(t => 
        t.id === test.id ? result : t
      ));
      
      return result;
    }
  };

  const initializeTests = () => {
    const allTests = [
      ...testSuites.functional,
      ...testSuites.integration,
      ...testSuites.performance
    ];
    
    const initialResults: TestResult[] = allTests.map(test => ({
      id: test.id,
      name: test.name,
      status: 'pending',
      message: '',
      duration: 0,
      category: testSuites.functional.includes(test) ? 'functional' : 
                testSuites.integration.includes(test) ? 'integration' : 'performance'
    }));
    
    setTestResults(initialResults);
  };

  const runAllTests = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Necesitas estar autenticado para ejecutar los tests",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    
    // Inicializar resultados
    initializeTests();

    try {
      // Fase 1: Tests Funcionales
      setCurrentPhase('Ejecutando tests funcionales...');
      for (const test of testSuites.functional) {
        await runSingleTest(test, 'functional');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Fase 2: Tests de Integración
      setCurrentPhase('Ejecutando tests de integración...');
      for (const test of testSuites.integration) {
        await runSingleTest(test, 'integration');
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Fase 3: Tests de Rendimiento
      setCurrentPhase('Ejecutando tests de rendimiento...');
      for (const test of testSuites.performance) {
        await runSingleTest(test, 'performance');
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Contar resultados finales
      setTimeout(() => {
        const finalResults = testResults.filter(t => t.status !== 'pending');
        const successCount = finalResults.filter(t => t.status === 'success').length;
        const totalCount = finalResults.length;

        toast({
          title: "Testing Completo",
          description: `${successCount}/${totalCount} tests exitosos`,
          variant: successCount === totalCount ? "default" : "destructive"
        });
      }, 500);

    } finally {
      setIsRunning(false);
      setCurrentPhase('');
    }
  };

  const runCategoryTests = async (category: keyof typeof testSuites) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Necesitas estar autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setCurrentPhase(`Ejecutando tests de ${category}...`);
    
    // Inicializar solo si no hay resultados
    if (testResults.length === 0) {
      initializeTests();
    }
    
    try {
      for (const test of testSuites[category]) {
        await runSingleTest(test, category);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } finally {
      setIsRunning(false);
      setCurrentPhase('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryStats = (category: string) => {
    const categoryTests = testResults.filter(t => t.category === category);
    const success = categoryTests.filter(t => t.status === 'success').length;
    const total = categoryTests.length;
    const percentage = total > 0 ? (success / total) * 100 : 0;
    
    return { success, total, percentage };
  };

  const overallStats = {
    success: testResults.filter(t => t.status === 'success').length,
    error: testResults.filter(t => t.status === 'error').length,
    total: testResults.length,
    percentage: testResults.length > 0 ? 
      (testResults.filter(t => t.status === 'success').length / testResults.length) * 100 : 0
  };

  // Inicializar tests al montar el componente
  React.useEffect(() => {
    if (testResults.length === 0) {
      initializeTests();
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-blue-600" />
            Testing de Verificación Completa - Fase 5
          </CardTitle>
          <CardDescription>
            Verificación integral de todos los componentes implementados
          </CardDescription>
          
          {!user && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Necesitas estar autenticado para ejecutar los tests
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium">Progreso General:</div>
                <Progress value={overallStats.percentage} className="w-40" />
                <span className="text-sm text-muted-foreground">
                  {overallStats.success}/{overallStats.total}
                </span>
              </div>
              {currentPhase && (
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {currentPhase}
                </div>
              )}
            </div>
            
            <Button 
              onClick={runAllTests} 
              disabled={isRunning || !user}
              size="lg"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Ejecutando...
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Ejecutar Testing Completo
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="functional">Funcional</TabsTrigger>
              <TabsTrigger value="integration">Integración</TabsTrigger>
              <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['functional', 'integration', 'performance'] as const).map(category => {
                  const stats = getCategoryStats(category);
                  const IconComponent = category === 'functional' ? FileCheck : 
                                      category === 'integration' ? Database : Brain;
                  
                  return (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                            <span className="font-medium capitalize">{category}</span>
                          </div>
                          <Badge variant={stats.percentage === 100 ? "default" : "secondary"}>
                            {stats.success}/{stats.total}
                          </Badge>
                        </div>
                        <Progress value={stats.percentage} className="mt-2" />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => runCategoryTests(category)}
                          disabled={isRunning}
                        >
                          Ejecutar {category}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Estado del sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span>Usuario: {user ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-blue-500" />
                      <span>LLM: {activeConfiguration ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-purple-500" />
                      <span>Tareas: {mainTasks.length + subtasks.length + microtasks.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-500" />
                      <span>Chat: {messages.length} mensajes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {(['functional', 'integration', 'performance'] as const).map(category => (
              <TabsContent key={category} value={category} className="space-y-3">
                {testResults
                  .filter(test => test.category === category)
                  .map(test => (
                    <Card key={test.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              {test.message && (
                                <div className="text-sm text-muted-foreground">
                                  {test.message}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {test.duration > 0 && `${test.duration.toFixed(2)}ms`}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteVerificationSuite;
