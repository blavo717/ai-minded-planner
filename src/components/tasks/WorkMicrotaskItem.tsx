import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Play, CheckCircle, Circle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useNavigate } from 'react-router-dom';
import MicrotaskWorkField from './MicrotaskWorkField';
import MicrotaskTrackRecord from './MicrotaskTrackRecord';

interface WorkMicrotaskItemProps {
  microtask: Task;
  isLast?: boolean;
}

const WorkMicrotaskItem: React.FC<WorkMicrotaskItemProps> = ({ microtask, isLast }) => {
  const { updateTask } = useTaskMutations();
  const navigate = useNavigate();
  const [isActiveWork, setIsActiveWork] = useState(false);

  const handleToggleMicrotask = (completed: boolean) => {
    updateTask({
      id: microtask.id,
      status: completed ? 'completed' : 'pending',
      completed_at: completed ? new Date().toISOString() : undefined
    });
  };

  const handleWorkOnMicrotask = () => {
    navigate(`/work/${microtask.id}`);
  };

  const getStatusColor = () => {
    if (microtask.status === 'completed') return 'text-green-600';
    if (microtask.status === 'in_progress') return 'text-blue-600';
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (microtask.status === 'completed') {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    return <Circle className="w-3 h-3 text-muted-foreground" />;
  };

  const canWork = microtask.status !== 'completed';

  return (
    <div className="relative">
      {/* Línea conectora de microtarea */}
      <div className="absolute -left-4 top-3 w-3 h-px bg-muted"></div>
      
      <div className={`flex items-center gap-3 p-2 rounded-md border transition-all hover:bg-muted/30 ${
        microtask.status === 'completed' 
          ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800' 
          : microtask.status === 'in_progress'
          ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800'
          : 'bg-background border-border hover:border-primary/20'
      }`}>
        
        {/* Checkbox para completar */}
        <Checkbox
          checked={microtask.status === 'completed'}
          onCheckedChange={(checked) => handleToggleMicrotask(checked as boolean)}
          className="h-3 w-3 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />
        
        {/* Icono de microtarea */}
        <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
        
        {/* Contenido de la microtarea */}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium truncate ${
            microtask.status === 'completed' 
              ? 'text-muted-foreground line-through' 
              : 'text-foreground'
          }`}>
            {microtask.title}
          </p>
          {microtask.description && (
            <p className="text-xs text-muted-foreground truncate opacity-75">
              {microtask.description}
            </p>
          )}
        </div>

        {/* Estado y acciones */}
        <div className="flex items-center gap-2">
          {/* Indicador de estado */}
          {getStatusIcon()}
          
          {/* Botón para trabajar */}
          {canWork && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsActiveWork(!isActiveWork)}
                className={`h-6 px-2 text-xs ${
                  isActiveWork ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'
                }`}
              >
                <Play className="w-2 h-2 mr-1" />
                {isActiveWork ? 'Trabajando' : 'Trabajar aquí'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleWorkOnMicrotask}
                className="h-6 px-2 text-xs"
              >
                Vista completa
              </Button>
            </div>
          )}
          
          {/* Badge de estado */}
          {microtask.status === 'completed' && (
            <Badge variant="outline" className="text-xs h-5 px-1">
              ✓
            </Badge>
          )}
          {microtask.status === 'in_progress' && (
            <Badge variant="secondary" className="text-xs h-5 px-1">
              🔄
            </Badge>
          )}
        </div>
      </div>
      
      {/* Campo de trabajo específico */}
      {(canWork && isActiveWork) && (
        <MicrotaskWorkField 
          microtask={microtask}
          showByDefault={isActiveWork}
        />
      )}

      {/* Track records siempre visibles cuando hay trabajo activo */}
      {isActiveWork && (
        <MicrotaskTrackRecord microtask={microtask} />
      )}
    </div>
  );
};

export default WorkMicrotaskItem;