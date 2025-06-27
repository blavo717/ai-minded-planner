
import React from 'react';
import { Task } from '@/hooks/useTasks';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import TaskList from '@/components/tasks/TaskList';
import TimelineView from '@/components/tasks/views/TimelineView';
import CalendarView from '@/components/tasks/views/CalendarView';
import EisenhowerMatrix from '@/components/tasks/views/EisenhowerMatrix';
import TaskViewControls from '@/components/tasks/TaskViewControls';

type ViewMode = 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower';

interface TasksViewSectionProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filteredTasks: Task[];
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
  getSubtasksForTask,
  onEditTask,
  onManageDependencies,
  onAssignTask,
  onCompleteTask,
  onArchiveTask,
  onCreateSubtask
}: TasksViewSectionProps) => {
  const renderTaskView = () => {
    switch (viewMode) {
      case 'kanban':
        return (
          <div className="w-full overflow-x-auto">
            <KanbanBoard
              tasks={filteredTasks}
              getSubtasksForTask={getSubtasksForTask}
              onEditTask={onEditTask}
            />
          </div>
        );
      case 'timeline':
        return (
          <TimelineView
            tasks={filteredTasks}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={filteredTasks}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        );
      case 'eisenhower':
        return (
          <EisenhowerMatrix
            tasks={filteredTasks}
            onEditTask={onEditTask}
            onCompleteTask={onCompleteTask}
          />
        );
      case 'list':
      default:
        return (
          <TaskList
            tasks={filteredTasks}
            getSubtasksForTask={getSubtasksForTask}
            onEditTask={onEditTask}
            onManageDependencies={onManageDependencies}
            onAssignTask={onAssignTask}
            onCompleteTask={onCompleteTask}
            onArchiveTask={onArchiveTask}
            onCreateSubtask={onCreateSubtask}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <TaskViewControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        taskCount={filteredTasks.length}
      />

      <div className="min-h-96 animate-fade-in">
        {renderTaskView()}
      </div>
    </div>
  );
};

export default TasksViewSection;
