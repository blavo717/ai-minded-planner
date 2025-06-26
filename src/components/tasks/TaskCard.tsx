
import React, { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Plus,
  MoreHorizontal,
  Settings,
  Users,
  GitBranch,
  Trash2,
  CheckCircle,
  Archive,
  FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import SubtaskList from './SubtaskList';
import TaskHealthIndicator from './ai/TaskHealthIndicator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTaskCardHelpers } from '@/hooks/useTaskCardHelpers';

interface TaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TaskCard = memo(({ 
  task, 
  subtasks, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask 
}: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteTask } = useTaskMutations();
  const { getPriorityColor, getStatusColor } = useTaskCardHelpers();

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

  const handleCreateSubtaskClick = useCallback((title: string) => {
    onCreateSubtask(task.id, title);
  }, [onCreateSubtask, task.id]);

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;
  const isCompleted = task.status === 'completed';

  return (
    <>
      <Card className={`w-full shadow-sm hover:shadow-md transition-shadow border ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-lg truncate ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
                {task.title}
                {isCompleted && <CheckCircle className="inline-block h-4 w-4 ml-2 text-green-600" />}
              </h3>
              {task.description && (
                <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}
              {task.completion_notes && (
                <div className="mt-2 p-2 bg-green-100 rounded-md border border-green-200">
                  <div className="flex items-center gap-1 mb-1">
                    <FileText className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-800">Notas de finalización:</span>
                  </div>
                  <p className="text-sm text-green-700">{task.completion_notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 ml-4">
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
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            
            <Badge className={getStatusColor(task.status)}>
              {task.status}
            </Badge>

            <TaskHealthIndicator taskId={task.id} compact />

            {task.due_date && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(task.due_date), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </Badge>
            )}

            {task.estimated_duration && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.estimated_duration}h
              </Badge>
            )}

            {totalSubtasks > 0 && (
              <Badge variant="outline">
                {completedSubtasks}/{totalSubtasks} subtareas
              </Badge>
            )}
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {totalSubtasks > 0 ? (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-between p-2 h-auto"
                >
                  <span className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Ver subtareas ({totalSubtasks})
                  </span>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2">
                <SubtaskList
                  parentTask={task}
                  subtasks={subtasks}
                  onCreateSubtask={handleCreateSubtaskClick}
                />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            !isCompleted && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleCreateSubtaskClick('Nueva subtarea')}
                className="w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Añadir subtarea
              </Button>
            )
          )}
        </CardContent>
      </Card>

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
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
