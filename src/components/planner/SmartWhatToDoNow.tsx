import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RotateCcw, 
  List, 
  Clock, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SmartWhatToDoNowProps {
  tasks: Task[];
  onWorkOnTask: (task: Task) => void;
  onShowAllTasks: () => void;
}

interface TaskAction {
  taskId: string;
  action: 'accepted' | 'skipped' | 'completed' | 'feedback_positive' | 'feedback_negative';
  timestamp: string;
}

const SmartWhatToDoNow: React.FC<SmartWhatToDoNowProps> = ({
  tasks,
  onWorkOnTask,
  onShowAllTasks
}) => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [userActions, setUserActions] = useState<TaskAction[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  // Algoritmo básico de selección de tarea
  const selectSuggestedTask = (): Task | null => {
    if (tasks.length === 0) return null;

    // 1. Tareas críticas (vencidas o urgentes)
    const criticalTasks = tasks.filter(task => {
      const isOverdue = task.due_date && new Date(task.due_date) < new Date();
      const isUrgent = task.priority === 'urgent' || task.priority === 'high';
      return (isOverdue || isUrgent) && task.status !== 'completed';
    });

    if (criticalTasks.length > 0) {
      return criticalTasks[0];
    }

    // 2. Última tarea editada que no esté completada
    const incompleteTasks = tasks.filter(task => task.status !== 'completed');
    if (incompleteTasks.length > 0) {
      return incompleteTasks.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0];
    }

    // 3. Fallback: primera tarea disponible
    return tasks[0] || null;
  };

  const suggestedTask = selectSuggestedTask();

  // Tracking de acciones
  const trackAction = (action: TaskAction['action']) => {
    if (!suggestedTask) return;
    
    const newAction: TaskAction = {
      taskId: suggestedTask.id,
      action,
      timestamp: new Date().toISOString()
    };
    
    setUserActions(prev => [...prev, newAction]);
    
    // Persistir en localStorage para métricas MVP
    const savedActions = JSON.parse(localStorage.getItem('planner_mvp_actions') || '[]');
    savedActions.push(newAction);
    localStorage.setItem('planner_mvp_actions', JSON.stringify(savedActions));
  };

  const handleWorkOnTask = () => {
    if (!suggestedTask) return;
    trackAction('accepted');
    onWorkOnTask(suggestedTask);
  };

  const handleSkipTask = () => {
    trackAction('skipped');
    // Buscar siguiente tarea
    const nextTasks = tasks.filter(t => t.id !== suggestedTask?.id && t.status !== 'completed');
    if (nextTasks.length > 0) {
      setCurrentTaskIndex(prev => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleFeedback = (positive: boolean) => {
    trackAction(positive ? 'feedback_positive' : 'feedback_negative');
    setShowFeedback(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getTaskReason = (): string => {
    if (!suggestedTask) return '';
    
    const isOverdue = suggestedTask.due_date && new Date(suggestedTask.due_date) < new Date();
    const isUrgent = suggestedTask.priority === 'urgent' || suggestedTask.priority === 'high';
    
    if (isOverdue) return '⚠️ Tarea vencida - requiere atención inmediata';
    if (isUrgent) return '🔥 Alta prioridad - importante completar pronto';
    return '📝 Última tarea en la que trabajaste';
  };

  if (!suggestedTask) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="text-xl font-semibold">¡Excelente trabajo!</h3>
            <p className="text-muted-foreground">
              No tienes tareas pendientes. Es momento de planificar nuevos objetivos.
            </p>
            <Button onClick={onShowAllTasks} variant="outline">
              <List className="w-4 h-4 mr-2" />
              Ver todas las tareas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">¿Qué hago ahora?</CardTitle>
          <Badge variant="outline" className="text-xs">
            IA Sugerencia
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Información de la tarea */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg leading-tight">
              {suggestedTask.title}
            </h3>
            <Badge variant={getPriorityColor(suggestedTask.priority)} className="ml-2">
              {suggestedTask.priority}
            </Badge>
          </div>
          
          {suggestedTask.description && (
            <p className="text-muted-foreground text-sm">
              {suggestedTask.description}
            </p>
          )}
          
          {/* Razón de la sugerencia */}
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <p className="text-sm font-medium text-primary">
              {getTaskReason()}
            </p>
          </div>
          
          {/* Metadata de la tarea */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {suggestedTask.due_date && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Vence: {format(new Date(suggestedTask.due_date), 'dd MMM', { locale: es })}
              </div>
            )}
            {suggestedTask.estimated_duration && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ~{suggestedTask.estimated_duration} min
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={handleWorkOnTask}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Play className="w-4 h-4 mr-2" />
            🚀 Trabajar aquí
          </Button>
          
          <Button 
            onClick={handleSkipTask}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            🔄 Otra tarea
          </Button>
          
          <Button 
            onClick={onShowAllTasks}
            variant="ghost"
            className="flex-1"
          >
            <List className="w-4 h-4 mr-2" />
            📋 Ver todas
          </Button>
        </div>

        {/* Feedback rápido */}
        {showFeedback && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-3">
              ¿Esta sugerencia fue útil?
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFeedback(true)}
              >
                <ThumbsUp className="w-4 h-4 mr-1" />
                👍 Útil
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleFeedback(false)}
              >
                <ThumbsDown className="w-4 h-4 mr-1" />
                👎 No útil
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartWhatToDoNow;