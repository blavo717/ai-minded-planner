
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Brain
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
  tasks: Task[];
  projects: Project[];
  onTaskSelect: (task: Task) => void;
  onSearchResults: (results: Task[]) => void;
}

const TasksHeader = ({
  showInsights,
  onToggleInsights,
  onCreateTask,
  tasks
}: TasksHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Tareas</h1>
        <Badge variant="secondary" className="text-xs">
          {tasks.length} total
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={showInsights ? "default" : "outline"}
          size="sm"
          onClick={onToggleInsights}
        >
          <Brain className="h-4 w-4 mr-2" />
          Insights
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
