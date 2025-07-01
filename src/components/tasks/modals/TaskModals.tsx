
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskGanttModal from './TaskGanttModal';

interface TaskModalsProps {
  selectedTask: Task | null;
  projects: Project[];
  allTasks: Task[];
  isDetailModalOpen: boolean;
  onCloseDetailModal: () => void;
  onNavigateToPrevious?: () => void;
  onNavigateToNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const TaskModals = ({
  selectedTask,
  projects,
  allTasks,
  isDetailModalOpen,
  onCloseDetailModal,
  onNavigateToPrevious,
  onNavigateToNext,
  hasPrevious,
  hasNext
}: TaskModalsProps) => {
  if (!selectedTask) return null;

  return (
    <TaskGanttModal
      isOpen={isDetailModalOpen}
      onClose={onCloseDetailModal}
      task={selectedTask}
      projects={projects}
      onNavigateToPrevious={onNavigateToPrevious}
      onNavigateToNext={onNavigateToNext}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
    />
  );
};

export default TaskModals;
