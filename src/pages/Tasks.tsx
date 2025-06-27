import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useProfiles } from '@/hooks/useProfiles';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useTaskHandlers } from '@/hooks/useTaskHandlers';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useTaskDependencies } from '@/hooks/useTaskDependencies';
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
import { FilterState } from '@/types/filters';

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
  } = useTasksContext();
  
  const { 
    filters, 
    updateFilter, 
    filteredTasks, 
    availableTags, 
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter 
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
          onFiltersChange={handleFiltersChange}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={loadFilter}
          taskAssignments={taskAssignments}
          taskDependencies={allTaskDependencies}
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
