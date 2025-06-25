
import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import AdvancedFilters from '@/components/tasks/AdvancedFilters';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskViewControls from '@/components/tasks/TaskViewControls';
import TaskList from '@/components/tasks/TaskList';
import { TasksProvider, useTasksContext } from '@/components/tasks/providers/TasksProvider';
import TaskModals from '@/components/tasks/modals/TaskModals';

const TasksContent = () => {
  const { mainTasks, getSubtasksForTask } = useTasks();
  const { projects } = useProjects();
  const { profiles } = useProfiles();
  const { createTask } = useTaskMutations();
  
  const {
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
    setIsCreateTaskOpen,
    setEditingTask,
    setIsEditModalOpen,
    setDependenciesTask,
    setIsDependenciesModalOpen,
    setAssigningTask,
    setIsAssignModalOpen,
  } = useTasksContext();
  
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
      <TaskModals />
    </div>
  );
};

const Tasks = () => {
  return (
    <TasksProvider>
      <TasksContent />
    </TasksProvider>
  );
};

export default Tasks;
