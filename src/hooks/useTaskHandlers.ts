
import { useCallback } from 'react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useTasksContext } from '@/components/tasks/providers/TasksProvider';

export const useTaskHandlers = () => {
  const { createSubtask, archiveTask } = useTaskMutations();
  const {
    setEditingTask,
    setIsEditModalOpen,
    setDependenciesTask,
    setIsDependenciesModalOpen,
    setAssigningTask,
    setIsAssignModalOpen,
    setCompletingTask,
    setIsCompleteModalOpen,
  } = useTasksContext();

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  }, [setEditingTask, setIsEditModalOpen]);

  const handleManageDependencies = useCallback((task: Task) => {
    setDependenciesTask(task);
    setIsDependenciesModalOpen(true);
  }, [setDependenciesTask, setIsDependenciesModalOpen]);

  const handleAssignTask = useCallback((task: Task) => {
    setAssigningTask(task);
    setIsAssignModalOpen(true);
  }, [setAssigningTask, setIsAssignModalOpen]);

  const handleCompleteTask = useCallback((task: Task) => {
    setCompletingTask(task);
    setIsCompleteModalOpen(true);
  }, [setCompletingTask, setIsCompleteModalOpen]);

  const handleArchiveTask = useCallback((taskId: string) => {
    archiveTask(taskId);
  }, [archiveTask]);

  const handleCreateSubtask = useCallback((task: Task) => {
    createSubtask({
      parentTaskId: task.id,
      title: `Subtarea de ${task.title}`
    });
  }, [createSubtask]);

  return {
    handleEditTask,
    handleManageDependencies,
    handleAssignTask,
    handleCompleteTask,
    handleArchiveTask,
    handleCreateSubtask
  };
};
