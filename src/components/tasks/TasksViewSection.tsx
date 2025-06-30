
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
  viewMode: string;
  setViewMode: (mode: string) => void;
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
    <div className="space-y-6">
      <TaskViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        taskCount={filteredTasks.length}
      />

      <div className="min-h-[400px]">
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
            projects={projects}
            getSubtasksForTask={getSubtasksForTask}
            onEditTask={onEditTask}
            onDeleteTask={onArchiveTask}
            onCreateSubtask={onCreateSubtask}
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
            projects={projects}
            onEditTask={onEditTask}
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
