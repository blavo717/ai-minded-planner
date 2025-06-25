
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
      {/* Sección de microtareas con fondo blanco profesional */}
      <div className="ml-6 pl-4 border-l-2 border-gray-200 space-y-3">
        {/* Header de Microtareas - SOLO el letrero con color */}
        <div className="bg-purple-100 rounded-lg px-3 py-2 border border-purple-200 inline-block">
          <h5 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Microtareas
          </h5>
        </div>

        {/* Lista de microtareas existentes con fondo blanco */}
        {microtasks.length > 0 && (
          <div className="space-y-2">
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

        {/* Botón para añadir microtarea con fondo blanco */}
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
