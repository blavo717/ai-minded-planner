import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Circle, CheckCircle, Zap } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface ActiveWorkMicrotasksProps {
  taskId: string;
}

const ActiveWorkMicrotasks: React.FC<ActiveWorkMicrotasksProps> = ({ taskId }) => {
  const { microtasks } = useTasks();
  const { createTask, updateTask } = useTaskMutations();
  const [isCreating, setIsCreating] = useState(false);
  const [newMicrotaskTitle, setNewMicrotaskTitle] = useState('');

  // Obtener microtareas de la tarea/subtarea actual
  const taskMicrotasks = microtasks.filter(task => 
    task.parent_task_id === taskId && task.task_level === 3
  );

  const completedMicrotasks = taskMicrotasks.filter(task => task.status === 'completed').length;

  const handleCreateMicrotask = () => {
    if (newMicrotaskTitle.trim()) {
      createTask({
        title: newMicrotaskTitle.trim(),
        parent_task_id: taskId,
        task_level: 3,
        status: 'pending',
        priority: 'medium'
      });
      setNewMicrotaskTitle('');
      setIsCreating(false);
    }
  };

  const handleToggleMicrotask = (microtaskId: string, completed: boolean) => {
    updateTask({
      id: microtaskId,
      status: completed ? 'completed' : 'pending',
      completed_at: completed ? new Date().toISOString() : undefined
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateMicrotask();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewMicrotaskTitle('');
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Microtareas
          </CardTitle>
          {taskMicrotasks.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {completedMicrotasks}/{taskMicrotasks.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Lista de microtareas */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {taskMicrotasks.map((microtask) => (
            <div 
              key={microtask.id}
              className={`flex items-center gap-3 p-2 rounded-md border transition-all hover:bg-muted/50 ${
                microtask.status === 'completed' 
                  ? 'bg-muted/30 border-muted' 
                  : 'bg-background border-border'
              }`}
            >
              <Checkbox
                checked={microtask.status === 'completed'}
                onCheckedChange={(checked) => 
                  handleToggleMicrotask(microtask.id, checked as boolean)
                }
                className="h-3 w-3"
              />
              
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${
                  microtask.status === 'completed' 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}>
                  {microtask.title}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {microtask.status === 'completed' ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
          
          {taskMicrotasks.length === 0 && !isCreating && (
            <div className="text-center py-6 text-muted-foreground">
              <Zap className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No hay microtareas</p>
              <p className="text-xs opacity-75">Divide en pasos muy pequeños</p>
            </div>
          )}
        </div>

        {/* Creador de microtareas */}
        <div className="border-t pt-3">
          {isCreating ? (
            <div className="flex items-center gap-2">
              <Input
                value={newMicrotaskTitle}
                onChange={(e) => setNewMicrotaskTitle(e.target.value)}
                placeholder="Nueva microtarea..."
                className="flex-1 h-8 text-xs"
                autoFocus
                onKeyDown={handleKeyDown}
              />
              <Button
                size="sm"
                onClick={handleCreateMicrotask}
                disabled={!newMicrotaskTitle.trim()}
                className="h-8 w-8 p-0"
              >
                <Check className="w-3 h-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setNewMicrotaskTitle('');
                }}
                className="h-8 w-8 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full h-8 text-xs font-normal"
            >
              <Plus className="w-3 h-3 mr-2" />
              Agregar microtarea
            </Button>
          )}
        </div>

        {/* Progreso de microtareas */}
        {taskMicrotasks.length > 0 && (
          <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Micro-progreso</span>
              <span>{Math.round((completedMicrotasks / taskMicrotasks.length) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(completedMicrotasks / taskMicrotasks.length) * 100}%` 
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveWorkMicrotasks;