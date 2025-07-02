import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, TrendingUp } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { getStatusConfig, getPriorityConfig } from './TaskStatusUtils';

interface NextActionsPlannerProps {
  tasks: Task[];
}

export const NextActionsPlanner: React.FC<NextActionsPlannerProps> = ({ tasks }) => {
  const [editingNextStep, setEditingNextStep] = useState<string | null>(null);
  const [newNextStep, setNewNextStep] = useState('');

  return (
    <div className="bg-gradient-subtle border border-task-card-border rounded-lg p-4">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Próximos Pasos y Planificación
      </h3>
      
      <div className="grid gap-4">
        {tasks.map(taskItem => {
          const statusConfig = getStatusConfig(taskItem.status);
          const priorityConfig = getPriorityConfig(taskItem.priority);
          
          return (
            <div key={taskItem.id} className="bg-task-card border border-task-card-border rounded-md p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${priorityConfig.bgColor}`} />
                  <span className="font-medium text-sm">{taskItem.title}</span>
                </div>
                <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`}>
                  {statusConfig.label}
                </Badge>
              </div>
              
              {editingNextStep === taskItem.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newNextStep}
                    onChange={(e) => setNewNextStep(e.target.value)}
                    placeholder="Describe el próximo paso..."
                    className="flex-1 h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingNextStep(null);
                        setNewNextStep('');
                      }
                      if (e.key === 'Escape') {
                        setEditingNextStep(null);
                        setNewNextStep('');
                      }
                    }}
                    autoFocus
                  />
                  <Button size="sm" className="h-8 text-xs">Guardar</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {taskItem.status === 'completed' 
                      ? '✅ Tarea completada exitosamente' 
                      : taskItem.status === 'pending'
                      ? '🚀 Listo para iniciar trabajo'
                      : taskItem.status === 'in_progress'
                      ? '⚡ En progreso activo'
                      : '⏸️ Esperando reanudación'
                    }
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingNextStep(taskItem.id);
                      setNewNextStep('');
                    }}
                    className="h-7 text-xs text-primary"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Planificar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};