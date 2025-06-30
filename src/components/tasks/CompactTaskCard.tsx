
import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import CompactSubtaskList from './CompactSubtaskList';

interface CompactTaskCardProps {
  task: Task;
  subtasks: Task[];
  project?: Project;
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
  getSubtasksForTask: (taskId: string) => Task[];
}

const CompactTaskCard = memo(({ 
  task, 
  subtasks, 
  project,
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask,
  getSubtasksForTask
}: CompactTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;
  const isCompleted = task.status === 'completed';
  const hasSubtasks = totalSubtasks > 0;
  const showProgress = totalSubtasks > 0;

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-yellow-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusDot = () => {
    const baseClass = "w-2 h-2 rounded-full";
    switch (task.status) {
      case 'completed': return `${baseClass} bg-green-500`;
      case 'in_progress': return `${baseClass} bg-blue-500`;
      case 'pending': return `${baseClass} bg-yellow-500`;
      default: return `${baseClass} bg-gray-400`;
    }
  };

  const handleToggleComplete = (checked: boolean) => {
    if (checked) {
      onCompleteTask(task);
    }
  };

  const handleToggleExpand = () => {
    if (hasSubtasks) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="space-y-0">
      <Card 
        className={`border-l-4 transition-all duration-200 ${
          isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
        }`}
        style={{ borderLeftColor: project?.color || getPriorityColor().replace('bg-', '#') }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="py-3 px-4">
          <div className="flex items-center gap-3">
            {/* Checkbox prominente */}
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggleComplete}
              className="h-4 w-4"
            />

            {/* Botón de expansión para subtareas */}
            {hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}

            {/* Contenido principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-medium text-base truncate ${
                  isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}>
                  {task.title}
                </h3>
                
                {/* Metadata compacta */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {task.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(task.due_date), 'dd/MM', { locale: es })}</span>
                    </div>
                  )}
                  {task.estimated_duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.estimated_duration}h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Indicadores de estado y progreso */}
            <div className="flex items-center gap-2">
              {/* Progreso de subtareas */}
              {showProgress && (
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {completedSubtasks}/{totalSubtasks}
                </div>
              )}

              {/* Punto de estado */}
              <div className={getStatusDot()} />

              {/* Acciones (visibles al hover) */}
              {(isHovered || isExpanded) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border">
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      Editar tarea
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onManageDependencies(task)}>
                      Dependencias
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAssignTask(task)}>
                      Asignar
                    </DropdownMenuItem>
                    {isCompleted && (
                      <DropdownMenuItem onClick={() => onArchiveTask(task.id)}>
                        Archivar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={() => onArchiveTask(task.id)}
                      className="text-red-600"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Lista expandible de subtareas */}
      {isExpanded && hasSubtasks && (
        <CompactSubtaskList
          parentTask={task}
          subtasks={subtasks}
          onCreateSubtask={onCreateSubtask}
          getSubtasksForTask={getSubtasksForTask}
        />
      )}
    </div>
  );
});

CompactTaskCard.displayName = 'CompactTaskCard';

export default CompactTaskCard;
