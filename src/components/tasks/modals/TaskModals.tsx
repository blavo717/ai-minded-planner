
import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { useTasks } from '@/hooks/useTasks';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import ManageDependenciesModal from '@/components/tasks/ManageDependenciesModal';
import AssignTaskModal from '@/components/modals/AssignTaskModal';
import CompleteTaskModal from './CompleteTaskModal';
import TaskDetailModal from './TaskDetailModal';
import { useTasksContext } from '../providers/TasksProvider';

// Create a compatible profile type for CreateTaskModal
interface CompatibleProfile {
  id: string;
  full_name: string;
  email: string;
  role?: string;
}

const TaskModals = () => {
  const { projects } = useProjects();
  const { profiles } = useProfiles();
  const { mainTasks } = useTasks();
  
  const {
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDependenciesModalOpen,
    setIsDependenciesModalOpen,
    isAssignModalOpen,
    setIsAssignModalOpen,
    isCompleteModalOpen,
    setIsCompleteModalOpen,
    isTaskDetailModalOpen,
    setIsTaskDetailModalOpen,
    editingTask,
    setEditingTask,
    dependenciesTask,
    setDependenciesTask,
    assigningTask,
    setAssigningTask,
    completingTask,
    setCompletingTask,
    detailTask,
    setDetailTask,
  } = useTasksContext();

  // Filter and transform profiles to ensure full_name exists
  const compatibleProfiles: CompatibleProfile[] = profiles
    .filter(profile => profile.full_name) // Only include profiles with full_name
    .map(profile => ({
      id: profile.id,
      full_name: profile.full_name!, // We know it exists because of the filter
      email: profile.email || '', // Provide default empty string if email is undefined
      role: profile.role,
    }));

  // Navigation functions for task detail modal
  const handleNavigateToPrevious = () => {
    if (!detailTask) return;
    const currentIndex = mainTasks.findIndex(t => t.id === detailTask.id);
    if (currentIndex > 0) {
      setDetailTask(mainTasks[currentIndex - 1]);
    }
  };

  const handleNavigateToNext = () => {
    if (!detailTask) return;
    const currentIndex = mainTasks.findIndex(t => t.id === detailTask.id);
    if (currentIndex < mainTasks.length - 1) {
      setDetailTask(mainTasks[currentIndex + 1]);
    }
  };

  const currentTaskIndex = detailTask ? mainTasks.findIndex(t => t.id === detailTask.id) : -1;
  const hasPrevious = currentTaskIndex > 0;
  const hasNext = currentTaskIndex >= 0 && currentTaskIndex < mainTasks.length - 1;

  return (
    <>
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projects={projects}
        profiles={compatibleProfiles}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          projects={projects}
        />
      )}

      {dependenciesTask && (
        <ManageDependenciesModal
          isOpen={isDependenciesModalOpen}
          onClose={() => {
            setIsDependenciesModalOpen(false);
            setDependenciesTask(null);
          }}
          taskId={dependenciesTask.id}
          taskTitle={dependenciesTask.title}
        />
      )}

      {assigningTask && (
        <AssignTaskModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssigningTask(null);
          }}
          taskId={assigningTask.id}
          taskTitle={assigningTask.title}
          profiles={profiles}
        />
      )}

      {completingTask && (
        <CompleteTaskModal
          isOpen={isCompleteModalOpen}
          onClose={() => {
            setIsCompleteModalOpen(false);
            setCompletingTask(null);
          }}
          taskId={completingTask.id}
          taskTitle={completingTask.title}
        />
      )}

      {detailTask && (
        <TaskDetailModal
          isOpen={isTaskDetailModalOpen}
          onClose={() => {
            setIsTaskDetailModalOpen(false);
            setDetailTask(null);
          }}
          task={detailTask}
          allTasks={mainTasks}
          projects={projects}
          onNavigateToPrevious={handleNavigateToPrevious}
          onNavigateToNext={handleNavigateToNext}
          hasPrevious={hasPrevious}
          hasNext={hasNext}
        />
      )}
    </>
  );
};

export default TaskModals;
