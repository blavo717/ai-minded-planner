
import React, { memo, useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import MicrotaskItem from './microtasks/MicrotaskItem';
import MicrotaskCreator from './microtasks/MicrotaskCreator';
import TaskActivityLogModal from './TaskActivityLogModal';

interface CompactMicrotaskListProps {
  parentSubtask: Task;
  microtasks: Task[];
  onEditTask: (task: Task) => void;
}

const CompactMicrotaskList = memo(({ 
  parentSubtask, 
  microtasks,
  onEditTask
}: CompactMicrotaskListProps) => {
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);
  const { updateTask, deleteTask, createMicrotask } = useTaskMutations();

  const handleCreateMicrotask = (title: string) => {
    createMicrotask({ parentSubtaskId: parentSubtask.id, title });
  };

  return (
    <>
      <div className="ml-12 border-l border-gray-300 pl-4 space-y-1">
        {microtasks.length > 0 ? (
          microtasks.map((microtask) => (
            <MicrotaskItem
              key={microtask.id}
              microtask={microtask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onEdit={onEditTask}
            />
          ))
        ) : (
          <div className="py-1 px-3 text-xs text-gray-400 italic">
            No hay microtareas
          </div>
        )}

        <div className="py-0.5">
          <MicrotaskCreator onCreateMicrotask={handleCreateMicrotask} />
        </div>
      </div>

      {selectedLogTask && (
        <TaskActivityLogModal
          taskId={selectedLogTask.id}
          taskTitle={selectedLogTask.title}
          isOpen={true}
          onClose={() => setSelectedLogTask(null)}
        />
      )}
    </>
  );
});

CompactMicrotaskList.displayName = 'CompactMicrotaskList';

export default CompactMicrotaskList;
