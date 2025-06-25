
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  TrendingUp,
  Brain
} from 'lucide-react';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
  showAIMonitoring: boolean;
  onToggleAIMonitoring: () => void;
}

const TasksHeader = ({ 
  showInsights, 
  onToggleInsights, 
  onCreateTask,
  showAIMonitoring,
  onToggleAIMonitoring
}: TasksHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Tareas</h1>
        <p className="text-muted-foreground">
          Gestiona tus tareas y proyectos de manera eficiente
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant={showInsights ? "default" : "outline"}
          onClick={onToggleInsights}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          {showInsights ? "Ocultar Insights" : "Ver Insights"}
        </Button>
        
        <Button
          variant={showAIMonitoring ? "default" : "outline"}
          onClick={onToggleAIMonitoring}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {showAIMonitoring ? "Ocultar AI" : "Monitoreo AI"}
        </Button>
        
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;
