import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useTaskHandlers } from '@/hooks/useTaskHandlers';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskHistory from '@/components/tasks/TaskHistory';
import TasksInsightsSection from '@/components/tasks/TasksInsightsSection';
import TopFiltersBar from '@/components/tasks/filters/TopFiltersBar';
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
  const { user } = useAuth();
  
  
  const {
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
    showHistory,
    setIsCreateTaskOpen,
    setDetailTask,
    setIsTaskDetailModalOpen,
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
    setDetailTask(task);
    setIsTaskDetailModalOpen(true);
  };

  const handleSearchResults = (results: Task[]) => {
    setFilteredTasks(results);
  };

  // Calcular estadísticas para filtros rápidos
  const overdueTasks = mainTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ).length;

  const todayTasks = mainTasks.filter(task => {
    if (!task.due_date) return false;
    const today = new Date();
    const taskDate = new Date(task.due_date);
    return taskDate.toDateString() === today.toDateString();
  }).length;

  const highPriorityTasks = mainTasks.filter(task => 
    task.priority === 'high' || task.priority === 'urgent'
  ).length;

  const unassignedTasks = mainTasks.filter(task => {
    const assignments = taskAssignments.filter(a => a.task_id === task.id);
    return assignments.length === 0;
  }).length;

  const recentTasks = mainTasks.filter(task => {
    const createdDate = new Date(task.created_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return createdDate >= sevenDaysAgo;
  }).length;


  if (showHistory) {
    return (
      <div className="space-y-6">
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
    <div className="h-full flex flex-col">
      {/* Header principal */}
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
        tasks={mainTasks}
        projects={projects}
        onTaskSelect={handleTaskSelect}
        onSearchResults={handleSearchResults}
      />

      {/* Insights section */}
      <TasksInsightsSection showInsights={showInsights} />

      {/* Filtros horizontales */}
      <TopFiltersBar
        projects={projects}
        profiles={profiles}
        availableTags={availableTags}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSaveFilter={handleSaveFilter}
        onLoadFilter={loadFilter}
        taskAssignments={taskAssignments}
        taskDependencies={allTaskDependencies}
        overdueTasks={overdueTasks}
        todayTasks={todayTasks}
        highPriorityTasks={highPriorityTasks}
        unassignedTasks={unassignedTasks}
        recentTasks={recentTasks}
      />


      {/* Área principal de tareas - FULL WIDTH */}
      <div className="flex-1 overflow-hidden">
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
