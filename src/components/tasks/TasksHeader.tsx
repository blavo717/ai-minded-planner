
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Settings2 } from 'lucide-react';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
}

const TasksHeader = ({ showInsights, onToggleInsights, onCreateTask }: TasksHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
        <p className="text-gray-600">
          Gestiona todas tus tareas en un solo lugar
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleInsights}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          {showInsights ? 'Ocultar' : 'Mostrar'} Insights
        </Button>
        <Button onClick={onCreateTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;
