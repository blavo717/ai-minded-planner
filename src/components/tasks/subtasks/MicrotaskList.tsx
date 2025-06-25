
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

  const handleCreateMicrotask = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    onCreateMicrotask(data);
    setIsCreateModalOpen(false);
  };

  // Si la subtarea no está expandida, no mostrar nada
  if (!isExpanded) return null;

  return (
    <div className="space-y-3">
      {/* Lista de microtareas existentes */}
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

      {/* Botón para añadir microtarea - SIEMPRE visible cuando la subtarea está expandida */}
      <div className="ml-6 pl-4 border-l-2 border-gray-200">
        <div className="bg-gray-50 rounded-lg p-2 border border-dashed border-gray-300">
          <TaskCreator
            placeholder="Añadir microtarea..."
            buttonText="+ Añadir Microtarea"
            onCreateTask={() => setIsCreateModalOpen(true)}
            size="sm"
          />
        </div>
      </div>

      {/* Modal para crear microtarea */}
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
