
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import GanttChart from '@/components/projects/GanttChart';

const GanttPage = () => {
  const { tasks, isLoading: isLoadingTasks } = useTasks();
  const { projects, isLoading: isLoadingProjects } = useProjects();

  if (isLoadingTasks || isLoadingProjects) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Diagrama de Gantt</h1>
        <p className="text-muted-foreground">Visualización temporal minimalistic de tus tareas</p>
      </div>
      <GanttChart tasks={tasks} projects={projects} />
    </div>
  );
};

export default GanttPage;
