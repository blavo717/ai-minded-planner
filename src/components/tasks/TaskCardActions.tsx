
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
import { toast } from '@/hooks/use-toast';

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
  const { deleteTask, isDeletingTask } = useTaskMutations();

  const handleDeleteTask = useCallback(async () => {
    try {
      console.log('Iniciando eliminación de tarea:', task.id, task.title);
      
      await deleteTask(task.id);
      
      console.log('Tarea eliminada exitosamente:', task.id);
      setShowDeleteDialog(false);
      
      toast({
        title: "Tarea eliminada",
        description: `La tarea "${task.title}" se ha eliminado correctamente junto con todas sus subtareas.`,
      });
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      toast({
        title: "Error al eliminar tarea",
        description: "No se pudo eliminar la tarea. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }, [deleteTask, task.id, task.title]);

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
            disabled={isDeletingTask}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeletingTask ? 'Eliminando...' : 'Eliminar tarea'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la tarea "{task.title}"? 
              {task.task_level === 1 && (
                <span className="block mt-2 font-medium text-red-600">
                  Esta acción también eliminará todas sus subtareas y microtareas de forma permanente.
                </span>
              )}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingTask}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask}
              disabled={isDeletingTask}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingTask ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskCardActions;
