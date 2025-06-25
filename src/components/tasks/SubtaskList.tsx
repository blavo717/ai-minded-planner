
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

interface SubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (title: string) => void;
}

const SubtaskList = ({ parentTask, subtasks, onCreateSubtask }: SubtaskListProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { updateTask, deleteTask, createMicrotask } = useTaskMutations();
  const { getMicrotasksForSubtask } = useTasks();
  const { toggleSubtaskExpansion, isSubtaskExpanded } = useSubtaskExpansion();

  const handleCreateMicrotask = (subtaskId: string, title: string) => {
    if (title.trim()) {
      createMicrotask(subtaskId, title.trim());
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
                onDeleteTask={deleteTask}
                onCreateMicrotask={(title) => handleCreateMicrotask(subtask.id, title)}
              >
                <MicrotaskList
                  microtasks={microtasks}
                  isExpanded={isExpanded}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onCreateMicrotask={(title) => handleCreateMicrotask(subtask.id, title)}
                />
              </SubtaskItem>
            );
          })}
          
          <div className="border-t pt-4">
            <TaskCreator
              placeholder="Título de la subtarea..."
              buttonText="Añadir Subtarea"
              onCreateTask={onCreateSubtask}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default SubtaskList;
