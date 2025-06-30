
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import { TasksProvider } from '@/components/tasks/providers/TasksProvider';
import TaskModals from '@/components/tasks/modals/TaskModals';

const KanbanPage = () => {
  const { tasks, getSubtasksForTask } = useTasks();

  return (
    <TasksProvider>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Tablero Kanban</h1>
        
        <KanbanBoard 
          tasks={tasks}
          getSubtasksForTask={getSubtasksForTask}
          onEditTask={() => {}} // Se manejará desde TasksProvider
        />
        
        <TaskModals />
      </div>
    </TasksProvider>
  );
};

export default KanbanPage;
