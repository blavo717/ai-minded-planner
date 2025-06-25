
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
import AIInsightsPanel from '@/components/tasks/ai/AIInsightsPanel';
import DailyPlannerPreview from '@/components/AI/DailyPlannerPreview';
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
    setIsCreateTaskOpen,
  } = useTasksContext();
  
  // Estados para AI monitoring
  const [showAIMonitoring, setShowAIMonitoring] = useState(false);
  
  const { filters, setFilters, filteredTasks, availableTags } = useTaskFilters(mainTasks, getSubtasksForTask);
  const { handleEditTask, handleManageDependencies, handleAssignTask, handleCreateSubtask } = useTaskHandlers();

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
        showAIMonitoring={showAIMonitoring}
        onToggleAIMonitoring={() => setShowAIMonitoring(!showAIMonitoring)}
      />

      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-6">
              <ProductivityInsights />
              <AIInsightsPanel />
              <DailyPlannerPreview />
            </div>
          </div>
          <div>
            <ProductivityTimer />
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-hidden">
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
          <div className="overflow-x-auto">
            <KanbanBoard
              tasks={filteredTasks}
              getSubtasksForTask={getSubtasksForTask}
              onEditTask={handleEditTask}
            />
          </div>
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
