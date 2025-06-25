
import React from 'react';
import { Task } from '@/hooks/useTasks';
import MicrotaskItem from './MicrotaskItem';
import TaskCreator from './TaskCreator';

interface MicrotaskListProps {
  microtasks: Task[];
  isExpanded: boolean;
  onUpdateTask: (data: any) => void;
  onDeleteTask: (id: string) => void;
  onCreateMicrotask: (title: string) => void;
}

const MicrotaskList = ({ 
  microtasks, 
  isExpanded, 
  onUpdateTask, 
  onDeleteTask, 
  onCreateMicrotask 
}: MicrotaskListProps) => {
  if (!isExpanded) return null;

  return (
    <div className="space-y-3">
      {microtasks.length > 0 && (
        <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Microtareas</h5>
          {microtasks.map((microtask) => (
            <MicrotaskItem
              key={microtask.id}
              microtask={microtask}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      )}

      <div className="ml-6 pl-4 border-l-2 border-gray-200">
        <TaskCreator
          placeholder="Título de la microtarea..."
          buttonText="Añadir Microtarea"
          onCreateTask={onCreateMicrotask}
          size="sm"
        />
      </div>
    </div>
  );
};

export default MicrotaskList;
