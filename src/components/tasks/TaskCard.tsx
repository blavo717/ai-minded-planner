
import React, { memo, useCallback } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';
import TaskCardActions from './TaskCardActions';
import TaskCardBadges from './TaskCardBadges';
import TaskCardHeader from './TaskCardHeader';
import TaskCardContent from './TaskCardContent';

interface TaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TaskCard = memo(({ 
  task, 
  subtasks, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask 
}: TaskCardProps) => {
  const handleCreateSubtaskClick = useCallback((title: string) => {
    onCreateSubtask(task.id, title);
  }, [onCreateSubtask, task.id]);

  const completedSubtasks = subtasks.filter(st => st.status === 'completed').length;
  const totalSubtasks = subtasks.length;
  const isCompleted = task.status === 'completed';

  return (
    <Card className={`w-full shadow-sm hover:shadow-md transition-shadow border ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <TaskCardHeader task={task} isCompleted={isCompleted} />
          
          <div className="flex-shrink-0 ml-4">
            <TaskCardActions
              task={task}
              onEditTask={onEditTask}
              onManageDependencies={onManageDependencies}
              onAssignTask={onAssignTask}
              onCompleteTask={onCompleteTask}
              onArchiveTask={onArchiveTask}
            />
          </div>
        </div>

        <TaskCardBadges
          task={task}
          completedSubtasks={completedSubtasks}
          totalSubtasks={totalSubtasks}
        />

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

      <TaskCardContent
        task={task}
        subtasks={subtasks}
        totalSubtasks={totalSubtasks}
        isCompleted={isCompleted}
        onCreateSubtask={handleCreateSubtaskClick}
      />
    </Card>
  );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
