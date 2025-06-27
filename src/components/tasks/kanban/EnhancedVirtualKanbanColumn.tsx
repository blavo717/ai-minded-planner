
import React, { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/hooks/useTasks';
import KanbanColumnHeader from './KanbanColumnHeader';
import EnhancedKanbanColumnContent from './EnhancedKanbanColumnContent';
import KanbanLoadMoreButton from './KanbanLoadMoreButton';

interface EnhancedVirtualKanbanColumnProps {
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

const EnhancedVirtualKanbanColumn = memo(({
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
}: EnhancedVirtualKanbanColumnProps) => {
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
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    dragOver: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    updating: {
      opacity: 0.7,
      pointerEvents: 'none' as const,
      transition: { duration: 0.2 }
    }
  };

  const getBoxShadow = () => {
    if (isDragOver) return '0 12px 40px rgba(59, 130, 246, 0.15)';
    return 'none';
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
      layoutId={`column-${column.id}`}
      style={{
        boxShadow: getBoxShadow()
      }}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <KanbanColumnHeader
          column={column}
          taskCount={columnTasks.length}
          isExpanded={isExpanded}
          isUpdating={isUpdating}
          onToggleExpand={() => setIsExpanded(!isExpanded)}
        />
      </motion.div>

      <EnhancedKanbanColumnContent
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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <KanbanLoadMoreButton
          hasMoreTasks={hasMoreTasks}
          isUpdating={isUpdating}
          remainingTasksCount={columnTasks.length - loadedCount}
          loadMoreCount={LOAD_MORE_COUNT}
          onLoadMore={handleLoadMore}
        />
      </motion.div>
    </motion.div>
  );
});

EnhancedVirtualKanbanColumn.displayName = 'EnhancedVirtualKanbanColumn';

export default EnhancedVirtualKanbanColumn;
