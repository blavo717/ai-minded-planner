
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { Task } from '@/hooks/useTasks';
import { 
  MoreHorizontal, 
  Calendar, 
  Timer, 
  Tag, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Pause
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface KanbanBoardProps {
  tasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: Task['status'];
  color: string;
  icon: React.ReactNode;
}

const columns: KanbanColumn[] = [
  {
    id: 'pending',
    title: 'Pendientes',
    status: 'pending',
    color: 'border-yellow-200 bg-yellow-50',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
  },
  {
    id: 'in_progress',
    title: 'En Progreso',
    status: 'in_progress',
    color: 'border-blue-200 bg-blue-50',
    icon: <Clock className="h-4 w-4 text-blue-600" />
  },
  {
    id: 'completed',
    title: 'Completadas',
    status: 'completed',
    color: 'border-green-200 bg-green-50',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />
  },
  {
    id: 'cancelled',
    title: 'Canceladas',
    status: 'cancelled',
    color: 'border-red-200 bg-red-50',
    icon: <Pause className="h-4 w-4 text-red-600" />
  }
];

const KanbanBoard = ({ tasks, getSubtasksForTask, onEditTask }: KanbanBoardProps) => {
  const { updateTask, deleteTask } = useTaskMutations();
  const { projects } = useProjects();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask({ 
      id: taskId, 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.color;
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      handleStatusChange(draggedTask.id, targetStatus);
    }
    setDraggedTask(null);
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const subtasks = getSubtasksForTask(task.id);
    const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;

    return (
      <Card 
        className="mb-3 cursor-move hover:shadow-md transition-shadow bg-white"
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title and priority */}
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm leading-tight flex-1 pr-2">
                {task.title}
              </h4>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditTask(task)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600"
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Metadata */}
            <div className="space-y-2">
              {/* Project */}
              {getProjectName(task.project_id) && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getProjectColor(task.project_id) || '#3B82F6' }}
                  />
                  {getProjectName(task.project_id)}
                </Badge>
              )}

              {/* Subtasks */}
              {subtasks.length > 0 && (
                <Badge variant="outline" className="text-xs w-fit">
                  {completedSubtasks}/{subtasks.length} subtareas
                </Badge>
              )}

              {/* Due date and duration */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                  </div>
                )}
                {task.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Timer className="h-3 w-3" />
                    {task.estimated_duration}m
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                      <Tag className="h-2 w-2" />
                      {tag}
                    </Badge>
                  ))}
                  {task.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{task.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter(task => task.status === column.status);
        
        return (
          <div key={column.id} className="space-y-4">
            <Card className={`${column.color} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {column.icon}
                    {column.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            <div 
              className="min-h-[400px] space-y-3"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              
              {columnTasks.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Sin tareas
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
