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
  Activity,
  Zap,
  TrendingUp,
  Workflow
} from 'lucide-react';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
  showAIMonitoring: boolean;
  onToggleAIMonitoring: () => void;
  showTesting: boolean;
  onToggleTesting: () => void;
  showPhase2Testing: boolean;
  onTogglePhase2Testing: () => void;
  showPhase3Testing: boolean;
  onTogglePhase3Testing: () => void;
}

const TasksHeader = ({ 
  showInsights, 
  onToggleInsights, 
  onCreateTask,
  showAIMonitoring,
  onToggleAIMonitoring,
  showTesting,
  onToggleTesting,
  showPhase2Testing,
  onTogglePhase2Testing,
  showPhase3Testing,
  onTogglePhase3Testing
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
        
        <Button
          variant={showTesting ? "default" : "outline"}
          onClick={onToggleTesting}
          className="flex items-center gap-2"
        >
          <TestTube className="h-4 w-4" />
          {showTesting ? "Ocultar Fase 1" : "Testing Fase 1"}
        </Button>
        
        <Button
          variant={showPhase2Testing ? "default" : "outline"}
          onClick={onTogglePhase2Testing}
          className="flex items-center gap-2"
        >
          <Activity className="h-4 w-4" />
          {showPhase2Testing ? "Ocultar Fase 2" : "Testing Fase 2"}
        </Button>
        
        <Button
          variant={showPhase3Testing ? "default" : "outline"}
          onClick={onTogglePhase3Testing}
          className="flex items-center gap-2"
        >
          <Workflow className="h-4 w-4" />
          {showPhase3Testing ? "Ocultar Fase 3" : "Testing Integral"}
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
