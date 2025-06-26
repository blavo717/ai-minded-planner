
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({
  showInsights,
  onToggleInsights,
  onCreateTask,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Tareas</h1>
        <p className="text-gray-600 mt-1">
          Organiza y supervisa tus tareas con inteligencia artificial
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <Button
          variant={showInsights ? "default" : "outline"}
          onClick={onToggleInsights}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          {showInsights ? 'Ocultar Insights' : 'Mostrar Insights'}
        </Button>
        
        <Button 
          onClick={onCreateTask}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;
