
import React, { memo, useCallback } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskCardActions from './TaskCardActions';
import TaskCardBadges from './TaskCardBadges';
import TaskCardHeader from './TaskCardHeader';
import TaskCardContent from './TaskCardContent';

interface TaskCardProps {
  task: Task;
  subtasks: Task[];
  project?: Project;
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
  project,
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

  // Log para debugging
  console.log('TaskCard rendered for task:', {
    id: task.id,
    title: task.title,
    status: task.status,
    task_level: task.task_level,
    subtasks: totalSubtasks
  });

  return (
    <Card className={`w-full shadow-sm hover:shadow-md transition-all duration-200 border animate-scale-in hover:scale-[1.02] ${
      isCompleted ? 'border-green-200 bg-green-50' : project ? 'border' : 'border-gray-200'
    }`} style={project && !isCompleted ? { borderLeftColor: project.color, borderLeftWidth: '4px' } : undefined}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <TaskCardHeader task={task} isCompleted={isCompleted} />
          </div>
          
          <div className="flex-shrink-0 self-start">
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

        <div className="animate-slide-in">
          <TaskCardBadges
            task={task}
            completedSubtasks={completedSubtasks}
            totalSubtasks={totalSubtasks}
            project={project}
          />
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2 animate-fade-in">
            {task.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs transition-all duration-200 hover:scale-105"
              >
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
