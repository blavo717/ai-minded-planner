
import React, { useState } from 'react';
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
  GitBranch
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import SubtaskList from './subtasks/SubtaskList';
import TaskHealthIndicator from './ai/TaskHealthIndicator';

interface TaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TaskCard = ({ 
  task, 
  subtasks, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCreateSubtask 
}: TaskCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;

  return (
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
              <DropdownMenuItem onClick={() => onEditTask(task)}>
                <Settings className="h-4 w-4 mr-2" />
                Editar tarea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageDependencies(task)}>
                <GitBranch className="h-4 w-4 mr-2" />
                Dependencias
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignTask(task)}>
                <Users className="h-4 w-4 mr-2" />
                Asignar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>

          {/* Indicador de salud AI */}
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

      {totalSubtasks > 0 && (
        <CardContent className="pt-0">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
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
                subtasks={subtasks}
                onEditSubtask={onEditTask}
                onCreateSubtask={(title) => onCreateSubtask(task.id, title)}
              />
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}

      {totalSubtasks === 0 && (
        <CardContent className="pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onCreateSubtask(task.id, 'Nueva subtarea')}
            className="w-full flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir subtarea
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default TaskCard;
