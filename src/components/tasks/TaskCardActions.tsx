
import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  MoreHorizontal,
  Settings,
  Users,
  GitBranch,
  Trash2,
  CheckCircle,
  Archive
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface TaskCardActionsProps {
  task: Task;
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
}

const TaskCardActions = ({ 
  task, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask 
}: TaskCardActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteTask } = useTaskMutations();

  const handleDeleteTask = useCallback(() => {
    deleteTask(task.id);
    setShowDeleteDialog(false);
  }, [deleteTask, task.id]);

  const handleEditClick = useCallback(() => {
    onEditTask(task);
  }, [onEditTask, task]);

  const handleDependenciesClick = useCallback(() => {
    onManageDependencies(task);
  }, [onManageDependencies, task]);

  const handleAssignClick = useCallback(() => {
    onAssignTask(task);
  }, [onAssignTask, task]);

  const handleCompleteClick = useCallback(() => {
    onCompleteTask(task);
  }, [onCompleteTask, task]);

  const handleArchiveClick = useCallback(() => {
    onArchiveTask(task.id);
  }, [onArchiveTask, task.id]);

  const isCompleted = task.status === 'completed';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isCompleted && (
            <>
              <DropdownMenuItem onClick={handleCompleteClick}>
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                Completar tarea
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={handleEditClick}>
            <Settings className="h-4 w-4 mr-2" />
            Editar tarea
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDependenciesClick}>
            <GitBranch className="h-4 w-4 mr-2" />
            Dependencias
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleAssignClick}>
            <Users className="h-4 w-4 mr-2" />
            Asignar
          </DropdownMenuItem>
          {isCompleted && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleArchiveClick}>
                <Archive className="h-4 w-4 mr-2" />
                Archivar
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar tarea
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la tarea "{task.title}"? 
              Esta acción también eliminará todas sus subtareas y microtareas y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCardActions;
