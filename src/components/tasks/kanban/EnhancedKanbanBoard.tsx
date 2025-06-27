
import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { useKanbanPreferences } from '@/hooks/useKanbanPreferences';
import { Task } from '@/hooks/useTasks';
import { toast } from '@/components/ui/use-toast';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Pause
} from 'lucide-react';
import VirtualKanbanColumn from './VirtualKanbanColumn';
import ProjectKanbanSelector from './ProjectKanbanSelector';
import { KanbanBoardSkeleton } from '@/components/ui/skeleton-variants';

interface EnhancedKanbanBoardProps {
  tasks: Task[];
  isLoading?: boolean;
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
}

const columns = [
  {
    id: 'pending',
    title: 'Pendientes',
    status: 'pending' as const,
    color: 'border-yellow-200 bg-yellow-50',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
    accentColor: 'yellow'
  },
  {
    id: 'in_progress',
    title: 'En Progreso',
    status: 'in_progress' as const,
    color: 'border-blue-200 bg-blue-50',
    icon: <Clock className="h-4 w-4 text-blue-600" />,
    accentColor: 'blue'
  },
  {
    id: 'completed',
    title: 'Completadas',
    status: 'completed' as const,
    color: 'border-green-200 bg-green-50',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    accentColor: 'green'
  },
  {
    id: 'cancelled',
    title: 'Canceladas',
    status: 'cancelled' as const,
    color: 'border-red-200 bg-red-50',
    icon: <Pause className="h-4 w-4 text-red-600" />,
    accentColor: 'red'
  }
];

const EnhancedKanbanBoard = ({ 
  tasks, 
  isLoading = false,
  getSubtasksForTask, 
  onEditTask 
}: EnhancedKanbanBoardProps) => {
  const { updateTask, deleteTask } = useTaskMutations();
  const { projects } = useProjects();
  const { preferences, setSelectedProject } = useKanbanPreferences();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dragFeedback, setDragFeedback] = useState({
    isActive: false,
    sourceColumn: '',
    targetColumn: ''
  });

  const filteredTasks = useMemo(() => {
    if (!preferences.selectedProjectId) return tasks;
    return tasks.filter(task => task.project_id === preferences.selectedProjectId);
  }, [tasks, preferences.selectedProjectId]);

  const handleStatusChange = useCallback(async (taskId: string, newStatus: Task['status']) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    // Optimistic update animation
    const targetColumn = columns.find(col => col.status === newStatus);
    setDragFeedback(prev => ({ ...prev, targetColumn: targetColumn?.title || '' }));
    
    try {
      await updateTask({ 
        id: taskId, 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
      
      toast({
        title: "✅ Tarea actualizada",
        description: `Estado cambiado a ${newStatus === 'completed' ? 'completada' : newStatus === 'in_progress' ? 'en progreso' : newStatus}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setDragFeedback({ isActive: false, sourceColumn: '', targetColumn: '' });
    }
  }, [updateTask, isUpdating]);

  const getPriorityColor = useCallback((priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }, []);

  const getProjectName = useCallback((projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name || null;
  }, [projects]);

  const getProjectColor = useCallback((projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.color || null;
  }, [projects]);

  const handleDragStart = useCallback((e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    setDragFeedback({
      isActive: true,
      sourceColumn: columns.find(col => col.status === task.status)?.title || '',
      targetColumn: ''
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
    setDragFeedback({ isActive: false, sourceColumn: '', targetColumn: '' });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
    const targetColumn = columns.find(col => col.id === columnId);
    setDragFeedback(prev => ({ ...prev, targetColumn: targetColumn?.title || '' }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
      setDragFeedback(prev => ({ ...prev, targetColumn: '' }));
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== targetStatus && !isUpdating) {
      await handleStatusChange(draggedTask.id, targetStatus);
    }
    
    setDraggedTask(null);
    setDragOverColumn(null);
  }, [draggedTask, handleStatusChange, isUpdating]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "🗑️ Tarea eliminada",
        description: "La tarea se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  }, [deleteTask]);

  const boardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const columnVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <KanbanBoardSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={boardVariants}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <ProjectKanbanSelector
          projects={projects}
          selectedProjectId={preferences.selectedProjectId}
          onProjectSelect={setSelectedProject}
          tasks={filteredTasks}
        />
      </motion.div>

      {/* Drag Feedback */}
      <AnimatePresence>
        {dragFeedback.isActive && (
          <motion.div
            className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                {dragFeedback.sourceColumn} → {dragFeedback.targetColumn || '...'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={boardVariants}
      >
        {columns.map((column, index) => (
          <motion.div 
            key={column.id}
            variants={columnVariants}
            whileHover="hover"
            className={`transition-all duration-300 ${
              dragOverColumn === column.id 
                ? `scale-105 shadow-xl ring-2 ring-${column.accentColor}-300 ring-opacity-50` 
                : ''
            }`}
            style={{
              filter: dragOverColumn === column.id ? 'brightness(1.05)' : 'none'
            }}
          >
            <VirtualKanbanColumn
              column={column}
              tasks={filteredTasks}
              getSubtasksForTask={getSubtasksForTask}
              onEditTask={onEditTask}
              onDeleteTask={handleDeleteTask}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(column.id)}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              getProjectName={getProjectName}
              getProjectColor={getProjectColor}
              getPriorityColor={getPriorityColor}
              isDragOver={dragOverColumn === column.id}
              isUpdating={isUpdating}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Loading overlay */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 shadow-xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium">Actualizando tarea...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default EnhancedKanbanBoard;
