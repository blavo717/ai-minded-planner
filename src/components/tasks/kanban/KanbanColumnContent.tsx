
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/hooks/useTasks';
import KanbanTaskCard from './KanbanTaskCard';

interface KanbanColumnContentProps {
  isExpanded: boolean;
  isDragOver: boolean;
  visibleTasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  getProjectName: (projectId?: string) => string | null;
  getProjectColor: (projectId?: string) => string | null;
  getPriorityColor: (priority: Task['priority']) => string;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStatus: Task['status']) => void;
  columnStatus: Task['status'];
}

const taskVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { duration: 0.2 }
  }
};

const KanbanColumnContent = ({
  isExpanded,
  isDragOver,
  visibleTasks,
  getSubtasksForTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  getProjectName,
  getProjectColor,
  getPriorityColor,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  columnStatus
}: KanbanColumnContentProps) => {
  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div 
          className={`min-h-[400px] space-y-3 p-2 rounded-lg transition-all duration-200 ${
            isDragOver ? 'bg-blue-50/50 border-2 border-dashed border-blue-300' : ''
          }`}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, columnStatus)}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="popLayout">
            {visibleTasks.map((task) => (
              <motion.div
                key={`${task.id}-${task.status}`}
                variants={taskVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <KanbanTaskCard
                  task={task}
                  subtasks={getSubtasksForTask(task.id)}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  onDragStart={onDragStart}
                  getProjectName={getProjectName}
                  getProjectColor={getProjectColor}
                  getPriorityColor={getPriorityColor}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {visibleTasks.length === 0 && (
            <motion.div 
              className="text-center text-muted-foreground text-sm py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className={`${isDragOver ? 'text-blue-600' : ''}`}
                animate={isDragOver ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isDragOver ? 'Suelta aquí la tarea' : 'Sin tareas'}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default KanbanColumnContent;
