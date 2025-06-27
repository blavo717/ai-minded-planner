
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useTaskHandlers } from '@/hooks/useTaskHandlers';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import AdvancedFilters from '@/components/tasks/AdvancedFilters';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import TasksHeader from '@/components/tasks/TasksHeader';
import TaskViewControls from '@/components/tasks/TaskViewControls';
import TaskList from '@/components/tasks/TaskList';
import TaskHistory from '@/components/tasks/TaskHistory';
import DailyPlannerPreview from '@/components/AI/DailyPlannerPreview';
import TimelineView from '@/components/tasks/views/TimelineView';
import CalendarView from '@/components/tasks/views/CalendarView';
import EisenhowerMatrix from '@/components/tasks/views/EisenhowerMatrix';
import { TasksProvider, useTasksContext } from '@/components/tasks/providers/TasksProvider';
import TaskModals from '@/components/tasks/modals/TaskModals';

const TasksContent = () => {
  const { mainTasks, getSubtasksForTask } = useTasks();
  const { projects } = useProjects();
  const { profiles } = useProfiles();
  
  const {
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
    showHistory,
    setIsCreateTaskOpen,
  } = useTasksContext();
  
  const { filters, setFilters, filteredTasks, availableTags } = useTaskFilters(mainTasks, getSubtasksForTask);
  const { 
    handleEditTask, 
    handleManageDependencies, 
    handleAssignTask, 
    handleCompleteTask,
    handleArchiveTask,
    handleCreateSubtask 
  } = useTaskHandlers();

  // Si estamos en la vista de histórico, mostrar el componente de histórico
  if (showHistory) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <TasksHeader
          showInsights={showInsights}
          onToggleInsights={() => setShowInsights(!showInsights)}
          onCreateTask={() => setIsCreateTaskOpen(true)}
        />
        <TaskHistory />
        <TaskModals />
      </div>
    );
  }

  const renderTaskView = () => {
    switch (viewMode) {
      case 'kanban':
        return (
          <div className="w-full overflow-x-auto">
            <KanbanBoard
              tasks={filteredTasks}
              getSubtasksForTask={getSubtasksForTask}
              onEditTask={handleEditTask}
            />
          </div>
        );
      case 'timeline':
        return (
          <TimelineView
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'eisenhower':
        return (
          <EisenhowerMatrix
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'list':
      default:
        return (
          <TaskList
            tasks={filteredTasks}
            getSubtasksForTask={getSubtasksForTask}
            onEditTask={handleEditTask}
            onManageDependencies={handleManageDependencies}
            onAssignTask={handleAssignTask}
            onCompleteTask={handleCompleteTask}
            onArchiveTask={handleArchiveTask}
            onCreateSubtask={handleCreateSubtask}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <ProductivityInsights />
              <DailyPlannerPreview />
            </div>
          </div>
          <div>
            <ProductivityTimer />
          </div>
        </div>
      )}

      <div className="space-y-6">
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

        <div className="min-h-96">
          {renderTaskView()}
        </div>
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
