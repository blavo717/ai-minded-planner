
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
  Trash2
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
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

interface TaskMetadataProps {
  task: Task; 
  completedSubtasks: number;
  totalSubtasks: number;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

interface TaskTagsProps {
  tags: string[];
}

interface TaskSubtasksSectionProps {
  task: Task;
  subtasks: Task[];
  totalSubtasks: number;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
  onCreateSubtask: (title: string) => void;
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskTitle: string;
  onConfirm: () => void;
}

const TaskCard = memo(({ 
  task, 
  subtasks, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
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

  const handleCreateSubtaskClick = useCallback((title: string) => {
    onCreateSubtask(task.id, title);
  }, [onCreateSubtask, task.id]);

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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

          <TaskMetadata 
            task={task} 
            completedSubtasks={completedSubtasks}
            totalSubtasks={totalSubtasks}
            getPriorityColor={getPriorityColor}
            getStatusColor={getStatusColor}
          />

          {task.tags && task.tags.length > 0 && (
            <TaskTags tags={task.tags} />
          )}
        </CardHeader>

        <TaskSubtasksSection
          task={task}
          subtasks={subtasks}
          totalSubtasks={totalSubtasks}
          isOpen={isOpen}
          onToggle={setIsOpen}
          onCreateSubtask={handleCreateSubtaskClick}
        />
      </Card>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        taskTitle={task.title}
        onConfirm={handleDeleteTask}
      />
    </>
  );
});

const TaskMetadata = memo(({ task, completedSubtasks, totalSubtasks, getPriorityColor, getStatusColor }: TaskMetadataProps) => (
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
));

const TaskTags = memo(({ tags }: TaskTagsProps) => (
  <div className="flex flex-wrap gap-1 mt-2">
    {tags.map((tag, index) => (
      <Badge key={index} variant="secondary" className="text-xs">
        #{tag}
      </Badge>
    ))}
  </div>
));

const TaskSubtasksSection = memo(({ 
  task, 
  subtasks, 
  totalSubtasks, 
  isOpen, 
  onToggle, 
  onCreateSubtask 
}: TaskSubtasksSectionProps) => {
  if (totalSubtasks > 0) {
    return (
      <CardContent className="pt-0">
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between p-2"
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
              onCreateSubtask={(title) => onCreateSubtask(title)}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    );
  }

  return (
    <CardContent className="pt-0">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onCreateSubtask('Nueva subtarea')}
        className="w-full flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Añadir subtarea
      </Button>
    </CardContent>
  );
});

const DeleteConfirmDialog = memo(({ open, onOpenChange, taskTitle, onConfirm }: DeleteConfirmDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>¿Eliminar tarea?</AlertDialogTitle>
        <AlertDialogDescription>
          ¿Estás seguro de que deseas eliminar la tarea "{taskTitle}"? 
          Esta acción también eliminará todas sus subtareas y microtareas y no se puede deshacer.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirm}
          className="bg-red-600 hover:bg-red-700"
        >
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
));

TaskCard.displayName = 'TaskCard';
TaskMetadata.displayName = 'TaskMetadata';
TaskTags.displayName = 'TaskTags';
TaskSubtasksSection.displayName = 'TaskSubtasksSection';
DeleteConfirmDialog.displayName = 'DeleteConfirmDialog';

export default TaskCard;
