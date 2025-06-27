
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/hooks/useTasks';
import { useSmartKanbanLayout } from '@/hooks/useSmartKanbanLayout';
import EnhancedVirtualKanbanColumn from './EnhancedVirtualKanbanColumn';

interface SmartKanbanColumnProps {
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

const SmartKanbanColumn = (props: SmartKanbanColumnProps) => {
  const { column, tasks } = props;
  const columnRef = useRef<HTMLDivElement>(null);
  const { optimalWidths, observeColumn, unobserveColumn, isResizing } = useSmartKanbanLayout(tasks);

  // Observar cambios en el tamaño de la columna
  useEffect(() => {
    if (columnRef.current) {
      observeColumn(column.id, columnRef.current);
      
      return () => {
        unobserveColumn(column.id);
      };
    }
  }, [column.id, observeColumn, unobserveColumn]);

  const optimalWidth = optimalWidths[column.id] || 280;

  return (
    <motion.div
      ref={columnRef}
      style={{ 
        width: `${optimalWidth}px`,
        minWidth: '240px',
        maxWidth: '400px'
      }}
      animate={{ 
        width: `${optimalWidth}px`,
        opacity: isResizing ? 0.8 : 1
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeOut" 
      }}
      className="flex-shrink-0"
    >
      <EnhancedVirtualKanbanColumn {...props} />
    </motion.div>
  );
};

export default SmartKanbanColumn;
