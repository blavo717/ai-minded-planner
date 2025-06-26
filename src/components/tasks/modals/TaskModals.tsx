
import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import ManageDependenciesModal from '@/components/tasks/ManageDependenciesModal';
import AssignTaskModal from '@/components/modals/AssignTaskModal';
import CompleteTaskModal from './CompleteTaskModal';
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
    editingTask,
    setEditingTask,
    dependenciesTask,
    setDependenciesTask,
    assigningTask,
    setAssigningTask,
    completingTask,
    setCompletingTask,
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
    </>
  );
};

export default TaskModals;
