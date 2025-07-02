import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Circle, CheckCircle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface ActiveWorkSubtasksProps {
  taskId: string;
}

const ActiveWorkSubtasks: React.FC<ActiveWorkSubtasksProps> = ({ taskId }) => {
  const { mainTasks } = useTasks();
  const { createTask, updateTask } = useTaskMutations();
  const [isCreating, setIsCreating] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Obtener subtareas de la tarea actual
  const subtasks = mainTasks.filter(task => 
    task.parent_task_id === taskId && task.task_level === 2
  );

  const completedSubtasks = subtasks.filter(task => task.status === 'completed').length;

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      createTask({
        title: newSubtaskTitle.trim(),
        parent_task_id: taskId,
        task_level: 2,
        status: 'pending',
        priority: 'medium'
      });
      setNewSubtaskTitle('');
      setIsCreating(false);
    }
  };

  const handleToggleSubtask = (subtaskId: string, completed: boolean) => {
    updateTask({
      id: subtaskId,
      status: completed ? 'completed' : 'pending',
      completed_at: completed ? new Date().toISOString() : undefined
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateSubtask();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewSubtaskTitle('');
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Circle className="w-5 h-5 text-primary" />
            Subtareas
          </CardTitle>
          {subtasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedSubtasks}/{subtasks.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Lista de subtareas */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {subtasks.map((subtask) => (
            <div 
              key={subtask.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                subtask.status === 'completed' 
                  ? 'bg-muted/30 border-muted' 
                  : 'bg-background border-border'
              }`}
            >
              <Checkbox
                checked={subtask.status === 'completed'}
                onCheckedChange={(checked) => 
                  handleToggleSubtask(subtask.id, checked as boolean)
                }
                className="h-4 w-4"
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  subtask.status === 'completed' 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}>
                  {subtask.title}
                </p>
                {subtask.description && (
                  <p className="text-xs text-muted-foreground truncate">
                    {subtask.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {subtask.status === 'completed' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
          
          {subtasks.length === 0 && !isCreating && (
            <div className="text-center py-8 text-muted-foreground">
              <Circle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay subtareas</p>
              <p className="text-xs">Crea una para organizar mejor tu trabajo</p>
            </div>
          )}
        </div>

        {/* Creador de subtareas */}
        <div className="border-t pt-3">
          {isCreating ? (
            <div className="flex items-center gap-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Nueva subtarea..."
                className="flex-1 h-9"
                autoFocus
                onKeyDown={handleKeyDown}
              />
              <Button
                size="sm"
                onClick={handleCreateSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="h-9 w-9 p-0"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewSubtaskTitle('');
                }}
                className="h-9 w-9 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full h-9 text-sm font-normal"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar subtarea
            </Button>
          )}
        </div>

        {/* Progreso de subtareas */}
        {subtasks.length > 0 && (
          <div className="mt-4 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Progreso de subtareas</span>
              <span>{Math.round((completedSubtasks / subtasks.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(completedSubtasks / subtasks.length) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveWorkSubtasks;