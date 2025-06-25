
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BarChart3, 
  Brain, 
  Settings,
  TestTube
} from 'lucide-react';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
  showAIMonitoring: boolean;
  onToggleAIMonitoring: () => void;
  showTesting?: boolean;
  onToggleTesting?: () => void;
}

const TasksHeader = ({ 
  showInsights, 
  onToggleInsights, 
  onCreateTask,
  showAIMonitoring,
  onToggleAIMonitoring,
  showTesting = false,
  onToggleTesting
}: TasksHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
        <p className="text-muted-foreground">
          Gestiona tus tareas con IA integrada
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        {onToggleTesting && (
          <Button
            variant={showTesting ? "default" : "outline"}
            size="sm"
            onClick={onToggleTesting}
            className="flex items-center gap-2"
          >
            <TestTube className="h-4 w-4" />
            Testing Fase 1
            {showTesting && <Badge variant="secondary" className="ml-1">Activo</Badge>}
          </Button>
        )}
        
        <Button
          variant={showInsights ? "default" : "outline"}
          size="sm"
          onClick={onToggleInsights}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Insights
          {showInsights && <Badge variant="secondary" className="ml-1">Activo</Badge>}
        </Button>
        
        <Button
          variant={showAIMonitoring ? "default" : "outline"}
          size="sm"
          onClick={onToggleAIMonitoring}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          AI Monitor
          {showAIMonitoring && <Badge variant="secondary" className="ml-1">Activo</Badge>}
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
