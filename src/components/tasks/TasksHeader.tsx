
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, Archive, ListTodo } from 'lucide-react';
import { useTasksContext } from './providers/TasksProvider';

interface TasksHeaderProps {
  showInsights: boolean;
  onToggleInsights: () => void;
  onCreateTask: () => void;
}

const TasksHeader = ({ showInsights, onToggleInsights, onCreateTask }: TasksHeaderProps) => {
  const { showHistory, setShowHistory } = useTasksContext();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {showHistory ? 'Histórico de Tareas' : 'Gestión de Tareas'}
        </h1>
        <p className="text-muted-foreground">
          {showHistory 
            ? 'Revisa y gestiona tus tareas completadas y archivadas'
            : 'Organiza y gestiona tus tareas de manera eficiente'
          }
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={showHistory ? "default" : "outline"}
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          {showHistory ? (
            <>
              <ListTodo className="h-4 w-4" />
              Ver Tareas Activas
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              Ver Histórico
            </>
          )}
        </Button>

        {!showHistory && (
          <>
            <Button
              variant={showInsights ? "default" : "outline"}
              size="sm"
              onClick={onToggleInsights}
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              {showInsights ? 'Ocultar' : 'Mostrar'} Insights
              {showInsights && <Badge variant="secondary" className="ml-1">AI</Badge>}
            </Button>

            <Button 
              onClick={onCreateTask}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nueva Tarea
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TasksHeader;
