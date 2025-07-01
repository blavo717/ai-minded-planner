
import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskCard from './TaskCard';

interface VirtualizedTaskListProps {
  tasks: Task[];
  projects: Project[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (task: Task) => void;
  height?: number;
  itemHeight?: number;
}

interface TaskItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: Task[];
    projects: Project[];
    getSubtasksForTask: (taskId: string) => Task[];
    onEditTask: (task: Task) => void;
    onManageDependencies: (task: Task) => void;
    onAssignTask: (task: Task) => void;
    onCompleteTask: (task: Task) => void;
    onArchiveTask: (taskId: string) => void;
    onCreateSubtask: (task: Task) => void;
  };
}

const TaskItem = memo(({ index, style, data }: TaskItemProps) => {
  const task = data.tasks[index];
  const subtasks = data.getSubtasksForTask(task.id);
  const project = data.projects.find(p => p.id === task.project_id);

  return (
    <div style={style}>
      <div className="px-1 pb-4 animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
        <TaskCard
          task={task}
          projects={data.projects}
          onEdit={data.onEditTask}
          onComplete={data.onCompleteTask}
          onArchive={(task) => data.onArchiveTask(task.id)}
          onManageDependencies={data.onManageDependencies}
          onAssign={data.onAssignTask}
          onCreateSubtask={data.onCreateSubtask}
        />
      </div>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

const VirtualizedTaskList = memo(({
  tasks,
  projects,
  getSubtasksForTask,
  onEditTask,
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask,
  height = 600,
  itemHeight = 200
}: VirtualizedTaskListProps) => {
  const itemData = useMemo(() => ({
    tasks,
    projects,
    getSubtasksForTask,
    onEditTask,
    onManageDependencies,
    onAssignTask,
    onCompleteTask,
    onArchiveTask,
    onCreateSubtask,
  }), [tasks, projects, getSubtasksForTask, onEditTask, onManageDependencies, onAssignTask, onCompleteTask, onArchiveTask, onCreateSubtask]);

  if (tasks.length === 0) {
    return (
      <Card className="w-full animate-fade-in">
        <CardContent className="text-center py-12">
          <div className="text-gray-500 text-lg">No se encontraron tareas</div>
          <p className="text-gray-400 text-sm mt-2">Crea una nueva tarea para comenzar</p>
        </CardContent>
      </Card>
    );
  }

  // Solo virtualizar si hay muchas tareas (más de 20)
  if (tasks.length <= 20) {
    return (
      <div className="w-full space-y-4">
        {tasks.map((task, index) => {
          const subtasks = getSubtasksForTask(task.id);
          const project = projects.find(p => p.id === task.project_id);
          
          return (
            <div
              key={task.id}
              className="animate-fade-in hover:scale-[1.01] transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard
                task={task}
                projects={projects}
                onEdit={onEditTask}
                onComplete={onCompleteTask}
                onArchive={(task) => onArchiveTask(task.id)}
                onManageDependencies={onManageDependencies}
                onAssign={onAssignTask}
                onCreateSubtask={onCreateSubtask}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <List
        height={height}
        width="100%"
        itemCount={tasks.length}
        itemSize={itemHeight}
        itemData={itemData}
        className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
      >
        {TaskItem}
      </List>
    </div>
  );
});

VirtualizedTaskList.displayName = 'VirtualizedTaskList';

export default VirtualizedTaskList;
