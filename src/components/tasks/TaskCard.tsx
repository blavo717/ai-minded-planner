import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Edit, 
  CheckCircle2, 
  Archive, 
  ArrowRight, 
  UserPlus,
  ListPlus,
  Loader2
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { TaskAssignment } from '@/hooks/useTaskAssignments';
import { TaskDependency } from '@/hooks/useTaskDependencies';
import { useTasksContext } from '@/components/tasks/providers/TasksProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onArchive?: (task: Task) => void;
  onManageDependencies?: (task: Task) => void;
  onAssign?: (task: Task) => void;
  onCreateSubtask?: (task: Task) => void;
  projects?: Project[];
  showProject?: boolean;
  isSubtask?: boolean;
}

const TaskCard = ({ 
  task, 
  onEdit, 
  onComplete, 
  onArchive, 
  onManageDependencies, 
  onAssign,
  onCreateSubtask,
  projects = [],
  showProject = true,
  isSubtask = false 
}: TaskCardProps) => {
  const { 
    setDetailTask, 
    setIsTaskDetailModalOpen 
  } = useTasksContext();

  const project = projects.find(p => p.id === task.project_id);

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
    e.preventDefault();
    e.stopPropagation();
    
    // CORRECCIÓN: Usar los estados correctos del contexto
    setDetailTask(task);
    setIsTaskDetailModalOpen(true);
  };

  return (
    <Card 
      className={`
        shadow-md hover:shadow-lg transition-shadow duration-200 
        ${isSubtask ? 'border-dashed border-gray-300' : ''}
      `}
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        {showProject && project && (
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: project.color || '#3B82F6' }} 
            />
            <p className="text-sm font-medium text-gray-600">{project.name}</p>
          </div>
        )}
        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3">{task.description || 'Sin descripción'}</p>
        <div className="flex items-center justify-between mt-4">
          <Badge className={`text-xs ${getStatusColor(task.status)}`}>
            {task.status}
          </Badge>
          {task.priority && (
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-end p-4 border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onComplete?.(task)}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive?.(task)}>
              <Archive className="h-4 w-4 mr-2" />
              Archivar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onCreateSubtask?.(task)}>
              <ListPlus className="h-4 w-4 mr-2" />
              Añadir Subtarea
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageDependencies?.(task)}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Gestionar Dependencias
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAssign?.(task)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
