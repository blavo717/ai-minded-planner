
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import TaskLogIcon from '../TaskLogIcon';

interface CompactTaskCardActionsProps {
  task: Task;
  completedSubtasks: number;
  totalSubtasks: number;
  showProgress: boolean;
  dropdownOpen: boolean;
  onDropdownOpenChange: (open: boolean) => void;
  onLogClick: (task: Task) => void;
  onEditTask: () => void;
  onCreateSubtask: () => void;
  onManageDependencies: () => void;
  onAssignTask: () => void;
  onArchiveTask: () => void;
}

const CompactTaskCardActions = ({
  task,
  completedSubtasks,
  totalSubtasks,
  showProgress,
  dropdownOpen,
  onDropdownOpenChange,
  onLogClick,
  onEditTask,
  onCreateSubtask,
  onManageDependencies,
  onAssignTask,
  onArchiveTask
}: CompactTaskCardActionsProps) => {
  const isCompleted = task.status === 'completed';

  const getStatusDot = () => {
    const baseClass = "w-2 h-2 rounded-full";
    switch (task.status) {
      case 'completed': return `${baseClass} bg-green-500`;
      case 'in_progress': return `${baseClass} bg-blue-500`;
      case 'pending': return `${baseClass} bg-yellow-500`;
      default: return `${baseClass} bg-gray-400`;
    }
  };

  const handleActionAndClose = (action: () => void) => {
    action();
    onDropdownOpenChange(false);
  };

  const handleCreateSubtaskKeepOpen = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCreateSubtask();
  };

  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      {/* Progreso de subtareas */}
      {showProgress && (
        <Badge variant="outline" className="text-xs px-2 py-1">
          {completedSubtasks}/{totalSubtasks}
        </Badge>
      )}

      {/* Log Icon */}
      <TaskLogIcon 
        taskId={task.id} 
        className="h-4 w-4"
        onClick={() => onLogClick(task)}
      />

      {/* Punto de estado */}
      <div className={getStatusDot()} />

      {/* Menú de acciones */}
      <DropdownMenu open={dropdownOpen} onOpenChange={onDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 hover:bg-gray-100 focus:bg-gray-100"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border z-50">
          <DropdownMenuItem onClick={() => handleActionAndClose(onEditTask)}>
            Editar tarea
          </DropdownMenuItem>
          <DropdownMenuItem 
            onPointerDown={handleCreateSubtaskKeepOpen}
            onSelect={(e) => e.preventDefault()}
          >
            Añadir subtarea
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleActionAndClose(onManageDependencies)}>
            Dependencias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleActionAndClose(onAssignTask)}>
            Asignar
          </DropdownMenuItem>
          {isCompleted && (
            <DropdownMenuItem onClick={() => handleActionAndClose(onArchiveTask)}>
              Archivar
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            onClick={() => handleActionAndClose(onArchiveTask)}
            className="text-red-600"
          >
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default CompactTaskCardActions;
