
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import TaskViewControls from './TaskViewControls';
import CompactTaskList from './CompactTaskList';
import KanbanBoard from './KanbanBoard';
import CalendarView from './views/CalendarView';
import TimelineView from './views/TimelineView';
import EisenhowerMatrix from './views/EisenhowerMatrix';

interface TasksViewSectionProps {
  viewMode: 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower';
  setViewMode: (mode: 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower') => void;
  filteredTasks: Task[];
  projects: Project[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
  onArchiveTask: (taskId: string) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TasksViewSection = ({
  viewMode,
  setViewMode,
  filteredTasks,
  projects,
  getSubtasksForTask,
  onEditTask,
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask,
}: TasksViewSectionProps) => {
  return (
    <div className="h-full flex flex-col">
      {/* Controles de vista - aprovecha el ancho completo */}
      <div className="border-b border-gray-200 px-6 py-4">
        <TaskViewControls
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          taskCount={filteredTasks.length}
        />
      </div>

      {/* Contenido principal - full width y height */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {viewMode === 'list' && (
          <CompactTaskList
            tasks={filteredTasks}
            projects={projects}
            getSubtasksForTask={getSubtasksForTask}
            onEditTask={onEditTask}
            onManageDependencies={onManageDependencies}
            onAssignTask={onAssignTask}
            onCompleteTask={onCompleteTask}
            onArchiveTask={onArchiveTask}
            onCreateSubtask={onCreateSubtask}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanBoard
            tasks={filteredTasks}
            getSubtasksForTask={getSubtasksForTask}
            onEditTask={onEditTask}
          />
        )}

        {viewMode === 'calendar' && (
          <CalendarView
            tasks={filteredTasks}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        )}

        {viewMode === 'timeline' && (
          <TimelineView
            tasks={filteredTasks}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        )}

        {viewMode === 'eisenhower' && (
          <EisenhowerMatrix
            tasks={filteredTasks}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        )}
      </div>
    </div>
  );
};

export default TasksViewSection;
