
import React, { useMemo, useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import MatrixQuadrant from './MatrixQuadrant';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Grid3X3, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

type QuadrantType = 'urgent-important' | 'important-not-urgent' | 'urgent-not-important' | 'not-urgent-not-important';

const EisenhowerMatrix = ({ tasks, onEditTask, onCompleteTask }: EisenhowerMatrixProps) => {
  const { updateTask } = useTaskMutations();
  const [autoClassified, setAutoClassified] = useState(0);

  // Función para auto-clasificar tareas basada en fechas y prioridad
  const getTaskQuadrant = (task: Task): QuadrantType => {
    const isUrgent = task.priority === 'urgent' || 
                    (task.due_date && new Date(task.due_date) <= new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)); // Próximos 2 días
    const isImportant = task.priority === 'urgent' || task.priority === 'high';

    if (isUrgent && isImportant) return 'urgent-important';
    if (!isUrgent && isImportant) return 'important-not-urgent';
    if (isUrgent && !isImportant) return 'urgent-not-important';
    return 'not-urgent-not-important';
  };

  // Organizar tareas por cuadrantes
  const organizedTasks = useMemo(() => {
    const quadrants = {
      'urgent-important': [] as Task[],
      'important-not-urgent': [] as Task[],
      'urgent-not-important': [] as Task[],
      'not-urgent-not-important': [] as Task[]
    };

    tasks.forEach(task => {
      const quadrant = getTaskQuadrant(task);
      quadrants[quadrant].push(task);
    });

    return quadrants;
  }, [tasks]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTaskDrop = async (task: Task, targetQuadrant: QuadrantType) => {
    const currentQuadrant = getTaskQuadrant(task);
    if (currentQuadrant === targetQuadrant) return;

    // Determinar nueva prioridad basada en el cuadrante
    let newPriority: Task['priority'];
    switch (targetQuadrant) {
      case 'urgent-important':
        newPriority = 'urgent';
        break;
      case 'important-not-urgent':
        newPriority = 'high';
        break;
      case 'urgent-not-important':
        newPriority = 'medium';
        break;
      case 'not-urgent-not-important':
        newPriority = 'low';
        break;
    }

    try {
      await updateTask({
        id: task.id,
        priority: newPriority
      });
      toast.success('Tarea reclasificada correctamente');
    } catch (error) {
      toast.error('Error al reclasificar la tarea');
    }
  };

  const handleAutoClassify = async () => {
    let classified = 0;
    
    for (const task of tasks) {
      const currentQuadrant = getTaskQuadrant(task);
      let newPriority: Task['priority'];
      
      switch (currentQuadrant) {
        case 'urgent-important':
          newPriority = 'urgent';
          break;
        case 'important-not-urgent':
          newPriority = 'high';
          break;
        case 'urgent-not-important':
          newPriority = 'medium';
          break;
        case 'not-urgent-not-important':
          newPriority = 'low';
          break;
      }
      
      if (task.priority !== newPriority) {
        try {
          await updateTask({
            id: task.id,
            priority: newPriority
          });
          classified++;
        } catch (error) {
          console.error('Error updating task:', error);
        }
      }
    }
    
    setAutoClassified(classified);
    if (classified > 0) {
      toast.success(`${classified} tareas auto-clasificadas`);
    } else {
      toast.info('Todas las tareas ya están correctamente clasificadas');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Matriz de Eisenhower</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {autoClassified > 0 && (
            <Badge variant="secondary" className="text-xs">
              {autoClassified} auto-clasificadas
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoClassify}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Auto-clasificar
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        <p>Arrastra las tareas entre cuadrantes para reclasificarlas según urgencia e importancia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto">
        {/* Cuadrante 1: Urgente e Importante */}
        <MatrixQuadrant
          title="Hacer Ahora"
          description="Urgente e Importante"
          tasks={organizedTasks['urgent-important']}
          color="border-red-200 bg-red-50"
          onEditTask={onEditTask}
          onCompleteTask={onCompleteTask}
          onDrop={(task) => handleTaskDrop(task, 'urgent-important')}
          onDragOver={handleDragOver}
        />

        {/* Cuadrante 2: Importante pero No Urgente */}
        <MatrixQuadrant
          title="Planificar"
          description="Importante pero No Urgente"
          tasks={organizedTasks['important-not-urgent']}
          color="border-green-200 bg-green-50"
          onEditTask={onEditTask}
          onCompleteTask={onCompleteTask}
          onDrop={(task) => handleTaskDrop(task, 'important-not-urgent')}
          onDragOver={handleDragOver}
        />

        {/* Cuadrante 3: Urgente pero No Importante */}
        <MatrixQuadrant
          title="Delegar"
          description="Urgente pero No Importante"
          tasks={organizedTasks['urgent-not-important']}
          color="border-yellow-200 bg-yellow-50"
          onEditTask={onEditTask}
          onCompleteTask={onCompleteTask}
          onDrop={(task) => handleTaskDrop(task, 'urgent-not-important')}
          onDragOver={handleDragOver}
        />

        {/* Cuadrante 4: Ni Urgente ni Importante */}
        <MatrixQuadrant
          title="Eliminar"
          description="Ni Urgente ni Importante"
          tasks={organizedTasks['not-urgent-not-important']}
          color="border-gray-200 bg-gray-50"
          onEditTask={onEditTask}
          onCompleteTask={onCompleteTask}
          onDrop={(task) => handleTaskDrop(task, 'not-urgent-not-important')}
          onDragOver={handleDragOver}
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Hacer Ahora:</strong> Crisis, emergencias, deadlines inminentes</p>
        <p><strong>Planificar:</strong> Proyectos importantes, desarrollo personal, prevención</p>
        <p><strong>Delegar:</strong> Interrupciones, algunas reuniones, algunas llamadas</p>
        <p><strong>Eliminar:</strong> Actividades triviales, pérdidas de tiempo, actividades de escape</p>
      </div>
    </div>
  );
};

export default EisenhowerMatrix;
