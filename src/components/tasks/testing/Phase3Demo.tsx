
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Workflow, 
  Bell, 
  Brain,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Target,
  Activity
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { toast } from '@/hooks/use-toast';

const Phase3Demo = () => {
  const [demoStep, setDemoStep] = useState(0);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoResults, setDemoResults] = useState<any[]>([]);
  
  const { mainTasks, subtasks, microtasks } = useTasks();
  const { createTask } = useTaskMutations();
  const { runAnalysis, monitoringData } = useAITaskMonitor();
  const { activeConfiguration } = useLLMConfigurations();

  const demoSteps = [
    {
      id: 'create-main-task',
      title: 'Crear Tarea Principal',
      description: 'Demostrar creación de tarea de nivel 1',
      icon: Target,
      action: async () => {
        const title = `Demo Task - ${Date.now()}`;
        console.log(`Creando tarea principal: ${title}`);
        
        // Simular creación exitosa
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Tarea Principal Creada",
          description: `Se creó la tarea: ${title}`,
        });
        
        return { type: 'main-task', title, status: 'created' };
      }
    },
    {
      id: 'create-subtasks',
      title: 'Crear Subtareas',
      description: 'Demostrar creación de tareas de nivel 2',
      icon: ArrowRight,
      action: async () => {
        const subtaskTitles = ['Subtarea 1', 'Subtarea 2'];
        console.log('Creando subtareas...');
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: "Subtareas Creadas",
          description: `Se crearon ${subtaskTitles.length} subtareas`,
        });
        
        return { type: 'subtasks', count: subtaskTitles.length, status: 'created' };
      }
    },
    {
      id: 'create-microtasks',
      title: 'Crear Microtareas',
      description: 'Demostrar creación de tareas de nivel 3',
      icon: Activity,
      action: async () => {
        const microtaskTitles = ['Microtarea 1', 'Microtarea 2', 'Microtarea 3'];
        console.log('Creando microtareas...');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Microtareas Creadas",
          description: `Se crearon ${microtaskTitles.length} microtareas`,
        });
        
        return { type: 'microtasks', count: microtaskTitles.length, status: 'created' };
      }
    },
    {
      id: 'ai-analysis',
      title: 'Análisis AI',
      description: 'Ejecutar análisis completo de IA',
      icon: Brain,
      action: async () => {
        console.log('Ejecutando análisis AI...');
        
        if (!activeConfiguration) {
          throw new Error('Se necesita configuración LLM para el análisis AI');
        }
        
        runAnalysis({});
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        toast({
          title: "Análisis AI Completado",
          description: `Se analizaron las tareas con IA`,
        });
        
        return { type: 'ai-analysis', analysisCount: monitoringData.length, status: 'completed' };
      }
    },
    {
      id: 'notifications-test',
      title: 'Probar Notificaciones',
      description: 'Demostrar sistema de notificaciones',
      icon: Bell,
      action: async () => {
        console.log('Probando notificaciones...');
        
        // Notificaciones de diferentes niveles
        const notifications = [
          { level: 'tarea', message: 'Tarea principal actualizada' },
          { level: 'subtarea', message: 'Subtarea completada' },
          { level: 'microtarea', message: 'Microtarea asignada' },
          { level: 'ai', message: 'Análisis AI disponible' }
        ];
        
        for (const notif of notifications) {
          toast({
            title: `Notificación de ${notif.level}`,
            description: notif.message,
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return { type: 'notifications', count: notifications.length, status: 'sent' };
      }
    }
  ];

  const runDemo = async () => {
    console.log('=== INICIANDO DEMO DE FASE 3 ===');
    setIsRunningDemo(true);
    setDemoStep(0);
    setDemoResults([]);
    
    try {
      for (let i = 0; i < demoSteps.length; i++) {
        setDemoStep(i + 1);
        const step = demoSteps[i];
        
        console.log(`--- Ejecutando paso ${i + 1}: ${step.title} ---`);
        
        try {
          const result = await step.action();
          setDemoResults(prev => [...prev, { ...result, step: step.title, success: true }]);
          console.log(`✓ Paso ${i + 1} completado exitosamente`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          setDemoResults(prev => [...prev, { 
            step: step.title, 
            error: errorMessage, 
            success: false 
          }]);
          console.error(`✗ Paso ${i + 1} falló: ${errorMessage}`);
        }
        
        // Pausa entre pasos
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      toast({
        title: "Demo Completada",
        description: "Se ejecutaron todos los pasos del flujo integral",
      });
      
    } catch (error) {
      console.error('Error en demo:', error);
      toast({
        title: "Error en Demo",
        description: "Ocurrió un error durante la demostración",
        variant: "destructive",
      });
    } finally {
      setIsRunningDemo(false);
      setDemoStep(0);
      console.log('=== DEMO DE FASE 3 COMPLETADA ===');
    }
  };

  const resetDemo = () => {
    setDemoStep(0);
    setDemoResults([]);
  };

  const systemReady = activeConfiguration;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-purple-600" />
          Demo: Testing Integral
        </CardTitle>
        <CardDescription>
          Demostración interactiva del flujo completo de la aplicación
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estado del sistema */}
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${systemReady ? 'bg-green-50' : 'bg-orange-50'}`}>
          {systemReady ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium text-sm">Sistema listo para demo</div>
                <div className="text-xs text-muted-foreground">
                  Configuración LLM activa
                </div>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-medium text-sm">Sistema necesita configuración</div>
                <div className="text-xs text-muted-foreground">
                  Configurar LLM para demo completa
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controles de demo */}
        <div className="flex gap-3">
          <Button 
            onClick={runDemo} 
            disabled={isRunningDemo}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunningDemo ? 'Ejecutando Demo...' : 'Iniciar Demo'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetDemo}
            disabled={isRunningDemo}
          >
            Reset
          </Button>
        </div>

        {/* Progreso de la demo */}
        {isRunningDemo && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">
                Ejecutando paso {demoStep}/{demoSteps.length}
              </div>
              {demoStep > 0 && demoStep <= demoSteps.length && (
                <div className="text-sm">
                  {demoSteps[demoStep - 1].title}: {demoSteps[demoStep - 1].description}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Pasos de la demo */}
        <div className="space-y-3">
          <h4 className="font-medium">Pasos de la Demo:</h4>
          {demoSteps.map((step, index) => {
            const IconComponent = step.icon;
            const isActive = demoStep === index + 1;
            const isCompleted = demoStep > index + 1;
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  isActive ? 'bg-blue-50 border-blue-200' : 
                  isCompleted ? 'bg-green-50 border-green-200' : 
                  'bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  isActive ? 'bg-blue-100' : 
                  isCompleted ? 'bg-green-100' : 
                  'bg-gray-100'
                }`}>
                  <IconComponent className={`h-4 w-4 ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 
                    'text-gray-600'
                  }`} />
                </div>
                
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{step.title}</h5>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                
                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {isActive && (
                  <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            );
          })}
        </div>

        {/* Resultados de la demo */}
        {demoResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Resultados:</h4>
            {demoResults.map((result, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${
                  result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium text-sm">{result.step}</span>
                </div>
                {result.error && (
                  <p className="text-xs text-red-600 mt-1">{result.error}</p>
                )}
                {result.type && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Tipo: {result.type}
                    {result.count && ` | Cantidad: ${result.count}`}
                    {result.analysisCount && ` | Análisis: ${result.analysisCount}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Estado actual del sistema */}
        <div className="grid grid-cols-3 gap-4">
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

export default Phase3Demo;
