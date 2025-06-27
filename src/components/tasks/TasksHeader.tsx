
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  TrendingUp, 
  Search,
  Sparkles,
  History,
  Home
} from 'lucide-react';
import SemanticSearch from '@/components/search/SemanticSearch';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTasksContext } from './providers/TasksProvider';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
  tasks?: Task[];
  projects?: Project[];
  onTaskSelect?: (task: Task) => void;
  onSearchResults?: (results: Task[]) => void;
}

const TasksHeader = ({ 
  showInsights, 
  onToggleInsights, 
  onCreateTask,
  tasks = [],
  projects = [],
  onTaskSelect,
  onSearchResults
}: TasksHeaderProps) => {
  const [showSearch, setShowSearch] = useState(false);
  const { showHistory, setShowHistory } = useTasksContext();

  return (
    <div className="space-y-4">
      {/* Main Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Tareas</h1>
          <p className="text-muted-foreground mt-1">
            Organiza y gestiona todas tus tareas de manera eficiente
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline"
            onClick={() => setShowSearch(!showSearch)}
            className="shrink-0"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Búsqueda IA
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="shrink-0"
          >
            {showHistory ? <Home className="h-4 w-4 mr-2" /> : <History className="h-4 w-4 mr-2" />}
            {showHistory ? 'Tareas' : 'Historial'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={onToggleInsights}
            className="shrink-0"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {showInsights ? 'Ocultar' : 'Mostrar'} Insights
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

      {/* Semantic Search Panel */}
      {showSearch && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Búsqueda Semántica con IA</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Beta
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(false)}
              >
                Cerrar
              </Button>
            </div>
            
            <SemanticSearch
              tasks={tasks}
              projects={projects}
              onTaskSelect={onTaskSelect}
              onSearchResults={onSearchResults}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksHeader;
