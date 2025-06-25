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
import AIInsightsPanel from '@/components/tasks/ai/AIInsightsPanel';
import AIMonitoringDashboard from '@/components/tasks/ai/AIMonitoringDashboard';
import AITestingPanel from '@/components/tasks/ai/AITestingPanel';
import Phase1TestingSuite from '@/components/tasks/testing/Phase1TestingSuite';
import Phase1Demo from '@/components/tasks/testing/Phase1Demo';
import Phase2TestingSuite from '@/components/tasks/testing/Phase2TestingSuite';
import Phase2Demo from '@/components/tasks/testing/Phase2Demo';
import Phase3IntegralSuite from '@/components/tasks/testing/Phase3IntegralSuite';
import Phase3Demo from '@/components/tasks/testing/Phase3Demo';
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
  
  const [showAIMonitoring, setShowAIMonitoring] = useState(false);
  const [showTesting, setShowTesting] = useState(false);
  const [showPhase2Testing, setShowPhase2Testing] = useState(false);
  const [showPhase3Testing, setShowPhase3Testing] = useState(false);
  
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

  const availableTags = Array.from(
    new Set(
      mainTasks
        .filter(task => task.tags)
        .flatMap(task => task.tags || [])
    )
  );

  const filteredTasks = mainTasks.filter((task) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    if (filters.projects.length > 0) {
      if (!task.project_id || !filters.projects.includes(task.project_id)) {
        return false;
      }
    }

    if (filters.tags.length > 0) {
      if (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag))) {
        return false;
      }
    }

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
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
        showAIMonitoring={showAIMonitoring}
        onToggleAIMonitoring={() => setShowAIMonitoring(!showAIMonitoring)}
        showTesting={showTesting}
        onToggleTesting={() => setShowTesting(!showTesting)}
        showPhase2Testing={showPhase2Testing}
        onTogglePhase2Testing={() => setShowPhase2Testing(!showPhase2Testing)}
        showPhase3Testing={showPhase3Testing}
        onTogglePhase3Testing={() => setShowPhase3Testing(!showPhase3Testing)}
      />

      {showTesting && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Phase1TestingSuite />
          <Phase1Demo />
        </div>
      )}

      {showPhase2Testing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Phase2TestingSuite />
          <Phase2Demo />
        </div>
      )}

      {showPhase3Testing && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Phase3IntegralSuite />
          <Phase3Demo />
        </div>
      )}

      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <ProductivityInsights />
              <AIInsightsPanel />
            </div>
          </div>
          <div>
            <ProductivityTimer />
          </div>
        </div>
      )}

      {showAIMonitoring && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AIMonitoringDashboard />
          </div>
          <div>
            <AITestingPanel />
          </div>
        </div>
      )}

      {!showTesting && !showPhase2Testing && !showPhase3Testing && (
        <>
          <AdvancedFilters
            projects={projects}
            profiles={profiles}
            availableTags={availableTags}
            filters={filters}
            onFiltersChange={setFilters}
          />

          <TaskViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            taskCount={filteredTasks.length}
          />

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
        </>
      )}

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
