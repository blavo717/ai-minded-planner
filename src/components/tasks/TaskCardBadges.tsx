
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Folder } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTaskCardHelpers } from '@/hooks/useTaskCardHelpers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import TaskHealthIndicator from './ai/TaskHealthIndicator';

interface TaskCardBadgesProps {
  task: Task;
  completedSubtasks: number;
  totalSubtasks: number;
  project?: Project;
}

const TaskCardBadges = ({ task, completedSubtasks, totalSubtasks, project }: TaskCardBadgesProps) => {
  const { getPriorityColor, getStatusColor } = useTaskCardHelpers();

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <Badge className={getPriorityColor(task.priority)}>
        {task.priority}
      </Badge>
      
      <Badge className={getStatusColor(task.status)}>
        {task.status}
      </Badge>

      {project ? (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1"
          style={{ borderColor: project.color, color: project.color }}
        >
          <Folder className="h-3 w-3" />
          {project.name}
        </Badge>
      ) : (
        <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
          <Folder className="h-3 w-3" />
          Sin proyecto
        </Badge>
      )}

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
  );
};

export default TaskCardBadges;
