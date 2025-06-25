
import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import ManageDependenciesModal from '@/components/tasks/ManageDependenciesModal';
import AssignTaskModal from '@/components/modals/AssignTaskModal';
import { useTasksContext } from '../providers/TasksProvider';

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
    editingTask,
    setEditingTask,
    dependenciesTask,
    setDependenciesTask,
    assigningTask,
    setAssigningTask,
  } = useTasksContext();

  return (
    <>
      <CreateTaskModal
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
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
    </>
  );
};

export default TaskModals;
