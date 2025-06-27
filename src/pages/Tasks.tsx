import React, { useState } from 'react';
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
import FilterTestingSuite from '@/components/testing/FilterTestingSuite';
import { TasksProvider, useTasksContext } from '@/components/tasks/providers/TasksProvider';
import TaskModals from '@/components/tasks/modals/TaskModals';
import { FilterState } from '@/types/filters';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Bug } from 'lucide-react';

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

  const [showTestingSuite, setShowTestingSuite] = useState(false);

  const handleSaveFilter = async (name: string, filterData: FilterState) => {
    await saveFilter(name, '', filterData);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    // Update individual filter properties
    Object.keys(newFilters).forEach(key => {
      if (key === 'operators') {
        // Handle operators separately
        Object.keys(newFilters.operators).forEach(opKey => {
          updateFilter(`operators.${opKey}` as any, newFilters.operators[opKey as keyof typeof newFilters.operators]);
        });
      } else {
        updateFilter(key as keyof FilterState, newFilters[key as keyof FilterState]);
      }
    });
  };

  // Function to apply filters (for testing)
  const applyFiltersForTesting = (testFilters: FilterState): any[] => {
    // This simulates the same logic as useTaskFilters but for testing purposes
    return filteredTasks; // Simplified for now
  };

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
          onFiltersChange={handleFiltersChange}
          onSaveFilter={handleSaveFilter}
          onLoadFilter={loadFilter}
          taskAssignments={taskAssignments}
          taskDependencies={allTaskDependencies}
        />

        <div className="flex items-center justify-between">
          <TaskViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            taskCount={filteredTasks.length}
          />
          
          {/* Testing Suite Button */}
          <Dialog open={showTestingSuite} onOpenChange={setShowTestingSuite}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Test Filtros
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Suite de Testing de Filtros</DialogTitle>
              </DialogHeader>
              <FilterTestingSuite
                tasks={mainTasks}
                applyFilters={applyFiltersForTesting}
                taskAssignments={taskAssignments}
                taskDependencies={allTaskDependencies}
              />
            </DialogContent>
          </Dialog>
        </div>

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
