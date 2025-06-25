
import React, { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import MicrotaskItem from './MicrotaskItem';
import TaskCreator from './TaskCreator';
import TaskCreatorModal from './TaskCreatorModal';

interface MicrotaskListProps {
  microtasks: Task[];
  isExpanded: boolean;
  onUpdateTask: (data: any) => void;
  onDeleteTask: (id: string) => void;
  onCreateMicrotask: (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => void;
}

const MicrotaskList = ({ 
  microtasks, 
  isExpanded, 
  onUpdateTask, 
  onDeleteTask, 
  onCreateMicrotask 
}: MicrotaskListProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (!isExpanded) return null;

  const handleCreateMicrotask = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    onCreateMicrotask(data);
    setIsCreateModalOpen(false);
  };

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

      {/* Siempre mostrar el botón de añadir microtarea cuando la subtarea está expandida */}
      <div className="ml-6 pl-4 border-l-2 border-gray-200">
        <TaskCreator
          placeholder="Título de la microtarea..."
          buttonText="Añadir Microtarea"
          onCreateTask={() => setIsCreateModalOpen(true)}
          size="sm"
        />
      </div>

      <TaskCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateMicrotask}
        isCreating={false}
        taskLevel="microtarea"
      />
    </div>
  );
};

export default MicrotaskList;
