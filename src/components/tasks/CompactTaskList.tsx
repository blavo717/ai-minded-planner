
import React, { memo } from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import CompactTaskCard from './CompactTaskCard';

interface CompactTaskListProps {
  tasks: Task[];
  projects: Project[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (task: Task) => void;
}

const CompactTaskList = memo(({ 
  tasks, 
  projects,
  getSubtasksForTask, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask 
}: CompactTaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No hay tareas para mostrar</p>
        <p className="text-sm mt-1">Crea tu primera tarea para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 animate-fade-in">
      {tasks.map((task) => {
        const subtasks = getSubtasksForTask(task.id);
        const project = projects.find(p => p.id === task.project_id);
        
        return (
          <CompactTaskCard
            key={task.id}
            task={task}
            projects={projects}
            onEdit={onEditTask}
            onManageDependencies={onManageDependencies}
            onAssign={onAssignTask}
            onComplete={onCompleteTask}
            onArchive={(task) => onArchiveTask(task.id)}
            onCreateSubtask={onCreateSubtask}
          />
        );
      })}
    </div>
  );
});

CompactTaskList.displayName = 'CompactTaskList';

export default CompactTaskList;
