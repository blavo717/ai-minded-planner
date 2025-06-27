
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/hooks/useTasks';
import EnhancedAnimatedTaskCard from './EnhancedAnimatedTaskCard';

interface EnhancedKanbanColumnContentProps {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

const taskVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    x: -30,
    scale: 0.9,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const dropZoneVariants = {
  idle: {
    scale: 1
  },
  dragOver: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

const EnhancedKanbanColumnContent = ({
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
}: EnhancedKanbanColumnContentProps) => {
  
  const getDropZoneStyle = () => ({
    backgroundColor: isDragOver ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
    borderColor: isDragOver ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.2)'
  });

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div 
          className="min-h-[400px] space-y-3 p-3 rounded-lg border-2 border-dashed transition-all duration-300"
          variants={dropZoneVariants}
          animate={isDragOver ? "dragOver" : "idle"}
          style={getDropZoneStyle()}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, columnStatus)}
          initial={{ opacity: 0, height: 0 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
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
                  layoutId={task.id}
                >
                  <EnhancedAnimatedTaskCard
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
          </motion.div>
          
          {visibleTasks.length === 0 && (
            <motion.div 
              className="text-center text-muted-foreground text-sm py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <motion.div 
                className={`flex flex-col items-center gap-2 ${
                  isDragOver ? 'text-blue-600 scale-105' : ''
                }`}
                animate={isDragOver ? { 
                  y: [0, -5, 0],
                  transition: { 
                    duration: 1, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                } : { y: 0 }}
              >
                <motion.div
                  className="text-2xl"
                  animate={isDragOver ? { 
                    rotate: [0, 10, -10, 0],
                    transition: { duration: 0.5, repeat: Infinity }
                  } : {}}
                >
                  {isDragOver ? '📍' : '📂'}
                </motion.div>
                <span className="font-medium">
                  {isDragOver ? 'Suelta aquí la tarea' : 'Sin tareas'}
                </span>
                {isDragOver && (
                  <motion.div
                    className="w-12 h-1 bg-blue-400 rounded-full"
                    animate={{
                      scaleX: [0.5, 1, 0.5],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnhancedKanbanColumnContent;
