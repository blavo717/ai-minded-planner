
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from '@/hooks/useTasks';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TaskList = ({ 
  tasks, 
  getSubtasksForTask, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCreateSubtask 
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No se encontraron tareas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const subtasks = getSubtasksForTask(task.id);
        
        return (
          <TaskCard
            key={task.id}
            task={task}
            subtasks={subtasks}
            onEditTask={onEditTask}
            onManageDependencies={onManageDependencies}
            onAssignTask={onAssignTask}
            onCreateSubtask={onCreateSubtask}
          />
        );
      })}
    </div>
  );
};

export default TaskList;
