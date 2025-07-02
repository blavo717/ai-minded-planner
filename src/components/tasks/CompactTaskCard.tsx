import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Archive, 
  Edit, 
  ListChecks, 
  UserPlus, 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal 
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTasksContext } from '@/components/tasks/providers/TasksProvider';
import CompactSubtaskList from './CompactSubtaskList';

interface CompactTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onComplete: (task: Task) => void;
  onArchive: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssign: (task: Task) => void;
  onCreateSubtask: (task: Task) => void;
  projects?: Project[];
  showProject?: boolean;
  // Nuevas props para funcionalidad de subtareas
  getSubtasksForTask?: (taskId: string) => Task[];
  onCreateSubtaskInline?: (parentTaskId: string, title: string) => void;
}

const CompactTaskCard = ({ 
  task, 
  onEdit, 
  onComplete, 
  onArchive, 
  onManageDependencies, 
  onAssign,
  onCreateSubtask,
  projects = [],
  showProject = true,
  getSubtasksForTask,
  onCreateSubtaskInline 
}: CompactTaskCardProps) => {
  const { 
    setDetailTask, 
    setIsTaskDetailModalOpen 
  } = useTasksContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const project = projects.find(p => p.id === task.project_id);
  
  // Obtener subtareas si la función está disponible
  const subtasks = getSubtasksForTask ? getSubtasksForTask(task.id).filter(t => t.task_level === 2) : [];
  const hasSubtasks = subtasks.length > 0;

  const timeAgo = task.created_at
    ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true, locale: es })
    : 'hace un momento';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Evitar abrir modal si se hace click en el botón de expansión
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setDetailTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="space-y-2">
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1">
              {/* Botón de expansión para subtareas */}
              {hasSubtasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
                  onClick={toggleExpansion}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              <div className="space-y-1 flex-1 min-w-0" onClick={handleCardClick}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm hover:underline cursor-pointer truncate">
                    {task.title}
                  </h3>
                  {hasSubtasks && (
                    <Badge variant="outline" className="text-xs">
                      {subtasks.filter(st => st.status === 'completed').length}/{subtasks.length}
                    </Badge>
                  )}
                </div>
                {showProject && project && (
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span 
                      className="inline-block w-2 h-2 rounded-full" 
                      style={{ backgroundColor: project.color }} 
                    />
                    {project.name}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onComplete(task)}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Completar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateSubtask(task)}>
                  <ListChecks className="h-4 w-4 mr-2" /> Subtarea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign(task)}>
                  <UserPlus className="h-4 w-4 mr-2" /> Asignar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageDependencies(task)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-git-branch w-4 h-4 mr-2"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg> Dependencias
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive(task)}>
                  <Archive className="h-4 w-4 mr-2" /> Archivar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between mt-2">
            <Badge className={`mr-1 text-xs ${getStatusColor(task.status)}`}>
              {task.status}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {timeAgo}
          </p>
        </CardContent>
      </Card>

      {/* Lista de subtareas expandible */}
      {isExpanded && hasSubtasks && getSubtasksForTask && (
        <div className="ml-4">
          <CompactSubtaskList
            parentTask={task}
            subtasks={subtasks}
            onCreateSubtask={onCreateSubtaskInline || (() => {})}
            onEditTask={onEdit}
            getSubtasksForTask={getSubtasksForTask}
          />
        </div>
      )}
    </div>
  );
};

export default CompactTaskCard;