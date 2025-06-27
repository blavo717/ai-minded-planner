
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useTaskHandlers } from '@/hooks/useTaskHandlers';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskHistory from '@/components/tasks/TaskHistory';
import TasksInsightsSection from '@/components/tasks/TasksInsightsSection';
import TasksFiltersSection from '@/components/tasks/TasksFiltersSection';
import TasksViewSection from '@/components/tasks/TasksViewSection';
import { TasksProvider, useTasksContext } from '@/components/tasks/providers/TasksProvider';
import TaskModals from '@/components/tasks/modals/TaskModals';
import { FilterState } from '@/types/filters';
import { Task } from '@/hooks/useTasks';

const TasksContent = () => {
  const { mainTasks, getSubtasksForTask } = useTasks();
  const { projects } = useProjects();
  const { profiles } = useProfiles();
  const { saveFilter } = useSavedFilters();
  const { taskAssignments } = useTaskAssignments();
  const { dependencies: allTaskDependencies } = useTaskDependencies();
  
  const {
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
    showHistory,
    setIsCreateTaskOpen,
    setIsEditTaskOpen,
    setSelectedTask,
  } = useTasksContext();
  
  const { 
    filters, 
    updateFilter, 
    filteredTasks, 
    availableTags, 
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter,
    setFilteredTasks 
  } = useTaskFilters(mainTasks, getSubtasksForTask, taskAssignments, allTaskDependencies);
  
  const { 
    handleEditTask, 
    handleManageDependencies, 
    handleAssignTask, 
    handleCompleteTask,
    handleArchiveTask,
    handleCreateSubtask 
  } = useTaskHandlers();

  const handleSaveFilter = async (name: string, filterData: FilterState) => {
    await saveFilter(name, '', filterData);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    Object.keys(newFilters).forEach(key => {
      if (key === 'operators') {
        Object.keys(newFilters.operators).forEach(opKey => {
          updateFilter(`operators.${opKey}` as any, newFilters.operators[opKey as keyof typeof newFilters.operators]);
        });
      } else {
        updateFilter(key as keyof FilterState, newFilters[key as keyof FilterState]);
      }
    });
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskOpen(true);
  };

  const handleSearchResults = (results: Task[]) => {
    setFilteredTasks(results);
  };

  if (showHistory) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <TasksHeader
          showInsights={showInsights}
          onToggleInsights={() => setShowInsights(!showInsights)}
          onCreateTask={() => setIsCreateTaskOpen(true)}
          tasks={mainTasks}
          projects={projects}
          onTaskSelect={handleTaskSelect}
          onSearchResults={handleSearchResults}
        />
        <TaskHistory />
        <TaskModals />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
        tasks={mainTasks}
        projects={projects}
        onTaskSelect={handleTaskSelect}
        onSearchResults={handleSearchResults}
      />

      <TasksInsightsSection showInsights={showInsights} />

      <div className="space-y-6">
        <TasksFiltersSection
          projects={projects}
          profiles={profiles}
          availableTags={availableTags}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={loadFilter}
          taskAssignments={taskAssignments}
          taskDependencies={allTaskDependencies}
        />

        <TasksViewSection
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredTasks={filteredTasks}
          projects={projects}
          getSubtasksForTask={getSubtasksForTask}
          onEditTask={handleEditTask}
          onManageDependencies={handleManageDependencies}
          onAssignTask={handleAssignTask}
          onCompleteTask={handleCompleteTask}
          onArchiveTask={handleArchiveTask}
          onCreateSubtask={handleCreateSubtask}
        />
      </div>

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
