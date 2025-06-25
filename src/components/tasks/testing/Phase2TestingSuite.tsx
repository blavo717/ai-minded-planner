
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
  const { runAnalysis, isAnalyzing, getCriticalTasks, getGeneralInsights, monitoringData } = useAITaskMonitor();
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
        
        console.log('Iniciando test de AI monitoring...');
        
        // Ejecutar análisis y esperar resultado
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout en análisis AI (30s)'));
          }, 30000);
          
          runAnalysis({});
          
          // Simular espera para análisis
          setTimeout(() => {
            clearTimeout(timeout);
            
            // Verificar que se generaron datos
            if (monitoringData.length === 0) {
              reject(new Error('No se generaron datos de monitoreo'));
              return;
            }
            
            const insights = getGeneralInsights();
            if (!insights) {
              reject(new Error('No se pudieron obtener insights de IA'));
              return;
            }
            
            resolve();
          }, 3000);
        });
        
        const insights = getGeneralInsights();
        return `Monitoreo AI funcionando - ${insights?.total_tasks || 0} tareas analizadas`;
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
        
        console.log('Iniciando test de health indicators...');
        
        await new Promise<void>((resolve) => {
          runAnalysis({ analysisType: 'health_check' });
          setTimeout(resolve, 2000);
        });
        
        // Verificar que hay análisis de salud
        const healthAnalyses = monitoringData.filter(m => m.monitoring_type === 'health_check');
        if (healthAnalyses.length === 0) {
          throw new Error('No se generaron análisis de salud');
        }
        
        const criticalTasks = getCriticalTasks();
        return `Indicadores de salud funcionando - ${healthAnalyses.length} análisis, ${criticalTasks.length} tareas críticas detectadas`;
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
        
        console.log('Iniciando test de priority scoring...');
        
        await new Promise<void>((resolve) => {
          runAnalysis({ analysisType: 'priority_analysis' });
          setTimeout(resolve, 2000);
        });
        
        // Verificar análisis de prioridades
        const priorityAnalyses = monitoringData.filter(m => 
          m.monitoring_type === 'priority_analysis' && 
          m.priority_score !== undefined && 
          m.priority_score > 0
        );
        
        if (priorityAnalyses.length === 0) {
          throw new Error('No se generaron puntuaciones de prioridad válidas');
        }
        
        const avgScore = priorityAnalyses.reduce((sum, analysis) => 
          sum + (analysis.priority_score || 0), 0
        ) / priorityAnalyses.length;
        
        if (avgScore === 0) {
          throw new Error('Las puntuaciones de prioridad están en 0 - revisar cálculo');
        }
        
        return `Sistema de prioridades funcionando - ${priorityAnalyses.length} análisis, puntuación promedio: ${avgScore.toFixed(1)}`;
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
        
        console.log('Iniciando test de bottleneck detection...');
        
        await new Promise<void>((resolve) => {
          runAnalysis({ analysisType: 'bottleneck_detection' });
          setTimeout(resolve, 2000);
        });
        
        // Verificar análisis de cuellos de botella
        const bottleneckAnalyses = monitoringData.filter(m => m.monitoring_type === 'bottleneck_detection');
        
        if (bottleneckAnalyses.length === 0) {
          throw new Error('No se ejecutó análisis de cuellos de botella');
        }
        
        const detectedBottlenecks = bottleneckAnalyses.filter(m => m.bottleneck_detected).length;
        
        return `Detección de cuellos de botella funcionando - ${bottleneckAnalyses.length} análisis, ${detectedBottlenecks} cuellos detectados`;
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
        
        console.log('Iniciando test de completion prediction...');
        
        await new Promise<void>((resolve) => {
          runAnalysis({ analysisType: 'completion_prediction' });
          setTimeout(resolve, 2000);
        });
        
        // Verificar predicciones
        const predictionAnalyses = monitoringData.filter(m => 
          m.monitoring_type === 'completion_prediction' && 
          m.predicted_completion_date
        );
        
        if (predictionAnalyses.length === 0) {
          throw new Error('No se generaron predicciones de finalización');
        }
        
        return `Predicción de finalización funcionando - ${predictionAnalyses.length} predicciones generadas`;
      }
    },
    {
      id: 'hierarchical-analysis',
      name: 'Hierarchical Analysis',
      description: 'Análisis de jerarquía de tareas (tareas > subtareas > microtareas)',
      icon: BarChart3,
      requirements: ['Tareas principales, subtareas y microtareas'],
      test: async () => {
        const totalTasks = mainTasks.length + subtasks.length + microtasks.length;
        if (totalTasks === 0) {
          throw new Error('Se necesitan tareas para probar análisis jerárquico');
        }
        
        console.log('Iniciando test de hierarchical analysis...');
        
        await new Promise<void>((resolve) => {
          runAnalysis({});
          setTimeout(resolve, 3000);
        });
        
        // Verificar análisis por niveles de jerarquía
        const level1Analyses = monitoringData.filter(m => {
          const task = mainTasks.find(t => t.id === m.task_id);
          return task && task.task_level === 1;
        });
        
        const level2Analyses = monitoringData.filter(m => {
          const task = subtasks.find(t => t.id === m.task_id);
          return task && task.task_level === 2;
        });
        
        const level3Analyses = monitoringData.filter(m => {
          const task = microtasks.find(t => t.id === m.task_id);
          return task && task.task_level === 3;
        });
        
        const hierarchyData = {
          mainTasks: mainTasks.length,
          subtasks: subtasks.length,
          microtasks: microtasks.length,
          level1Analyses: level1Analyses.length,
          level2Analyses: level2Analyses.length,
          level3Analyses: level3Analyses.length
        };
        
        if (level1Analyses.length === 0 && mainTasks.length > 0) {
          throw new Error('No se analizaron tareas principales');
        }
        
        return `Análisis jerárquico funcionando - ${hierarchyData.mainTasks} tareas, ${hierarchyData.subtasks} subtareas, ${hierarchyData.microtasks} microtareas`;
      }
    }
  ];

  const runSingleTest = async (testId: string) => {
    const test = phase2Tests.find(t => t.id === testId);
    if (!test) return;

    console.log(`Ejecutando test: ${test.name}`);
    setTestResults(prev => ({ ...prev, [testId]: 'pending' }));
    
    try {
      const result = await test.test();
      setTestResults(prev => ({ ...prev, [testId]: 'success' }));
      toast({
        title: `✅ ${test.name}`,
        description: result,
      });
      console.log(`Test exitoso: ${test.name} - ${result}`);
      return true;
    } catch (error) {
      setTestResults(prev => ({ ...prev, [testId]: 'error' }));
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: `❌ ${test.name}`,
        description: errorMessage,
        variant: "destructive",
      });
      console.error(`Test fallido: ${test.name} - ${errorMessage}`);
      return false;
    }
  };

  const runAllTests = async () => {
    console.log('=== INICIANDO SUITE DE TESTS FASE 2 ===');
    setIsRunningTests(true);
    
    // Reset all tests
    const resetResults = phase2Tests.reduce((acc, test) => {
      acc[test.id] = 'pending';
      return acc;
    }, {} as Record<string, 'pending' | 'success' | 'error'>);
    setTestResults(resetResults);
    
    let successCount = 0;
    
    for (let i = 0; i < phase2Tests.length; i++) {
      const test = phase2Tests[i];
      console.log(`--- Test ${i + 1}/${phase2Tests.length}: ${test.name} ---`);
      
      const success = await runSingleTest(test.id);
      if (success) {
        successCount++;
      }
      
      // Pausa entre tests para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunningTests(false);
    
    console.log(`=== SUITE COMPLETADA: ${successCount}/${phase2Tests.length} EXITOSOS ===`);
    
    const message = successCount === phase2Tests.length 
      ? "🎉 ¡Todos los tests de Fase 2 pasaron exitosamente!"
      : `⚠️ ${successCount}/${phase2Tests.length} tests pasaron. Revisar fallos.`;
    
    toast({
      title: "Tests de Fase 2 completados",
      description: message,
      variant: successCount === phase2Tests.length ? "default" : "destructive"
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
