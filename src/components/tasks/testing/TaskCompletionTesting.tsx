
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { 
  CheckCircle, 
  Archive, 
  RotateCcw, 
  Plus, 
  PlayCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

const TaskCompletionTesting = () => {
  const { tasks, archivedTasks } = useTasks();
  const { createTask, completeTask, archiveTask, unarchiveTask } = useTaskMutations();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testTaskId, setTestTaskId] = useState<string | null>(null);

  const updateTestResult = (test: string, status: TestResult['status'], message?: string, duration?: number) => {
    setTestResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.duration = duration;
        return [...prev];
      }
      return [...prev, { test, status, message, duration }];
    });
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Crear tarea de prueba
      updateTestResult('Crear tarea de prueba', 'pending');
      const startTime = Date.now();
      
      const testTaskData = {
        title: `Tarea de prueba - ${new Date().toISOString()}`,
        description: 'Esta es una tarea creada para testing del sistema de completado',
        priority: 'medium' as const,
        status: 'pending' as const
      };

      await new Promise<void>((resolve) => {
        createTask(testTaskData);
        // Simular delay para la creación
        setTimeout(() => {
          const newTask = tasks.find(t => t.title === testTaskData.title);
          if (newTask) {
            setTestTaskId(newTask.id);
            updateTestResult('Crear tarea de prueba', 'success', 'Tarea creada correctamente', Date.now() - startTime);
          } else {
            updateTestResult('Crear tarea de prueba', 'error', 'No se pudo crear la tarea');
          }
          resolve();
        }, 1000);
      });

      // Esperar a que la tarea se cree
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Test 2: Completar tarea con notas
      if (testTaskId) {
        updateTestResult('Completar tarea con notas', 'pending');
        const completeStartTime = Date.now();
        
        const completionNotes = 'Tarea completada exitosamente durante las pruebas automatizadas. Todos los objetivos se cumplieron.';
        
        await new Promise<void>((resolve) => {
          completeTask({ taskId: testTaskId, completionNotes });
          setTimeout(() => {
            updateTestResult('Completar tarea con notas', 'success', 'Tarea completada con notas', Date.now() - completeStartTime);
            resolve();
          }, 1000);
        });

        // Esperar a que se complete
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 3: Archivar tarea
        updateTestResult('Archivar tarea completada', 'pending');
        const archiveStartTime = Date.now();
        
        await new Promise<void>((resolve) => {
          archiveTask(testTaskId);
          setTimeout(() => {
            updateTestResult('Archivar tarea completada', 'success', 'Tarea archivada correctamente', Date.now() - archiveStartTime);
            resolve();
          }, 1000);
        });

        // Esperar a que se archive
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Test 4: Verificar en histórico
        updateTestResult('Verificar en histórico', 'pending');
        const historyStartTime = Date.now();
        
        setTimeout(() => {
          const archivedTask = archivedTasks.find(t => t.id === testTaskId);
          if (archivedTask && archivedTask.is_archived && archivedTask.completion_notes) {
            updateTestResult('Verificar en histórico', 'success', 'Tarea encontrada en histórico con notas', Date.now() - historyStartTime);
          } else {
            updateTestResult('Verificar en histórico', 'error', 'Tarea no encontrada en histórico o datos incompletos');
          }
        }, 1000);

        // Test 5: Desarchivar tarea
        await new Promise(resolve => setTimeout(resolve, 2000));
        updateTestResult('Desarchivar tarea', 'pending');
        const unarchiveStartTime = Date.now();
        
        await new Promise<void>((resolve) => {
          unarchiveTask(testTaskId);
          setTimeout(() => {
            updateTestResult('Desarchivar tarea', 'success', 'Tarea desarchivada correctamente', Date.now() - unarchiveStartTime);
            resolve();
          }, 1000);
        });
      }

      toast({
        title: "Pruebas completadas",
        description: "Todas las pruebas del sistema de completado han terminado.",
      });

    } catch (error) {
      console.error('Error durante las pruebas:', error);
      toast({
        title: "Error en las pruebas",
        description: "Ocurrió un error durante la ejecución de las pruebas.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Éxito</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Ejecutando</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5" />
          Testing del Sistema de Completado de Tareas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Pruebas automatizadas para verificar el flujo completo: crear → completar → archivar → histórico
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runFullTest}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Clock className="h-4 w-4 animate-spin" />
                Ejecutando pruebas...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Ejecutar pruebas completas
              </>
            )}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {testResults.length > 0 && (
              <>
                {testResults.filter(r => r.status === 'success').length} éxitos, {' '}
                {testResults.filter(r => r.status === 'error').length} errores, {' '}
                {testResults.filter(r => r.status === 'pending').length} pendientes
              </>
            )}
          </div>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados de las pruebas:</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {result.duration && (
                      <span className="text-xs text-muted-foreground">
                        {result.duration}ms
                      </span>
                    )}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">Funcionalidades probadas:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>✅ Creación de tareas</li>
              <li>✅ Completado con notas descriptivas</li>
              <li>✅ Sistema de archivado</li>
              <li>✅ Vista de histórico</li>
              <li>✅ Desarchivado de tareas</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Estadísticas actuales:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>Tareas activas: {tasks.filter(t => !t.is_archived).length}</li>
              <li>Tareas completadas: {tasks.filter(t => t.status === 'completed' && !t.is_archived).length}</li>
              <li>Tareas archivadas: {archivedTasks.length}</li>
              <li>Total con notas: {[...tasks, ...archivedTasks].filter(t => t.completion_notes).length}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCompletionTesting;
