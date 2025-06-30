
import React, { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  Timer, 
  Tag,
  ChevronDown,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import KanbanSubtaskExpander from './KanbanSubtaskExpander';

interface KanbanTaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
}

const KanbanTaskCard = memo(({ 
  task,
  subtasks,
  onEditTask,
  onDeleteTask,
  onDragStart,
  getProjectName,
  getProjectColor,
  getPriorityColor
}: KanbanTaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCreateSubtask, setShowCreateSubtask] = useState(false);
  
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
  const hasSubtasks = subtasks.length > 0;

  const handleToggleExpansion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCreateSubtask = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCreateSubtask(true);
  };

  return (
    <Card 
      className="mb-3 cursor-move hover:shadow-md transition-shadow bg-white"
      draggable
      onDragStart={(e) => onDragStart(e, task)}
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
                    onClick={() => onDeleteTask(task.id)}
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

            {/* Subtasks summary */}
            {hasSubtasks && (
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs w-fit">
                  {completedSubtasks}/{subtasks.length} subtareas
                </Badge>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={handleCreateSubtask}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={handleToggleExpansion}
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-3 w-3" /> : 
                      <ChevronRight className="h-3 w-3" />
                    }
                  </Button>
                </div>
              </div>
            )}

            {!hasSubtasks && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-fit p-1 text-xs"
                onClick={handleCreateSubtask}
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar subtarea
              </Button>
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

          {/* Expandable subtasks section */}
          {(isExpanded || showCreateSubtask) && (
            <KanbanSubtaskExpander
              parentTask={task}
              subtasks={subtasks}
              isExpanded={isExpanded}
              showCreateForm={showCreateSubtask}
              onCloseCreateForm={() => setShowCreateSubtask(false)}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
});

KanbanTaskCard.displayName = 'KanbanTaskCard';

export default KanbanTaskCard;
