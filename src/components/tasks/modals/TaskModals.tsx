
import React from 'react';
import { useTasksContext } from '@/components/tasks/providers/TasksProvider';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import TaskGanttModal from './TaskGanttModal';
import CreateTaskModal from '@/components/modals/CreateTaskModal';

const TaskModals = () => {
  const { 
    // Estados para modal de detalles (CORRECCIÓN FASE 1)
    detailTask, 
    isTaskDetailModalOpen, 
    setIsTaskDetailModalOpen, 
    setDetailTask,
    // Estados para modal de crear tarea (FASE 2)
    isCreateTaskOpen,
    setIsCreateTaskOpen
  } = useTasksContext();
  
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { profiles } = useProfiles();

  // Handlers para modal de detalles
  const handleCloseDetailModal = () => {
    setIsTaskDetailModalOpen(false);
    setDetailTask(null);
  };

  // Handlers para modal de crear tarea
  const handleCloseCreateModal = () => {
    setIsCreateTaskOpen(false);
  };

  // Find current task index for navigation (FASE 3)
  const currentTaskIndex = tasks.findIndex(task => task.id === detailTask?.id);
  const hasPrevious = currentTaskIndex > 0;
  const hasNext = currentTaskIndex < tasks.length - 1;

  const handleNavigateToPrevious = () => {
    if (hasPrevious) {
      setDetailTask(tasks[currentTaskIndex - 1]);
    }
  };

  const handleNavigateToNext = () => {
    if (hasNext) {
      setDetailTask(tasks[currentTaskIndex + 1]);
    }
  };

  return (
    <>
      {/* Modal de Detalles de Tarea - FASE 1 CORREGIDA */}
      {detailTask && (
        <TaskGanttModal
          isOpen={isTaskDetailModalOpen}
          onClose={handleCloseDetailModal}
          task={detailTask}
          projects={projects}
          onNavigateToPrevious={handleNavigateToPrevious}
          onNavigateToNext={handleNavigateToNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      )}

      {/* Modal de Crear Tarea - FASE 2 AÑADIDA */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={handleCloseCreateModal}
        projects={projects}
        profiles={profiles as Profile[]}
      />
    </>
  );
};

export default TaskModals;
