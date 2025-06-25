
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskListProps {
  tasks: Task[];
  title: string;
  maxItems?: number;
}

const TaskList = ({ tasks, title, maxItems = 5 }: TaskListProps) => {
  const displayTasks = tasks.slice(0, maxItems);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay tareas para mostrar
          </p>
        ) : (
          <div className="space-y-3">
            {displayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{task.title}</h4>
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(task.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </div>
                    
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(task.due_date), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
