
import React, { useMemo, useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import MatrixQuadrant from './MatrixQuadrant';
import EisenhowerHeader from './eisenhower/EisenhowerHeader';
import EisenhowerGuide from './eisenhower/EisenhowerGuide';
import { toast } from 'sonner';
import { 
  QuadrantType, 
  getTaskQuadrant, 
  organizeTasksByQuadrants,
  getNewPriorityForQuadrant 
} from '@/utils/eisenhowerUtils';

interface EisenhowerMatrixProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

const EisenhowerMatrix = ({ tasks, onEditTask, onCompleteTask }: EisenhowerMatrixProps) => {
  const { updateTask } = useTaskMutations();
  const [autoClassified, setAutoClassified] = useState(0);

  // Organizar tareas por cuadrantes
  const organizedTasks = useMemo(() => {
    return organizeTasksByQuadrants(tasks);
  }, [tasks]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTaskDrop = async (task: Task, targetQuadrant: QuadrantType) => {
    const currentQuadrant = getTaskQuadrant(task);
    if (currentQuadrant === targetQuadrant) return;

    const newPriority = getNewPriorityForQuadrant(targetQuadrant);

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
      const newPriority = getNewPriorityForQuadrant(currentQuadrant);
      
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
      <EisenhowerHeader 
        autoClassified={autoClassified}
        onAutoClassify={handleAutoClassify}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-auto">
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

      <EisenhowerGuide />
    </div>
  );
};

export default EisenhowerMatrix;
