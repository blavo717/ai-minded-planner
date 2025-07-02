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
  MoreHorizontal,
  Clock,
  Play,
  Pause,
  X,
  AlertTriangle,
  Flame,
  ArrowUp,
  Minus
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': 
        return {
          color: 'bg-status-completed-bg text-status-completed border-status-completed/20',
          icon: CheckCircle2,
          label: 'Completada'
        };
      case 'in_progress': 
        return {
          color: 'bg-status-in-progress-bg text-status-in-progress border-status-in-progress/20',
          icon: Play,
          label: 'En Progreso'
        };
      case 'pending': 
        return {
          color: 'bg-status-pending text-status-pending-fg border-status-pending/20',
          icon: Clock,
          label: 'Pendiente'
        };
      case 'cancelled': 
        return {
          color: 'bg-status-cancelled-bg text-status-cancelled border-status-cancelled/20',
          icon: X,
          label: 'Cancelada'
        };
      default: 
        return {
          color: 'bg-muted text-muted-foreground border-border',
          icon: Pause,
          label: status
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return {
          color: 'bg-priority-urgent text-white shadow-lg shadow-priority-urgent/30',
          icon: Flame,
          label: 'Urgente',
          glow: 'shadow-priority-urgent/50'
        };
      case 'high': 
        return {
          color: 'bg-priority-high text-white shadow-md shadow-priority-high/20',
          icon: AlertTriangle,
          label: 'Alta',
          glow: 'shadow-priority-high/30'
        };
      case 'medium': 
        return {
          color: 'bg-priority-medium text-white shadow-sm',
          icon: ArrowUp,
          label: 'Media',
          glow: ''
        };
      case 'low': 
        return {
          color: 'bg-priority-low text-white shadow-sm',
          icon: Minus,
          label: 'Baja',
          glow: ''
        };
      default: 
        return {
          color: 'bg-muted text-muted-foreground',
          icon: Minus,
          label: priority,
          glow: ''
        };
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-priority-urgent shadow-lg shadow-priority-urgent/20';
      case 'high': return 'border-l-priority-high shadow-md shadow-priority-high/10';
      case 'medium': return 'border-l-priority-medium';
      case 'low': return 'border-l-priority-low';
      default: return 'border-l-muted';
    }
  };

  // Circular progress component for subtasks
  const CircularProgress = ({ completed, total }: { completed: number; total: number }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const circumference = 2 * Math.PI * 8; // radius = 8
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 20 20">
          {/* Background circle */}
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-muted/20"
          />
          {/* Progress circle */}
          <circle
            cx="10"
            cy="10"
            r="8"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-primary transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">
            {completed}
          </span>
        </div>
      </div>
    );
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
    <div className="space-y-3">
      <Card className={`
        bg-task-card border-task-card-border border-l-4 ${getPriorityBorderColor(task.priority)}
        shadow-task-sm hover:shadow-task-md hover:bg-task-card-hover
        transition-all duration-300 ease-out
        transform hover:scale-[1.01] hover:-translate-y-0.5
        rounded-lg overflow-hidden
      `}>
        <CardContent className="p-5">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Expansion Button */}
              {hasSubtasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 flex-shrink-0 mt-0.5 rounded-full hover:bg-accent transition-colors"
                  onClick={toggleExpansion}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              )}
              
              {/* Task Content */}
              <div className="space-y-2 flex-1 min-w-0" onClick={handleCardClick}>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-base leading-tight hover:text-primary cursor-pointer truncate transition-colors">
                    {task.title}
                  </h3>
                  {hasSubtasks && (
                    <div className="flex items-center gap-2">
                      <CircularProgress 
                        completed={subtasks.filter(st => st.status === 'completed').length}
                        total={subtasks.length}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {subtasks.filter(st => st.status === 'completed').length}/{subtasks.length} subtareas
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Project Info */}
                {showProject && project && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div 
                      className="w-3 h-3 rounded-full ring-1 ring-white shadow-sm" 
                      style={{ backgroundColor: project.color }} 
                    />
                    <span className="font-medium">{project.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-accent opacity-60 hover:opacity-100 transition-all"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-task-lg border-border">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(task)} className="text-sm">
                  <Edit className="h-4 w-4 mr-3" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onComplete(task)} className="text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-3" /> Completar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCreateSubtask(task)} className="text-sm">
                  <ListChecks className="h-4 w-4 mr-3" /> Subtarea
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign(task)} className="text-sm">
                  <UserPlus className="h-4 w-4 mr-3" /> Asignar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageDependencies(task)} className="text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-3"><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg> 
                  Dependencias
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive(task)} className="text-sm text-destructive focus:text-destructive">
                  <Archive className="h-4 w-4 mr-3" /> Archivar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status and Priority Section */}
          <div className="flex items-center justify-between">
            {(() => {
              const statusConfig = getStatusConfig(task.status);
              const StatusIcon = statusConfig.icon;
              return (
                <Badge className={`
                  text-xs font-medium px-3 py-2 rounded-full border flex items-center gap-2
                  ${statusConfig.color}
                  transition-all duration-200 hover:scale-105
                `}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>
              );
            })()}
            
            {(() => {
              const priorityConfig = getPriorityConfig(task.priority);
              const PriorityIcon = priorityConfig.icon;
              return (
                <Badge className={`
                  text-xs font-medium px-3 py-2 rounded-full flex items-center gap-2
                  ${priorityConfig.color}
                  transition-all duration-200 hover:scale-105 hover:${priorityConfig.glow}
                `}>
                  <PriorityIcon className="w-3 h-3" />
                  {priorityConfig.label}
                </Badge>
              );
            })()}
          </div>

          {/* Timestamp */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium">
              {timeAgo}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Subtasks Section */}
      {isExpanded && hasSubtasks && getSubtasksForTask && (
        <div className="ml-6 animate-fade-in">
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