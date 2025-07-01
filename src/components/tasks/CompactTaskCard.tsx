
import React, { memo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Calendar,
  Clock,
  Check,
  X,
  User,
  Flag,
  FolderOpen
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
import TaskLogIcon from './TaskLogIcon';
import TaskActivityLogModal from './TaskActivityLogModal';
import { useTaskMutations } from '@/hooks/useTaskMutations';

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
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const { updateTask } = useTaskMutations();

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

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
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
    setIsExpanded(!isExpanded);
  };

  const handleDoubleClickTitle = () => {
    setIsEditingTitle(true);
    setEditTitle(task.title);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      updateTask({
        id: task.id,
        title: editTitle.trim()
      });
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setIsEditingTitle(false);
  };

  return (
    <>
      <div className="space-y-0">
        <Card 
          className={`border-l-4 transition-all duration-200 group hover:shadow-md ${
            isCompleted ? 'bg-gray-50 opacity-75' : 'bg-white hover:bg-gray-50'
          }`}
          style={{ borderLeftColor: project?.color || getPriorityColor().replace('bg-', '#') }}
        >
          <div className="py-4 px-6">
            <div className="flex items-center gap-4">
              {/* Checkbox prominente */}
              <Checkbox
                checked={isCompleted}
                onCheckedChange={handleToggleComplete}
                className="h-4 w-4 flex-shrink-0"
              />

              {/* Botón de expansión */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleExpand}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              {/* Contenido principal - APROVECHA EL ANCHO COMPLETO */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-6">
                {/* Título de la tarea */}
                <div className="flex-1 min-w-0">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-7 text-base font-medium"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        onBlur={handleSaveTitle}
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveTitle}
                        className="h-7 w-7 p-0 flex-shrink-0"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="h-7 w-7 p-0 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <h3 
                      className={`font-medium text-base truncate cursor-pointer hover:text-blue-600 ${
                        isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}
                      onDoubleClick={handleDoubleClickTitle}
                      title="Doble clic para editar"
                    >
                      {task.title}
                    </h3>
                  )}
                  {task.description && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Metadata horizontal - APROVECHA EL ESPACIO EXTRA */}
                <div className="flex items-center gap-6 text-sm text-gray-500 flex-shrink-0">
                  {/* Proyecto */}
                  {project && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FolderOpen className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate max-w-32" title={project.name}>
                        {project.name}
                      </span>
                    </div>
                  )}

                  {/* Asignación */}
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">Sin asignar</span>
                  </div>

                  {/* Fecha límite */}
                  {task.due_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">
                        {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                      </span>
                    </div>
                  )}

                  {/* Duración estimada */}
                  {task.estimated_duration && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs">{task.estimated_duration}h</span>
                    </div>
                  )}

                  {/* Prioridad */}
                  <div className="flex items-center gap-1.5">
                    <Flag className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">{getPriorityLabel()}</span>
                  </div>
                </div>
              </div>

              {/* Indicadores de estado y acciones */}
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
                  onClick={() => setSelectedLogTask(task)}
                />

                {/* Punto de estado */}
                <div className={getStatusDot()} />

                {/* Menú de acciones */}
                <DropdownMenu>
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
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      Editar tarea
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateSubtask(task.id, 'Nueva subtarea')}>
                      Añadir subtarea
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
              </div>
            </div>
          </div>
        </Card>

        {/* Lista expandible de subtareas */}
        {isExpanded && (
          hasSubtasks ? (
            <CompactSubtaskList
              parentTask={task}
              subtasks={subtasks}
              onCreateSubtask={onCreateSubtask}
              onEditTask={onEditTask}
              getSubtasksForTask={getSubtasksForTask}
            />
          ) : (
            <div className="ml-12 border-l-2 border-gray-200 pl-6 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCreateSubtask(task.id, 'Nueva subtarea')}
                className="h-7 text-xs text-gray-500 hover:text-gray-700 justify-start w-full"
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                Añadir subtarea
              </Button>
            </div>
          )
        )}
      </div>

      {/* Modal de Log de Actividad */}
      {selectedLogTask && (
        <TaskActivityLogModal
          taskId={selectedLogTask.id}
          taskTitle={selectedLogTask.title}
          isOpen={true}
          onClose={() => setSelectedLogTask(null)}
        />
      )}
    </>
  );
});

CompactTaskCard.displayName = 'CompactTaskCard';

export default CompactTaskCard;
