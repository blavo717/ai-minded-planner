import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTasks } from '@/hooks/useTasks';
import { useSubtaskExpansion } from '@/hooks/useSubtaskExpansion';
import SubtaskHeader from './SubtaskHeader';
import SubtaskItem from './SubtaskItem';
import MicrotaskList from './MicrotaskList';
import TaskCreator from './TaskCreator';
import TaskCreatorModal from './TaskCreatorModal';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import TaskLogButton from '@/components/tasks/logs/TaskLogButton';
import TaskLogHistory from '@/components/tasks/logs/TaskLogHistory';
import TaskCompleteLogHistory from '@/components/tasks/logs/TaskCompleteLogHistory';

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (title: string) => void;
}

const SubtaskList = ({ parentTask, subtasks, onCreateSubtask }: SubtaskListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showCompleteLogs, setShowCompleteLogs] = useState(false);
  const { updateTask, deleteTask, createMicrotask, isCreatingTask } = useTaskMutations();
  const { getMicrotasksForSubtask } = useTasks();
  const { 
    toggleSubtaskExpansion, 
    isSubtaskExpanded,
    preserveExpansionState,
    restoreExpansionState,
    removeFromExpansion
  } = useSubtaskExpansion();

  const handleCreateSubtask = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    if (data.title && data.title.trim()) {
      onCreateSubtask(data.title.trim());
      setIsCreateModalOpen(false);
      toast({
        title: "Subtarea creada",
        description: `Se ha creado la subtarea "${data.title}" exitosamente.`,
      });
    }
  };

  const handleCreateMicrotask = (subtaskId: string, data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    if (data.title && data.title.trim()) {
      createMicrotask(subtaskId, data.title.trim(), data.description);
      toast({
        title: "Microtarea creada",
        description: `Se ha creado la microtarea "${data.title}" exitosamente.`,
      });
    }
  };

  const handleDeleteSubtask = async (taskId: string) => {
    // Preservar el estado de expansión antes de eliminar
    const currentExpansionState = preserveExpansionState();
    
    try {
      // Eliminar la subtarea del estado de expansión ya que se va a eliminar
      removeFromExpansion(taskId);
      
      // Eliminar la tarea
      await deleteTask(taskId);
      
      toast({
        title: "Subtarea eliminada",
        description: "La subtarea se ha eliminado exitosamente.",
      });
      
      // Restaurar el estado de expansión después de la eliminación
      // (sin incluir la subtarea eliminada)
      setTimeout(() => {
        restoreExpansionState(currentExpansionState);
      }, 100);
      
    } catch (error) {
      // Si hay error, restaurar el estado completo
      restoreExpansionState(currentExpansionState);
      console.error('Error al eliminar subtarea:', error);
    }
  };

  const handleDeleteMicrotask = async (taskId: string) => {
    // Para microtareas, solo preservamos el estado sin modificarlo
    const currentExpansionState = preserveExpansionState();
    
    try {
      await deleteTask(taskId);
      
      toast({
        title: "Microtarea eliminada",
        description: "La microtarea se ha eliminado exitosamente.",
      });
      
      // Restaurar el estado de expansión después de la eliminación
      setTimeout(() => {
        restoreExpansionState(currentExpansionState);
      }, 100);
      
    } catch (error) {
      restoreExpansionState(currentExpansionState);
      console.error('Error al eliminar microtarea:', error);
    }
  };

  const completedCount = subtasks.filter(task => task.status === 'completed').length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <SubtaskHeader
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
            completedCount={completedCount}
            totalCount={subtasks.length}
          />
          
          <div className="flex items-center gap-2">
            <TaskLogButton
              taskId={parentTask.id}
              taskTitle={parentTask.title}
              variant="ghost"
              size="sm"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogs(!showLogs)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Ver Logs
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCompleteLogs(!showCompleteLogs)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Log Completo
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Mostrar historial de logs si está activado */}
          {showLogs && (
            <TaskLogHistory
              taskId={parentTask.id}
              title={`Logs de "${parentTask.title}"`}
            />
          )}
          
          {/* Mostrar historial completo si está activado */}
          {showCompleteLogs && (
            <TaskCompleteLogHistory
              taskId={parentTask.id}
              taskTitle={parentTask.title}
            />
          )}

          {subtasks.map((subtask) => {
            const microtasks = getMicrotasksForSubtask(subtask.id);
            const isExpanded = isSubtaskExpanded(subtask.id);
            
            return (
              <SubtaskItem
                key={subtask.id}
                subtask={subtask}
                microtasks={microtasks}
                isExpanded={isExpanded}
                onToggleExpanded={() => toggleSubtaskExpansion(subtask.id)}
                onUpdateTask={updateTask}
                onDeleteTask={handleDeleteSubtask}
                onCreateMicrotask={(title) => handleCreateMicrotask(subtask.id, { title })}
              >
                <MicrotaskList
                  microtasks={microtasks}
                  isExpanded={isExpanded}
                  onUpdateTask={updateTask}
                  onDeleteTask={handleDeleteMicrotask}
                  onCreateMicrotask={(data) => handleCreateMicrotask(subtask.id, data)}
                  parentTask={subtask}
                />
              </SubtaskItem>
            );
          })}
          
          <div className="border-t pt-4">
            <TaskCreator
              placeholder="Título de la subtarea..."
              buttonText="Añadir Subtarea"
              onCreateTask={() => setIsCreateModalOpen(true)}
            />
          </div>

          <TaskCreatorModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateTask={handleCreateSubtask}
            isCreating={isCreatingTask}
            taskLevel="subtarea"
          />
        </CardContent>
      )}
    </Card>
  );
};

export default SubtaskList;
