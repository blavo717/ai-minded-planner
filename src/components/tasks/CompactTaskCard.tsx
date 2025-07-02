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
  Minus,
  GripVertical
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
import { TaskCardSkeleton } from '@/components/ui/skeleton-loader';

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
  // Props para interacciones mejoradas
  isLoading?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
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
  onCreateSubtaskInline,
  isLoading = false,
  isDragging = false,
  onDragStart,
  onDragEnd
}: CompactTaskCardProps) => {
  const { 
    setDetailTask, 
    setIsTaskDetailModalOpen 
  } = useTasksContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

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
          color: 'bg-status-completed-bg text-status-completed border-status-completed/30 shadow-glow-completed',
          icon: CheckCircle2,
          label: 'Completada',
          glow: 'shadow-glow-completed'
        };
      case 'in_progress': 
        return {
          color: 'bg-status-in-progress-bg text-status-in-progress border-status-in-progress/30 shadow-glow-progress',
          icon: Play,
          label: 'En Progreso',
          glow: 'shadow-glow-progress'
        };
      case 'pending': 
        return {
          color: 'bg-status-pending-bg text-status-pending-fg border-status-pending/30',
          icon: Clock,
          label: 'Pendiente',
          glow: ''
        };
      case 'cancelled': 
        return {
          color: 'bg-status-cancelled-bg text-status-cancelled border-status-cancelled/30',
          icon: X,
          label: 'Cancelada',
          glow: ''
        };
      default: 
        return {
          color: 'bg-muted text-muted-foreground border-border',
          icon: Pause,
          label: status,
          glow: ''
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': 
        return {
          color: 'bg-priority-urgent text-white',
          gradient: 'bg-gradient-to-br from-priority-urgent to-red-600',
          icon: Flame,
          label: 'Urgente',
          glow: 'shadow-lg shadow-priority-urgent/40 hover:shadow-xl hover:shadow-priority-urgent/50'
        };
      case 'high': 
        return {
          color: 'bg-priority-high text-white',
          gradient: 'bg-gradient-to-br from-priority-high to-orange-600',
          icon: AlertTriangle,
          label: 'Alta',
          glow: 'shadow-md shadow-priority-high/30 hover:shadow-lg hover:shadow-priority-high/40'
        };
      case 'medium': 
        return {
          color: 'bg-priority-medium text-white',
          gradient: 'bg-gradient-to-br from-priority-medium to-yellow-600',
          icon: ArrowUp,
          label: 'Media',
          glow: 'shadow-sm hover:shadow-md hover:shadow-priority-medium/20'
        };
      case 'low': 
        return {
          color: 'bg-priority-low text-white',
          gradient: 'bg-gradient-to-br from-priority-low to-green-600',
          icon: Minus,
          label: 'Baja',
          glow: 'shadow-sm hover:shadow-md hover:shadow-priority-low/20'
        };
      default: 
        return {
          color: 'bg-muted text-muted-foreground',
          gradient: 'bg-muted',
          icon: Minus,
          label: priority,
          glow: ''
        };
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-priority-urgent shadow-lg shadow-priority-urgent/20 bg-gradient-subtle';
      case 'high': return 'border-l-priority-high shadow-md shadow-priority-high/10 bg-gradient-subtle';
      case 'medium': return 'border-l-priority-medium bg-gradient-subtle';
      case 'low': return 'border-l-priority-low bg-gradient-subtle';
      default: return 'border-l-muted bg-gradient-card';
    }
  };

  // Enhanced project color integration
  const getProjectColorStyles = (projectColor?: string) => {
    if (!projectColor) return {};
    return {
      '--project-color': projectColor,
      '--project-color-light': `${projectColor}20`,
      '--project-color-ring': `${projectColor}40`
    } as React.CSSProperties;
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

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, task);
    }
  };

  const handleCompleteTask = async () => {
    setIsCompleting(true);
    try {
      await onComplete(task);
      // Add a small delay to show the completion animation
      setTimeout(() => setIsCompleting(false), 600);
    } catch (error) {
      setIsCompleting(false);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(e as any);
    }
    if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCompleteTask();
    }
    if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onEdit(task);
    }
  };

  // Show skeleton if loading
  if (isLoading) {
    return <TaskCardSkeleton />;
  }

  return (
    <div className="space-y-3">
      <Card 
        className={`
          bg-task-card border-task-card-border border-l-4 ${getPriorityBorderColor(task.priority)}
          shadow-task-sm hover:shadow-task-lg hover:bg-task-card-hover
          transition-all duration-300 ease-out
          transform hover:scale-[1.02] hover:-translate-y-1
          rounded-lg overflow-hidden cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
          ${isDragging ? 'rotate-2 scale-105 shadow-task-xl z-50' : ''}
          ${task.priority === 'urgent' ? 'animate-pulse-glow' : ''}
          ${task.status === 'completed' ? 'shadow-glow-completed opacity-80' : ''}
          ${isCompleting ? 'animate-scale-in shadow-glow-completed' : ''}
        `}
        style={getProjectColorStyles(project?.color)}
        draggable={!!onDragStart}
        onDragStart={handleDragStart}
        onDragEnd={onDragEnd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Tarea: ${task.title}. Prioridad: ${task.priority}. Estado: ${task.status}. Presiona Enter para ver detalles, Ctrl+C para completar, Ctrl+E para editar.`}
        aria-describedby={`task-${task.id}-details`}
      >
        <CardContent className="p-5 relative">
          {/* Drag Handle - visible on hover */}
          {onDragStart && (
            <div className={`
              absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-60 
              transition-opacity duration-200 cursor-grab active:cursor-grabbing
              ${isHovered ? 'animate-bounce-subtle' : ''}
            `}>
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          
          {/* Header Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Expansion Button */}
              {hasSubtasks && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`
                    h-7 w-7 p-0 flex-shrink-0 mt-0.5 rounded-full 
                    hover:bg-accent transition-all duration-200
                    ${isExpanded ? 'bg-accent/50 rotate-0' : 'hover:rotate-12'}
                  `}
                  onClick={toggleExpansion}
                >
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </Button>
              )}
              
              {/* Task Content */}
              <div className="space-y-2 flex-1 min-w-0" onClick={handleCardClick}>
                <div className="flex items-center gap-3">
                  <h3 className={`
                    font-semibold text-base leading-tight cursor-pointer truncate 
                    transition-all duration-200 hover:text-primary
                    ${isHovered ? 'transform translate-x-1' : ''}
                  `}>
                    {task.title}
                  </h3>
                  {hasSubtasks && (
                    <div className={`
                      flex items-center gap-2 transition-all duration-300
                      ${isHovered ? 'scale-110' : ''}
                    `}>
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
                      className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm relative overflow-hidden" 
                      style={{ backgroundColor: project.color }}
                    >
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{ background: `radial-gradient(circle at center, ${project.color}, transparent)` }}
                      />
                    </div>
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
                  className={`
                    h-8 w-8 p-0 rounded-full transition-all duration-200
                    hover:bg-accent opacity-0 group-hover:opacity-100
                    ${isDropdownOpen ? 'opacity-100 scale-110 bg-accent' : ''}
                    ${isHovered ? 'animate-bounce-subtle' : ''}
                  `}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 shadow-task-lg border-border">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Acciones</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(task)} className="text-sm">
                  <Edit className="h-4 w-4 mr-3" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCompleteTask} className="text-sm" disabled={isCompleting}>
                  <CheckCircle2 className={`h-4 w-4 mr-3 ${isCompleting ? 'animate-spin' : ''}`} /> 
                  {isCompleting ? 'Completando...' : 'Completar'}
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
                  transition-all duration-300 hover:scale-105 ${statusConfig.glow}
                  backdrop-blur-sm
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
                  ${priorityConfig.gradient} ${priorityConfig.glow}
                  transition-all duration-300 hover:scale-105
                  backdrop-blur-sm border-0
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

      {/* Subtasks Section - with smooth animation */}
      {hasSubtasks && getSubtasksForTask && (
        <div className={`
          overflow-hidden transition-all duration-500 ease-out
          ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="ml-6 animate-fade-in">
            <CompactSubtaskList
              parentTask={task}
              subtasks={subtasks}
              onCreateSubtask={onCreateSubtaskInline || (() => {})}
              onEditTask={onEdit}
              getSubtasksForTask={getSubtasksForTask}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactTaskCard;