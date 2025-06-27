
import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/hooks/useTasks';
import KanbanColumnHeader from './KanbanColumnHeader';
import KanbanColumnContent from './KanbanColumnContent';
import KanbanLoadMoreButton from './KanbanLoadMoreButton';

interface VirtualKanbanColumnProps {
  column: {
    id: string;
    title: string;
    status: Task['status'];
    color: string;
    icon: React.ReactNode;
  };
  tasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: Task['status']) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
  isDragOver: boolean;
  isUpdating?: boolean;
}

const INITIAL_LOAD_COUNT = 15;
const LOAD_MORE_COUNT = 10;

const VirtualKanbanColumn = memo(({
  column,
  tasks,
  getSubtasksForTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  getProjectName,
  getProjectColor,
  getPriorityColor,
  isDragOver,
  isUpdating = false
}: VirtualKanbanColumnProps) => {
  const [loadedCount, setLoadedCount] = useState(INITIAL_LOAD_COUNT);
  const [isExpanded, setIsExpanded] = useState(true);

  const columnTasks = useMemo(() => 
    tasks.filter(task => task.status === column.status),
    [tasks, column.status]
  );

  const visibleTasks = useMemo(() => 
    columnTasks.slice(0, loadedCount),
    [columnTasks, loadedCount]
  );

  const hasMoreTasks = columnTasks.length > loadedCount;

  const handleLoadMore = () => {
    setLoadedCount(prev => Math.min(prev + LOAD_MORE_COUNT, columnTasks.length));
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    },
    dragOver: {
      scale: 1.02,
      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)',
      transition: { duration: 0.2 }
    },
    updating: {
      opacity: 0.7,
      pointerEvents: 'none' as const,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate={
        isUpdating ? "updating" : 
        isDragOver ? "dragOver" : 
        "visible"
      }
      layout
    >
      <KanbanColumnHeader
        column={column}
        taskCount={columnTasks.length}
        isExpanded={isExpanded}
        isUpdating={isUpdating}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />

      <KanbanColumnContent
        isExpanded={isExpanded}
        isDragOver={isDragOver}
        visibleTasks={visibleTasks}
        getSubtasksForTask={getSubtasksForTask}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
        onDragStart={onDragStart}
        getProjectName={getProjectName}
        getProjectColor={getProjectColor}
        getPriorityColor={getPriorityColor}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        columnStatus={column.status}
      />

      <KanbanLoadMoreButton
        hasMoreTasks={hasMoreTasks}
        isUpdating={isUpdating}
        remainingTasksCount={columnTasks.length - loadedCount}
        loadMoreCount={LOAD_MORE_COUNT}
        onLoadMore={handleLoadMore}
      />
    </motion.div>
  );
});

VirtualKanbanColumn.displayName = 'VirtualKanbanColumn';

export default VirtualKanbanColumn;
