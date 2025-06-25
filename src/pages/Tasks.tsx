
import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import EditTaskModal from '@/components/tasks/EditTaskModal';
import ManageDependenciesModal from '@/components/tasks/ManageDependenciesModal';
import AssignTaskModal from '@/components/modals/AssignTaskModal';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import AdvancedFilters from '@/components/tasks/AdvancedFilters';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskViewControls from '@/components/tasks/TaskViewControls';
import TaskList from '@/components/tasks/TaskList';

const Tasks = () => {
  const { mainTasks, getSubtasksForTask } = useTasks();
  const { projects } = useProjects();
  const { profiles } = useProfiles();
  const { createTask } = useTaskMutations();
  
  // Modal states
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dependenciesTask, setDependenciesTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showInsights, setShowInsights] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    priority: [] as string[],
    projects: [] as string[],
    tags: [] as string[],
    assignedTo: [] as string[],
    dueDateFrom: undefined as Date | undefined,
    dueDateTo: undefined as Date | undefined,
    hasSubtasks: undefined as boolean | undefined,
    hasDependencies: undefined as boolean | undefined,
  });

  // Get available tags from all tasks
  const availableTags = Array.from(
    new Set(
      mainTasks
        .filter(task => task.tags)
        .flatMap(task => task.tags || [])
    )
  );

  // Filter tasks based on advanced filters
  const filteredTasks = mainTasks.filter((task) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Project filter
    if (filters.projects.length > 0) {
      if (!task.project_id || !filters.projects.includes(task.project_id)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      if (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag))) {
        return false;
      }
    }

    // Date range filter
    if (filters.dueDateFrom && task.due_date) {
      if (new Date(task.due_date) < filters.dueDateFrom) {
        return false;
      }
    }
    if (filters.dueDateTo && task.due_date) {
      if (new Date(task.due_date) > filters.dueDateTo) {
        return false;
      }
    }

    // Subtasks filter
    if (filters.hasSubtasks !== undefined) {
      const hasSubtasks = getSubtasksForTask(task.id).length > 0;
      if (filters.hasSubtasks !== hasSubtasks) {
        return false;
      }
    }

    return true;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleManageDependencies = (task: Task) => {
    setDependenciesTask(task);
    setIsDependenciesModalOpen(true);
  };

  const handleAssignTask = (task: Task) => {
    setAssigningTask(task);
    setIsAssignModalOpen(true);
  };

  const handleCreateSubtask = (parentTaskId: string, title: string) => {
    createTask({
      title,
      parent_task_id: parentTaskId,
      status: 'pending',
      priority: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {/* AI Insights Panel */}
      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductivityInsights />
          </div>
          <div>
            <ProductivityTimer />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <AdvancedFilters
        projects={projects}
        profiles={profiles}
        availableTags={availableTags}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* View Controls */}
      <TaskViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        taskCount={filteredTasks.length}
      />

      {/* Tasks Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          getSubtasksForTask={getSubtasksForTask}
          onEditTask={handleEditTask}
        />
      ) : (
        <TaskList
          tasks={filteredTasks}
          getSubtasksForTask={getSubtasksForTask}
          onEditTask={handleEditTask}
          onManageDependencies={handleManageDependencies}
          onAssignTask={handleAssignTask}
          onCreateSubtask={handleCreateSubtask}
        />
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projects={projects}
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
    </div>
  );
};

export default Tasks;
