import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Circle, Play, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import WorkMicrotaskItem from './WorkMicrotaskItem';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WorkSubtaskCardProps {
  subtask: Task;
  isLast?: boolean;
}

const WorkSubtaskCard: React.FC<WorkSubtaskCardProps> = ({ subtask, isLast }) => {
  const { microtasks } = useTasks();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  // Obtener microtareas de esta subtarea
  const subtaskMicrotasks = microtasks.filter(m => m.parent_task_id === subtask.id);
  const completedMicrotasks = subtaskMicrotasks.filter(m => m.status === 'completed').length;
  
  // Calcular progreso de la subtarea
  const subtaskProgress = subtaskMicrotasks.length > 0 
    ? Math.round((completedMicrotasks / subtaskMicrotasks.length) * 100)
    : (subtask.status === 'completed' ? 100 : 0);

  const handleWorkOnSubtask = () => {
    navigate(`/work/${subtask.id}`);
  };

  const getStatusColor = () => {
    if (subtask.status === 'completed') return 'text-green-600';
    if (subtask.status === 'in_progress') return 'text-blue-600';
    if (subtaskProgress > 0) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getStatusLabel = () => {
    if (subtask.status === 'completed') return 'Completado';
    if (subtask.status === 'in_progress') return 'En Progreso';
    if (subtaskProgress > 0) return 'Iniciado';
    return 'Pendiente';
  };

  const canWork = subtask.status !== 'completed';

  return (
    <div className="relative">
      {/* Línea conectora */}
      <div className="absolute -left-6 top-6 w-4 h-px bg-primary/30"></div>
      
      <Card className={`border-l-4 transition-all hover:shadow-md ${
        subtask.status === 'completed' 
          ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : subtask.status === 'in_progress'
          ? 'border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
          : subtaskProgress > 0
          ? 'border-l-yellow-500 bg-yellow-50/30 dark:bg-yellow-950/20'
          : 'border-l-muted-foreground bg-background'
      }`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                <Circle className={`w-5 h-5 ${getStatusColor()}`} />
                
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {subtask.title}
                  </CardTitle>
                  {subtask.description && isExpanded && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {subtask.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {getStatusLabel()}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {subtaskProgress}%
                </Badge>
                {canWork && (
                  <Button 
                    size="sm" 
                    onClick={handleWorkOnSubtask}
                    className="h-7 px-3 text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Trabajar aquí
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              {/* Progress bar de la subtarea */}
              {subtaskMicrotasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progreso de microtareas</span>
                    <span>{completedMicrotasks}/{subtaskMicrotasks.length}</span>
                  </div>
                  <Progress value={subtaskProgress} className="h-1.5" />
                </div>
              )}

              {/* Lista de microtareas */}
              <div className="space-y-2 pl-4 border-l-2 border-dashed border-muted">
                {subtaskMicrotasks.length > 0 ? (
                  subtaskMicrotasks.map((microtask, index) => (
                    <WorkMicrotaskItem 
                      key={microtask.id}
                      microtask={microtask}
                      isLast={index === subtaskMicrotasks.length - 1}
                    />
                  ))
                ) : (
                  <div className="py-3 text-center text-muted-foreground">
                    <p className="text-xs">Sin microtareas</p>
                    <p className="text-xs opacity-75">Divide en pasos más pequeños</p>
                  </div>
                )}
              </div>

              {/* Crear nueva microtarea */}
              <div className="mt-3 pl-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {/* TODO: Implementar creación de microtarea */}}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar microtarea
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};

export default WorkSubtaskCard;