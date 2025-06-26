
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskCardHelpers } from '@/hooks/useTaskCardHelpers';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import TaskHealthIndicator from './ai/TaskHealthIndicator';

interface TaskCardBadgesProps {
  task: Task;
  completedSubtasks: number;
  totalSubtasks: number;
}

const TaskCardBadges = ({ task, completedSubtasks, totalSubtasks }: TaskCardBadgesProps) => {
  const { getPriorityColor, getStatusColor } = useTaskCardHelpers();

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <Badge className={getPriorityColor(task.priority)}>
        {task.priority}
      </Badge>
      
      <Badge className={getStatusColor(task.status)}>
        {task.status}
      </Badge>

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
