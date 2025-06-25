
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  Brain,
  Zap
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { toast } from '@/hooks/use-toast';

const Phase2Demo = () => {
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const { runAnalysis, isAnalyzing, getCriticalTasks, getGeneralInsights } = useAITaskMonitor();
  const { mainTasks, subtasks, microtasks } = useTasks();
  const { createTask } = useTaskMutations();

  const insights = getGeneralInsights();
  const criticalTasks = getCriticalTasks();

  const generateSampleData = async () => {
    setIsGeneratingData(true);
    
    try {
      // Crear tareas de ejemplo con diferentes prioridades y estados
      const sampleTasks = [
        {
          title: "Desarrollar nueva funcionalidad",
          description: "Implementar sistema de notificaciones en tiempo real",
          priority: "high" as const,
          status: "in_progress" as const,
          estimated_duration: 8
        },
        {
          title: "Revisar código del equipo",
          description: "Code review de los PRs pendientes",
          priority: "medium" as const,
          status: "pending" as const,
          estimated_duration: 3
        },
        {
          title: "Actualizar documentación",
          description: "Documentar las nuevas APIs implementadas",
          priority: "low" as const,
          status: "pending" as const,
          estimated_duration: 2
        },
        {
          title: "Optimizar rendimiento",
          description: "Mejorar tiempo de carga de la aplicación",
          priority: "urgent" as const,
          status: "in_progress" as const,
          estimated_duration: 5
        }
      ];

      // Crear las tareas de ejemplo
      for (const task of sampleTasks) {
        createTask(task);
      }

      toast({
        title: "Datos de ejemplo creados",
        description: `Se han creado ${sampleTasks.length} tareas de ejemplo para la demostración`,
      });

      // Esperar un poco para que se creen las tareas
      setTimeout(() => {
        setIsGeneratingData(false);
      }, 2000);

    } catch (error) {
      setIsGeneratingData(false);
      toast({
        title: "Error",
        description: "No se pudieron crear las tareas de ejemplo",
        variant: "destructive",
      });
    }
  };

  const runFullAnalysis = async () => {
    if (mainTasks.length === 0) {
      toast({
        title: "No hay tareas",
        description: "Primero crea algunos datos de ejemplo",
        variant: "destructive",
      });
      return;
    }

    try {
      await runAnalysis({});
      toast({
        title: "Análisis completado",
        description: "El análisis AI se ha ejecutado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error en análisis",
        description: "No se pudo completar el análisis AI",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-600" />
          Phase 2: AI Demo
        </CardTitle>
        <CardDescription>
          Demostración de las capacidades de IA integradas
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="critical">Críticas</TabsTrigger>
            <TabsTrigger value="demo">Demo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{mainTasks.length}</div>
                <div className="text-sm text-muted-foreground">Tareas principales</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{subtasks.length}</div>
                <div className="text-sm text-muted-foreground">Subtareas</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border">
                <div className="text-2xl font-bold text-purple-600">{microtasks.length}</div>
                <div className="text-sm text-muted-foreground">Microtareas</div>
              </div>
            </div>

            {insights && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-xl font-bold">{insights.healthy_tasks}</div>
                  <div className="text-sm text-muted-foreground">Saludables</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-xl font-bold">{insights.critical_tasks}</div>
                  <div className="text-sm text-muted-foreground">Críticas</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="text-xl font-bold">{insights.bottlenecked_tasks}</div>
                  <div className="text-sm text-muted-foreground">Con cuellos</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-xl font-bold">{insights.average_priority_score}</div>
                  <div className="text-sm text-muted-foreground">Prioridad avg</div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border">
                  <h4 className="font-medium text-blue-800 mb-2">Salud General del Proyecto</h4>
                  <p className="text-blue-700">
                    {insights.health_percentage}% de tus tareas están en buen estado
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border">
                  <h4 className="font-medium text-green-800 mb-2">Análisis de Productividad</h4>
                  <p className="text-green-700">
                    {insights.total_tasks} tareas monitoreadas con una puntuación de prioridad promedio de {insights.average_priority_score}
                  </p>
                </div>
                
                {insights.bottlenecked_tasks > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border">
                    <h4 className="font-medium text-orange-800 mb-2">Atención Requerida</h4>
                    <p className="text-orange-700">
                      {insights.bottlenecked_tasks} tareas tienen cuellos de botella detectados
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay insights disponibles</p>
                <p className="text-sm mt-2">Ejecuta el análisis AI para generar insights</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="critical" className="space-y-4">
            {criticalTasks.length > 0 ? (
              <div className="space-y-3">
                {criticalTasks.map((task, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-red-100 text-red-700">
                        Salud: {task.health_score}%
                      </Badge>
                      {task.bottleneck_detected && (
                        <Badge variant="outline" className="bg-orange-100 text-orange-700">
                          Cuello de botella
                        </Badge>
                      )}
                    </div>
                    
                    {task.issues.length > 0 && (
                      <div className="mb-2">
                        <h5 className="font-medium text-red-800 mb-1">Problemas detectados:</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          {task.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {task.recommendations.length > 0 && (
                      <div>
                        <h5 className="font-medium text-blue-800 mb-1">Recomendaciones:</h5>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {task.recommendations.map((rec, idx) => (
                            <li key={idx}>💡 {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay tareas críticas</p>
                <p className="text-sm mt-2">¡Todas tus tareas están en buen estado!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="demo" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800 mb-2">Demostración Interactiva</h4>
                <p className="text-yellow-700 text-sm mb-3">
                  Usa estos botones para probar las capacidades de IA del sistema
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button 
                    onClick={generateSampleData}
                    disabled={isGeneratingData}
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="h-4 w-4" />
                    {isGeneratingData ? 'Generando...' : 'Generar Datos'}
                  </Button>
                  
                  <Button 
                    onClick={runFullAnalysis}
                    disabled={isAnalyzing || mainTasks.length === 0}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isAnalyzing ? 'Analizando...' : 'Ejecutar Análisis'}
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Funcionalidades Demostradas</h4>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Monitoreo en tiempo real de salud de tareas
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Detección automática de cuellos de botella
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Sistema de puntuación inteligente de prioridades
                  </li>
                  <li className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Predicción de fechas de finalización
                  </li>
                  <li className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Generación de insights y recomendaciones
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Phase2Demo;
