import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import ActiveWorkSubtasks from '@/components/tasks/ActiveWorkSubtasks';
import ActiveWorkNotes from '@/components/tasks/ActiveWorkNotes';
import WorkSessionSummary from '@/components/tasks/WorkSessionSummary';
import NextSteps from '@/components/tasks/NextSteps';

const ActiveWork = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { mainTasks } = useTasks();
  const { activeSession, startSession, endSession, isStarting, isEnding } = useTaskSessions();
  const { completeTask, markInProgress } = useTaskMutations();
  const [elapsedTime, setElapsedTime] = useState(0);
  const [taskProgress, setTaskProgress] = useState(0);
  
  const task = mainTasks.find(t => t.id === taskId);

  // Inicializar progreso basado en estado de la tarea
  useEffect(() => {
    if (task) {
      if (task.status === 'completed') {
        setTaskProgress(100);
      } else if (task.status === 'in_progress') {
        // Estimar progreso basado en tiempo trabajado vs estimado
        const estimated = task.estimated_duration || 60;
        const worked = task.actual_duration || 0;
        const estimatedProgress = Math.min(90, Math.round((worked / estimated) * 100));
        setTaskProgress(estimatedProgress);
      } else {
        setTaskProgress(0);
      }
    }
  }, [task]);
  
  // Auto-iniciar sesión al entrar
  useEffect(() => {
    if (task && !activeSession) {
      startSession(taskId);
      // Marcar tarea como en progreso si no lo está
      if (task.status === 'pending') {
        markInProgress(taskId);
      }
    }
  }, [task, taskId, activeSession, startSession, markInProgress]);
  
  // Timer para calcular tiempo transcurrido
  useEffect(() => {
    if (!activeSession) return;
    
    const startTime = new Date(activeSession.started_at).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeSession]);
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handlePauseWork = () => {
    if (activeSession) {
      endSession({ 
        sessionId: activeSession.id,
        productivityScore: Math.min(5, Math.max(1, Math.round(taskProgress / 20)))
      });
      navigate('/planner');
    }
  };
  
  const handleCompleteTask = async () => {
    if (activeSession) {
      await endSession({ 
        sessionId: activeSession.id,
        productivityScore: 5,
        notes: 'Tarea completada desde modo trabajo activo'
      });
    }
    
    // Completar la tarea
    await completeTask({
      taskId: taskId!,
      completionNotes: `Completada en modo trabajo activo. Progreso: ${taskProgress}%`
    });
    
    navigate('/planner');
  };
  
  const handleMarkInProgress = () => {
    if (task && task.status !== 'in_progress') {
      markInProgress(taskId!);
    }
  };
  
  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Tarea no encontrada</h2>
          <Button onClick={() => navigate('/planner')}>
            Volver al Planificador
          </Button>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/planner')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Planificador
              </Button>
              
              <div className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Modo Trabajo Activo</h1>
                <Badge variant="secondary" className="text-xs">
                  En Progreso
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-primary" />
              <span className="text-lg font-mono text-primary font-semibold">
                {formatTime(elapsedTime)}
              </span>
              {isStarting && (
                <Badge variant="outline" className="text-xs">
                  Iniciando...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Resumen de sesión */}
          <WorkSessionSummary 
            elapsedTime={elapsedTime}
            taskProgress={taskProgress}
            taskTitle={task.title}
            isActive={!!activeSession && !activeSession.ended_at}
          />
          
          {/* Info de la tarea */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                  {task.description && (
                    <p className="text-muted-foreground">{task.description}</p>
                  )}
                </div>
                <Badge variant={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Área principal de trabajo */}
            <div className="lg:col-span-2 space-y-4">
              <ActiveWorkNotes taskId={taskId!} />

              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Progreso de la Tarea
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar Visual */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avance General</span>
                      <Badge variant="secondary" className="text-xs">
                        {taskProgress}%
                      </Badge>
                    </div>
                    <Progress 
                      value={taskProgress} 
                      className="h-3 animate-scale-in"
                    />
                  </div>
                  
                  {/* Slider para ajustar progreso */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">
                      Ajustar progreso manualmente
                    </label>
                    <Slider
                      value={[taskProgress]}
                      onValueChange={(value) => setTaskProgress(value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  {/* Indicadores visuales */}
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((milestone) => (
                      <div 
                        key={milestone}
                        className={`text-center p-2 rounded-lg border transition-all ${
                          taskProgress >= milestone 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-muted border-border text-muted-foreground'
                        }`}
                      >
                        <div className="text-xs font-medium">{milestone}%</div>
                        <div className="text-xs">
                          {milestone === 25 && 'Iniciado'}
                          {milestone === 50 && 'Avanzando'}
                          {milestone === 75 && 'Casi listo'}
                          {milestone === 100 && 'Completado'}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <NextSteps 
                taskProgress={taskProgress}
                elapsedTime={elapsedTime}
              />

              <ActiveWorkSubtasks taskId={taskId!} />
            </div>
          </div>

          {/* Botones de acción mejorados */}
          <div className="mt-8 space-y-4">
            {/* Botón principal: Completar */}
            <div className="flex justify-center">
              <Button 
                size="lg" 
                className="px-12 py-3 text-lg font-semibold animate-scale-in"
                onClick={handleCompleteTask}
                disabled={isEnding}
              >
                {isEnding ? 'Finalizando...' : '✓ Completar Tarea'}
              </Button>
            </div>
            
            {/* Botones secundarios */}
            <div className="flex justify-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePauseWork}
                disabled={isEnding}
                className="px-6"
              >
                {isEnding ? 'Guardando...' : 'Pausar Trabajo'}
              </Button>
              
              {task?.status !== 'in_progress' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleMarkInProgress}
                  className="px-6"
                >
                  Marcar en Progreso
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/planner')}
                className="px-6"
              >
                Volver sin Guardar
              </Button>
            </div>
            
            {/* Indicador de progreso para completar */}
            {taskProgress < 100 && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Progreso: {taskProgress}% • {taskProgress < 90 ? 'Ajusta el progreso antes de completar' : 'Listo para completar'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWork;