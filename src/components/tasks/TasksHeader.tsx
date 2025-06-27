
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Brain, 
  History, 
  X,
  Filter
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
  tasks,
  projects,
  onTaskSelect,
  onSearchResults
}: TasksHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Task[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      onSearchResults([]);
      return;
    }

    // Búsqueda simple por texto
    const results = tasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(query.toLowerCase());
      const descriptionMatch = task.description?.toLowerCase().includes(query.toLowerCase());
      const priorityMatch = query.toLowerCase().includes('urgent') && (task.priority === 'urgent' || task.priority === 'high');
      const statusMatch = query.toLowerCase().includes('progress') && task.status === 'in_progress';
      
      return titleMatch || descriptionMatch || priorityMatch || statusMatch;
    });

    setSearchResults(results);
    setShowSearchResults(true);
    onSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    onSearchResults([]);
  };

  return (
    <div className="flex flex-col gap-4">
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

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 hover:bg-muted rounded cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      onTaskSelect(task);
                      setShowSearchResults(false);
                    }}
                  >
                    <div className="font-medium text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {task.description.substring(0, 100)}...
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No se encontraron tareas
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksHeader;
