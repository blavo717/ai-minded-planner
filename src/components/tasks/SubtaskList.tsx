
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTasks } from '@/hooks/useTasks';
import { useSubtaskExpansion } from '@/hooks/useSubtaskExpansion';
import SubtaskHeader from './subtasks/SubtaskHeader';
import SubtaskItem from './subtasks/SubtaskItem';
import MicrotaskList from './subtasks/MicrotaskList';
import TaskCreator from './subtasks/TaskCreator';
import TaskCreatorModal from './subtasks/TaskCreatorModal';
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
  const { toggleSubtaskExpansion, isSubtaskExpanded } = useSubtaskExpansion();

  const handleCreateSubtask = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    if (data.title && data.title.trim()) {
      onCreateSubtask(data.title.trim());
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

  const handleDeleteSubtask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Subtarea eliminada",
      description: "La subtarea se ha eliminado exitosamente.",
    });
  };

  const handleDeleteMicrotask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Microtarea eliminada",
      description: "La microtarea se ha eliminado exitosamente.",
    });
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
        <CardContent className="space-y-4">
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
                />
              </SubtaskItem>
            );
          })}
          
          <div className="border-t pt-4">
            <TaskCreator
              placeholder="Título de la subtarea..."
              buttonText="Añadir Subtarea"
              onCreateTask={(title) => setIsCreateModalOpen(true)}
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
