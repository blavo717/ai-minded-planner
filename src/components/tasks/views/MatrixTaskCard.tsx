
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import { Clock, Calendar, Edit, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface MatrixTaskCardProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

const MatrixTaskCard = ({ task, onEditTask, onCompleteTask }: MatrixTaskCardProps) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const isCompleted = task.status === 'completed';

  return (
    <Card className={`w-full mb-2 ${getPriorityColor(task.priority)} ${isCompleted ? 'opacity-60' : ''} cursor-move`}>
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className={`font-medium text-sm line-clamp-2 ${isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEditTask(task)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              {!isCompleted && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onCompleteTask(task)}
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge 
                variant={isCompleted ? 'secondary' : 'default'} 
                className="text-xs px-1 py-0"
              >
                {task.status === 'pending' ? 'Pendiente' : 
                 task.status === 'in_progress' ? 'En Progreso' : 
                 task.status === 'completed' ? 'Completada' : 'Cancelada'}
              </Badge>
              
              {task.estimated_duration && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimated_duration}min</span>
                </div>
              )}
            </div>

            {task.due_date && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                <span>
                  {format(parseISO(task.due_date), 'dd/MM', { locale: es })}
                </span>
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs px-1 py-0 ml-1">
                    Vencida
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixTaskCard;
