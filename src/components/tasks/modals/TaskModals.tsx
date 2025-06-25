
import React from 'react';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import ManageDependenciesModal from '@/components/tasks/ManageDependenciesModal';
import AssignTaskModal from '@/components/modals/AssignTaskModal';
import { useTasksContext } from '../providers/TasksProvider';

const TaskModals = () => {
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
          task={editingTask}
          open={isEditModalOpen}
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) setEditingTask(null);
          }}
        />
      )}

      {dependenciesTask && (
        <ManageDependenciesModal
          task={dependenciesTask}
          open={isDependenciesModalOpen}
          onOpenChange={(open) => {
            setIsDependenciesModalOpen(open);
            if (!open) setDependenciesTask(null);
          }}
        />
      )}

      {assigningTask && (
        <AssignTaskModal
          task={assigningTask}
          open={isAssignModalOpen}
          onOpenChange={(open) => {
            setIsAssignModalOpen(open);
            if (!open) setAssigningTask(null);
          }}
        />
      )}
    </>
  );
};

export default TaskModals;
