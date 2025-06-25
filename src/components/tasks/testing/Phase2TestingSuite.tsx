
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';
import { useTasks } from '@/hooks/useTasks';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { toast } from '@/hooks/use-toast';

const Phase2TestingSuite = () => {
  const [testResults, setTestResults] = useState<Record<string, 'pending' | 'success' | 'error'>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { runAnalysis, isAnalyzing, getCriticalTasks, getGeneralInsights } = useAITaskMonitor();
  const { mainTasks, subtasks, microtasks } = useTasks();
  const { activeConfiguration, isLoading: llmLoading } = useLLMConfigurations();

  const phase2Tests = [
    {
      id: 'ai-monitoring',
      name: 'AI Task Monitoring',
      description: 'Verificar análisis de tareas por IA',
      icon: Brain,
      requirements: ['Configuración LLM activa', 'Al menos 1 tarea'],
      test: async () => {
        if (!activeConfiguration) {
          throw new Error('Se necesita configuración LLM activa (OpenRouter API key)');
        }
        
        if (mainTasks.length === 0) {
          throw new Error('Se necesitan tareas para probar el monitoreo AI');
        }
        
        await runAnalysis({});
        const insights = getGeneralInsights();
        if (!insights) {
          throw new Error('No se pudieron obtener insights de IA');
        }
        return `Monitoreo AI funcionando - ${insights.total_tasks} tareas analizadas`;
      }
    },
    {
      id: 'health-indicators',
      name: 'Health Indicators',
      description: 'Probar indicadores de salud de tareas',
      icon: Activity,
      requirements: ['Tareas con datos de actividad'],
      test: async () => {
        if (mainTasks.length === 0) {
          throw new Error('Se necesitan tareas para probar indicadores de salud');
        }
        
        await runAnalysis({ analysisType: 'health_check' });
        const criticalTasks = getCriticalTasks();
        return `Indicadores de salud funcionando - ${criticalTasks.length} tareas críticas detectadas`;
      }
    },
    {
      id: 'priority-scoring',
      name: 'Priority Scoring',
      description: 'Verificar sistema de puntuación de prioridades',
      icon: TrendingUp,
      requirements: ['Tareas con diferentes prioridades'],
      test: async () => {
        if (mainTasks.length === 0) {
          throw new Error('Se necesitan tareas para verificar prioridades');
        }
        
        await runAnalysis({ analysisType: 'priority_analysis' });
        const insights = getGeneralInsights();
        if (!insights) {
          throw new Error('No se pudieron obtener insights para verificar prioridades');
        }
        return `Sistema de prioridades funcionando - Puntuación promedio: ${insights.average_priority_score}`;
      }
    },
    {
      id: 'bottleneck-detection',
      name: 'Bottleneck Detection',
      description: 'Detectar cuellos de botella en tareas',
      icon: AlertTriangle,
      requirements: ['Múltiples tareas en diferentes estados'],
      test: async () => {
        if (mainTasks.length < 2) {
          throw new Error('Se necesitan al menos 2 tareas para detectar cuellos de botella');
        }
        
        await runAnalysis({ analysisType: 'bottleneck_detection' });
        const insights = getGeneralInsights();
        if (!insights) {
          throw new Error('No se pudieron detectar cuellos de botella');
        }
        return `Detección de cuellos de botella funcionando - ${insights.bottlenecked_tasks} tareas con cuellos detectados`;
      }
    },
    {
      id: 'completion-prediction',
      name: 'Completion Prediction',
      description: 'Predicción de fechas de finalización',
      icon: Target,
      requirements: ['Tareas con estimaciones de duración'],
      test: async () => {
        if (mainTasks.length === 0) {
          throw new Error('Se necesitan tareas para predicción de finalización');
        }
        
        await runAnalysis({ analysisType: 'completion_prediction' });
        return 'Predicción de finalización funcionando correctamente';
      }
    },
    {
      id: 'hierarchical-analysis',
      name: 'Hierarchical Analysis',
      description: 'Análisis de jerarquía de tareas (tareas -> subtareas -> microtareas)',
      icon: BarChart3,
      requirements: ['Tareas principales, subtareas y microtareas'],
      test: async () => {
        const totalTasks = mainTasks.length + subtasks.length + microtasks.length;
        if (totalTasks === 0) {
          throw new Error('Se necesitan tareas para probar análisis jerárquico');
        }
        
        await runAnalysis({});
        const hierarchyData = {
          mainTasks: mainTasks.length,
          subtasks: subtasks.length,
          microtasks: microtasks.length
        };
        
        return `Análisis jerárquico funcionando - ${hierarchyData.mainTasks} tareas, ${hierarchyData.subtasks} subtareas, ${hierarchyData.microtasks} microtareas`;
      }
    }
  ];

  const runSingleTest = async (testId: string) => {
    const test = phase2Tests.find(t => t.id === testId);
    if (!test) return;

    setTestResults(prev => ({ ...prev, [testId]: 'pending' }));
    
    try {
      const result = await test.test();
      setTestResults(prev => ({ ...prev, [testId]: 'success' }));
      toast({
        title: `✅ ${test.name}`,
        description: result,
      });
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testId]: 'error' }));
      toast({
        title: `❌ ${test.name}`,
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: "destructive",
      });
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    let successCount = 0;
    
    for (const test of phase2Tests) {
      await runSingleTest(test.id);
      if (testResults[test.id] === 'success') {
        successCount++;
      }
      // Pequeña pausa entre tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunningTests(false);
    
    const totalTests = phase2Tests.length;
    const finalSuccessCount = Object.values(testResults).filter(result => result === 'success').length;
    
    toast({
      title: "Tests de Fase 2 completados",
      description: `${finalSuccessCount}/${totalTests} tests pasaron exitosamente`,
    });
  };

  const getTestStatus = (testId: string) => {
    return testResults[testId] || 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const successfulTests = Object.values(testResults).filter(result => result === 'success').length;
  const totalTests = phase2Tests.length;
  const completionPercentage = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;

  // Verificar requisitos del sistema
  const systemReady = activeConfiguration && mainTasks.length > 0;
  const requirementsIssues = [];
  
  if (!activeConfiguration) {
    requirementsIssues.push('Configuración LLM no activa (ir a Configuración > LLM)');
  }
  if (mainTasks.length === 0) {
    requirementsIssues.push('No hay tareas creadas (crear al menos 1 tarea)');
  }
  if (subtasks.length === 0) {
    requirementsIssues.push('No hay subtareas (crear subtareas para testing completo)');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          Phase 2: AI Testing Suite
        </CardTitle>
        <CardDescription>
          Pruebas de integración de IA y monitoreo inteligente
        </CardDescription>
        
        {/* Alertas de requisitos */}
        {requirementsIssues.length > 0 && (
          <Alert className="mt-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Requisitos faltantes:</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {requirementsIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Progreso:</span>
            <Progress value={completionPercentage} className="w-32" />
            <span className="text-sm text-muted-foreground">
              {successfulTests}/{totalTests}
            </span>
          </div>
          
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests || isAnalyzing || !systemReady}
            className="flex items-center gap-2"
          >
            {isRunningTests || isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Ejecutar Todos
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {phase2Tests.map((test) => {
          const IconComponent = test.icon;
          const status = getTestStatus(test.id);
          
          return (
            <div 
              key={test.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <IconComponent className="h-4 w-4 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {test.description}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Requisitos: {test.requirements.join(', ')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(status)}>
                  {getStatusIcon(status)}
                  <span className="ml-1 capitalize">{status}</span>
                </Badge>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runSingleTest(test.id)}
                  disabled={isRunningTests || isAnalyzing}
                >
                  Probar
                </Button>
              </div>
            </div>
          );
        })}

        {/* Estado del sistema */}
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${systemReady ? 'bg-green-50' : 'bg-orange-50'}`}>
          {systemReady ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-sm">Sistema listo para análisis</div>
                <div className="text-xs text-muted-foreground">
                  Configuración LLM: ✓ | Tareas: {mainTasks.length} | Subtareas: {subtasks.length}
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium text-sm">Sistema necesita configuración</div>
                <div className="text-xs text-muted-foreground">
                  Revisa los requisitos arriba para habilitar las pruebas
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Estadísticas de datos */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{mainTasks.length}</div>
            <div className="text-sm text-muted-foreground">Tareas principales</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{subtasks.length}</div>
            <div className="text-sm text-muted-foreground">Subtareas</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{microtasks.length}</div>
            <div className="text-sm text-muted-foreground">Microtareas</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Phase2TestingSuite;
