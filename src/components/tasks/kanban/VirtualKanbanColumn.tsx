
import React, { memo, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/hooks/useTasks';
import AnimatedKanbanTaskCard from './AnimatedKanbanTaskCard';
import { ChevronDown, Plus, Loader2 } from 'lucide-react';

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
      <Card className={`${column.color} border-2 transition-all duration-200 relative`}>
        {isUpdating && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <motion.span 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {column.icon}
              </motion.div>
              {column.title}
            </motion.span>
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </motion.div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={isUpdating}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className={`min-h-[400px] space-y-3 p-2 rounded-lg transition-all duration-200 ${
              isDragOver ? 'bg-blue-50/50 border-2 border-dashed border-blue-300' : ''
            }`}
            onDragOver={onDragOver}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, column.status)}
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
                  <AnimatedKanbanTaskCard
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
            
            {hasMoreTasks && !isUpdating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMore}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Cargar {Math.min(LOAD_MORE_COUNT, columnTasks.length - loadedCount)} más
                </Button>
              </motion.div>
            )}
            
            {columnTasks.length === 0 && (
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
    </motion.div>
  );
});

VirtualKanbanColumn.displayName = 'VirtualKanbanColumn';

export default VirtualKanbanColumn;
