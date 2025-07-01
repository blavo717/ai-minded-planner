
import React, { useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronDown, 
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTasksContext } from '@/components/tasks/providers/TasksProvider';

interface TreeTaskViewProps {
  tasks: Task[];
  projects: Project[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (task: Task) => void;
}

const TreeTaskView = ({
  tasks,
  projects,
  getSubtasksForTask,
  onEditTask,
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask,
}: TreeTaskViewProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const { setDetailTask, setIsTaskDetailModalOpen } = useTasksContext();

  // Filtrar solo tareas principales (task_level === 1)
  const mainTasks = tasks.filter(task => task.task_level === 1);

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-gray-800';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-300 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTaskClick = (task: Task) => {
    setDetailTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const renderTask = (task: Task, level: number = 0) => {
    const subtasks = getSubtasksForTask(task.id);
    const isExpanded = expandedTasks.has(task.id);
    const project = projects.find(p => p.id === task.project_id);
    const hasSubtasks = subtasks.length > 0;

    return (
      <div key={task.id} className="space-y-2">
        <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-3">
            <div className="flex items-center gap-2" style={{ marginLeft: `${level * 20}px` }}>
              {/* Botón de expansión */}
              {hasSubtasks ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => toggleExpanded(task.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6 h-6 flex-shrink-0" />
              )}

              {/* Línea conectora visual */}
              {level > 0 && (
                <div className="w-2 h-2 border-l-2 border-b-2 border-gray-300 flex-shrink-0" />
              )}

              {/* Icono de estado */}
              {getStatusIcon(task.status)}

              {/* Contenido de la tarea */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-medium text-sm hover:underline cursor-pointer truncate"
                      onClick={() => handleTaskClick(task)}
                    >
                      {task.title}
                    </h3>
                    {project && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <span 
                          className="inline-block w-2 h-2 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: project.color }} 
                        />
                        {project.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {task.needs_followup && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                        <Flag className="h-2 w-2 mr-1" />
                        Seguimiento
                      </Badge>
                    )}
                    
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </Badge>
                    
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>

                    {hasSubtasks && (
                      <Badge variant="outline" className="text-xs">
                        {subtasks.filter(st => st.status === 'completed').length}/{subtasks.length}
                      </Badge>
                    )}

                    {/* Menú de acciones */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCompleteTask(task)}>
                          Completar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCreateSubtask(task)}>
                          Crear Subtarea
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAssignTask(task)}>
                          Asignar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onManageDependencies(task)}>
                          Dependencias
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArchiveTask(task.id)}>
                          Archivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Renderizar subtareas si está expandida */}
        {isExpanded && hasSubtasks && (
          <div className="space-y-2">
            {subtasks.map(subtask => renderTask(subtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (mainTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay tareas para mostrar</p>
        <p className="text-sm mt-1">Crea tu primera tarea para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {mainTasks.map(task => renderTask(task))}
    </div>
  );
};

export default TreeTaskView;
