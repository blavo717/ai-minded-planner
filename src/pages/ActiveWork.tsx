import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Timer, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';

const ActiveWork = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const { mainTasks } = useTasks();
  const { activeSession, startSession, endSession, isStarting, isEnding } = useTaskSessions();
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const task = mainTasks.find(t => t.id === taskId);
  
  // Auto-iniciar sesión al entrar
  useEffect(() => {
    if (task && !activeSession) {
      startSession(taskId);
    }
  }, [task, taskId, activeSession, startSession]);
  
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
      endSession({ sessionId: activeSession.id });
      navigate('/planner');
    }
  };
  
  const handleCompleteTask = () => {
    if (activeSession) {
      endSession({ 
        sessionId: activeSession.id,
        productivityScore: 5,
        notes: 'Tarea completada desde modo trabajo activo'
      });
    }
    // TODO: Marcar tarea como completada
    navigate('/planner');
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas de Trabajo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Campo de notas (próximamente)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progreso</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">
                      Progress bar (próximamente)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Próximos Pasos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      Lista de pasos (próximamente)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subtareas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground text-center">
                      Gestión de subtareas (próximamente)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              size="lg" 
              className="px-8"
              onClick={handleCompleteTask}
              disabled={isEnding}
            >
              {isEnding ? 'Guardando...' : 'Completar Tarea'}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8"
              onClick={handlePauseWork}
              disabled={isEnding}
            >
              {isEnding ? 'Guardando...' : 'Pausar Trabajo'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveWork;