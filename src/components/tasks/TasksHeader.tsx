import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BarChart3, 
  Brain, 
  Settings,
  TestTube,
  Lightbulb,
  Activity
} from 'lucide-react';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
  showAIMonitoring: boolean;
  onToggleAIMonitoring: () => void;
  showTesting: boolean;
  onToggleTesting: () => void;
  showPhase2Testing?: boolean;
  onTogglePhase2Testing?: () => void;
}

const TasksHeader = ({ 
  showInsights, 
  onToggleInsights, 
  onCreateTask,
  showAIMonitoring,
  onToggleAIMonitoring,
  showTesting,
  onToggleTesting,
  showPhase2Testing = false,
  onTogglePhase2Testing
}: TasksHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold">Tareas</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tus tareas con inteligencia artificial
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCreateTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Tarea
        </Button>
        
        <Button 
          variant={showInsights ? "default" : "outline"}
          onClick={onToggleInsights}
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          {showInsights ? "Ocultar Insights" : "Ver Insights"}
        </Button>
        
        <Button 
          variant={showAIMonitoring ? "default" : "outline"}
          onClick={onToggleAIMonitoring}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          {showAIMonitoring ? "Ocultar Monitoreo" : "Monitoreo AI"}
        </Button>
        
        <Button 
          variant={showTesting ? "default" : "outline"}
          onClick={onToggleTesting}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          {showTesting ? "Ocultar Tests" : "Phase 1 Tests"}
        </Button>

        {onTogglePhase2Testing && (
          <Button 
            variant={showPhase2Testing ? "default" : "outline"}
            onClick={onTogglePhase2Testing}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {showPhase2Testing ? "Ocultar Phase 2" : "Phase 2 Tests"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TasksHeader;
