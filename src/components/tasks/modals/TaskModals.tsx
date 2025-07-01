
import React from 'react';
import { useTasksContext } from '@/components/tasks/providers/TasksProvider';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import TaskGanttModal from './TaskGanttModal';

const TaskModals = () => {
  const { 
    selectedTask, 
    isEditTaskOpen, 
    setIsEditTaskOpen, 
    setSelectedTask 
  } = useTasksContext();
  
  const { tasks } = useTasks();
  const { projects } = useProjects();

  const handleCloseModal = () => {
    setIsEditTaskOpen(false);
    setSelectedTask(null);
  };

  // Find current task index for navigation
  const currentTaskIndex = tasks.findIndex(task => task.id === selectedTask?.id);
  const hasPrevious = currentTaskIndex > 0;
  const hasNext = currentTaskIndex < tasks.length - 1;

  const handleNavigateToPrevious = () => {
    if (hasPrevious) {
      setSelectedTask(tasks[currentTaskIndex - 1]);
    }
  };

  const handleNavigateToNext = () => {
    if (hasNext) {
      setSelectedTask(tasks[currentTaskIndex + 1]);
    }
  };

  if (!selectedTask) return null;

  return (
    <TaskGanttModal
      isOpen={isEditTaskOpen}
      onClose={handleCloseModal}
      task={selectedTask}
      projects={projects}
      onNavigateToPrevious={handleNavigateToPrevious}
      onNavigateToNext={handleNavigateToNext}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
    />
  );
};

export default TaskModals;
