
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertTriangle, Calendar, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/hooks/useTasks';

interface TaskListProps {
  tasks: Task[];
  title: string;
  maxItems?: number;
}

const TaskList = ({ tasks, title, maxItems = 5 }: TaskListProps) => {
  const displayTasks = maxItems ? tasks.slice(0, maxItems) : tasks;

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            {displayTasks.length} de {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayTasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No hay tareas disponibles
          </p>
        ) : (
          displayTasks.map((task) => (
            <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(task.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-medium truncate">{task.title}</h4>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                </div>
                
                {task.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {getStatusText(task.status)}
                  </Badge>
                  
                  {task.due_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(task.due_date), 'dd MMM', { locale: es })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
