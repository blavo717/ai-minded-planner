
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTasks } from '@/hooks/useTasks';
import { useSubtaskExpansion } from '@/hooks/useSubtaskExpansion';
import SubtaskHeader from './SubtaskHeader';
import CompactSubtaskItem from './CompactSubtaskItem';
import MicrotaskList from './MicrotaskList';
import InlineTaskCreator from './InlineTaskCreator';
import TaskCreatorModal from './TaskCreatorModal';
import { toast } from '@/hooks/use-toast';

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (title: string) => void;
}

const SubtaskList = ({ parentTask, subtasks, onCreateSubtask }: SubtaskListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const handleCreateSubtaskSimple = (title: string) => {
    onCreateSubtask(title);
    toast({
      title: "Subtarea creada",
      description: `Se ha creado la subtarea "${title}" exitosamente.`,
    });
  };

  const handleCreateMicrotask = (subtaskId: string, data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    if (data.title && data.title.trim()) {
      createMicrotask({ parentSubtaskId: subtaskId, title: data.title.trim() });
      toast({
        title: "Microtarea creada",
        description: `Se ha creada la microtarea "${data.title}" exitosamente.`,
      });
    }
  };

  const handleDeleteSubtask = async (taskId: string) => {
    const currentExpansionState = preserveExpansionState();
    
    try {
      removeFromExpansion(taskId);
      await deleteTask(taskId);
      
      toast({
        title: "Subtarea eliminada",
        description: "La subtarea se ha eliminado exitosamente.",
      });
      
      setTimeout(() => {
        restoreExpansionState(currentExpansionState);
      }, 100);
      
    } catch (error) {
      restoreExpansionState(currentExpansionState);
      console.error('Error al eliminar subtarea:', error);
    }
  };

  const handleDeleteMicrotask = async (taskId: string) => {
    const currentExpansionState = preserveExpansionState();
    
    try {
      await deleteTask(taskId);
      
      toast({
        title: "Microtarea eliminada",
        description: "La microtarea se ha eliminado exitosamente.",
      });
      
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
        <SubtaskHeader
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
          completedCount={completedCount}
          totalCount={subtasks.length}
        />
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3">
          {subtasks.map((subtask) => {
            const microtasks = getMicrotasksForSubtask(subtask.id);
            const isExpanded = isSubtaskExpanded(subtask.id);
            
            return (
              <CompactSubtaskItem
                key={subtask.id}
                subtask={subtask}
                microtasks={microtasks}
                isExpanded={isExpanded}
                onToggleExpanded={() => toggleSubtaskExpansion(subtask.id)}
                onUpdateTask={updateTask}
                onDeleteTask={handleDeleteSubtask}
              >
                <MicrotaskList
                  microtasks={microtasks}
                  isExpanded={isExpanded}
                  onUpdateTask={updateTask}
                  onDeleteTask={handleDeleteMicrotask}
                  onCreateMicrotask={(data) => handleCreateMicrotask(subtask.id, data)}
                  parentTask={subtask}
                />
              </CompactSubtaskItem>
            );
          })}
          
          <div className="border-t pt-3">
            <InlineTaskCreator
              placeholder="Añadir nueva subtarea..."
              onCreateTask={handleCreateSubtaskSimple}
              onOpenAdvanced={() => setIsCreateModalOpen(true)}
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
