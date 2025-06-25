
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
import PostRefactorValidation from '@/components/tasks/testing/PostRefactorValidation';
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
  
  // Estado temporal para mostrar validación post-refactor
  const [showPostRefactorValidation, setShowPostRefactorValidation] = useState(true);
  
  const { filters, setFilters, filteredTasks, availableTags } = useTaskFilters(mainTasks, getSubtasksForTask);
  const { handleEditTask, handleManageDependencies, handleAssignTask, handleCreateSubtask } = useTaskHandlers();

  return (
    <div className="space-y-6">
      <TasksHeader
        showInsights={showInsights}
        onToggleInsights={() => setShowInsights(!showInsights)}
        onCreateTask={() => setIsCreateTaskOpen(true)}
      />

      {/* Validación Post-Refactor - Temporal */}
      {showPostRefactorValidation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">🔍 Validación Post-Refactor</h2>
            <button
              onClick={() => setShowPostRefactorValidation(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Ocultar validación
            </button>
          </div>
          <PostRefactorValidation />
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
