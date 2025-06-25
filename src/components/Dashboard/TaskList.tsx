
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Users,
  UserPlus
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import AssignTaskModal from '@/components/modals/AssignTaskModal';

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800', 
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: Circle,
  in_progress: Clock,
  completed: CheckCircle2,
  cancelled: AlertCircle,
};

const TaskList = () => {
  const { tasks, profiles, taskAssignments, updateTask } = useTasks();
  const [assignModalTask, setAssignModalTask] = useState<{ id: string; title: string } | null>(null);

  // Obtener las primeras 5 tareas pendientes o en progreso
  const activeTasks = tasks
    .filter(task => task.status === 'pending' || task.status === 'in_progress')
    .slice(0, 5);

  const getTaskAssignments = (taskId: string) => {
    return taskAssignments.filter(assignment => assignment.task_id === taskId);
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask({
      id: taskId,
      status: newStatus as any,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Tareas Activas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            ¡Excelente! No tienes tareas pendientes.
          </p>
        ) : (
          activeTasks.map((task) => {
            const StatusIcon = statusIcons[task.status];
            const assignments = getTaskAssignments(task.id);
            
            return (
              <div
                key={task.id}
                className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => handleStatusChange(
                      task.id, 
                      task.status === 'completed' ? 'pending' : 'completed'
                    )}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <StatusIcon className="h-4 w-4" />
                  </button>
                  
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                      
                      {assignments.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{assignments.length} asignado{assignments.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {task.due_date && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAssignModalTask({ id: task.id, title: task.title })}
                    className="h-8 w-8 p-0"
                  >
                    <UserPlus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
        
        {assignModalTask && (
          <AssignTaskModal
            isOpen={true}
            onClose={() => setAssignModalTask(null)}
            taskId={assignModalTask.id}
            taskTitle={assignModalTask.title}
            profiles={profiles}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;
