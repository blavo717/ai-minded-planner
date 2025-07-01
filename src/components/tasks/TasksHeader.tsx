import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Brain
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTasksContext } from '@/hooks/useTasksContext';

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
  tasks,
  projects,
  onTaskSelect,
  onSearchResults
}: TasksHeaderProps) => {
  const { 
    setShowHistory,
    setIsCreateTaskOpen
  } = useTasksContext();

  const handleCreateTask = () => {
    setIsCreateTaskOpen(true);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
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

        <Button 
          onClick={handleCreateTask}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;
