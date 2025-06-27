
import React, { memo } from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import VirtualizedTaskList from './VirtualizedTaskList';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
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
  projects,
  getSubtasksForTask, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask 
}: TaskListProps) => {
  return (
    <div className="animate-fade-in transition-all duration-300">
      <VirtualizedTaskList
        tasks={tasks}
        projects={projects}
        getSubtasksForTask={getSubtasksForTask}
        onEditTask={onEditTask}
        onManageDependencies={onManageDependencies}
        onAssignTask={onAssignTask}
        onCompleteTask={onCompleteTask}
        onArchiveTask={onArchiveTask}
        onCreateSubtask={onCreateSubtask}
      />
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;
