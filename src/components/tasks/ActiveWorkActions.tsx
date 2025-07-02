import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';

interface ActiveWorkActionsProps {
  task: Task;
  taskProgress: number;
  isEnding: boolean;
  onCompleteTask: () => void;
  onPauseWork: () => void;
  onMarkInProgress: () => void;
}

const ActiveWorkActions: React.FC<ActiveWorkActionsProps> = ({
  task,
  taskProgress,
  isEnding,
  onCompleteTask,
  onPauseWork,
  onMarkInProgress
}) => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 space-y-4">
      {/* Botón principal: Completar */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-12 py-3 text-lg font-semibold animate-scale-in"
          onClick={onCompleteTask}
          disabled={isEnding}
        >
          {isEnding ? 'Finalizando...' : '✓ Completar Tarea'}
        </Button>
      </div>
      
      {/* Botones secundarios */}
      <div className="flex justify-center gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onPauseWork}
          disabled={isEnding}
          className="px-6"
        >
          {isEnding ? 'Guardando...' : 'Pausar Trabajo'}
        </Button>
        
        {task?.status !== 'in_progress' && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onMarkInProgress}
            className="px-6"
          >
            Marcar en Progreso
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/planner')}
          className="px-6"
        >
          Volver sin Guardar
        </Button>
      </div>
      
      {/* Indicador de progreso para completar */}
      {taskProgress < 100 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Progreso: {taskProgress}% • {taskProgress < 90 ? 'Ajusta el progreso antes de completar' : 'Listo para completar'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveWorkActions;