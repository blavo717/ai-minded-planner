
import React, { memo } from 'react';
import { Task } from '@/hooks/useTasks';
import VirtualizedTaskList from './VirtualizedTaskList';

interface TaskListProps {
  tasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TaskList = memo(({ 
  tasks, 
  getSubtasksForTask, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask 
}: TaskListProps) => {
  return (
    <VirtualizedTaskList
      tasks={tasks}
      getSubtasksForTask={getSubtasksForTask}
      onEditTask={onEditTask}
      onManageDependencies={onManageDependencies}
      onAssignTask={onAssignTask}
      onCompleteTask={onCompleteTask}
      onArchiveTask={onArchiveTask}
      onCreateSubtask={onCreateSubtask}
    />
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
