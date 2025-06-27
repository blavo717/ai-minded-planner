import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { useKanbanPreferences } from '@/hooks/useKanbanPreferences';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useTaskActivity } from '@/hooks/useTaskActivity';
import { Task } from '@/hooks/useTasks';
import { toast } from '@/components/ui/use-toast';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Pause
} from 'lucide-react';
import SmartKanbanColumn from './SmartKanbanColumn';
import ProjectKanbanSelector from './ProjectKanbanSelector';
import TaskBreadcrumbs from '../navigation/TaskBreadcrumbs';
import QuickActionsBar from '../navigation/QuickActionsBar';
import KeyboardShortcutsHelp from '../navigation/KeyboardShortcutsHelp';
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
  const { markAsWorked, toggleFollowup } = useTaskActivity();
  
  // Estados del componente
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Tareas filtradas
  const filteredTasks = useMemo(() => {
    if (!preferences.selectedProjectId) return tasks;
    return tasks.filter(task => task.project_id === preferences.selectedProjectId);
  }, [tasks, preferences.selectedProjectId]);

  // Handlers para quick actions
  const handleCompleteTask = useCallback(async (taskId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      await updateTask({ 
        id: taskId, 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      
      toast({
        title: "✅ Tarea completada",
        description: "La tarea se ha marcado como completada",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo completar la tarea",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  }, [updateTask, isUpdating]);

  const handleArchiveTask = useCallback(async (taskId: string) => {
    try {
      await updateTask({ 
        id: taskId, 
        is_archived: true
      });
      
      toast({
        title: "📦 Tarea archivada",
        description: "La tarea se ha archivado correctamente",
      });
    } catch (error) {
      console.error('Error archiving task:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo archivar la tarea",
        variant: "destructive"
      });
    }
  }, [updateTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      
      // Remover de selección si está seleccionada
      setSelectedTasks(prev => prev.filter(t => t.id !== taskId));
      
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

  const handleAssignTask = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Aquí se abriría el modal de asignación
      console.log('Assign task:', task);
    }
  }, [tasks]);

  const handleManageDependencies = useCallback((task: Task) => {
    // Aquí se abriría el modal de dependencias
    console.log('Manage dependencies for:', task);
  }, []);

  const handleMarkAsWorked = useCallback((taskId: string) => {
    markAsWorked(taskId);
  }, [markAsWorked]);

  const handleToggleFollowup = useCallback((taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toggleFollowup(taskId, !task.needs_followup);
    }
  }, [tasks, toggleFollowup]);

  // Drag and drop handlers
  const handleStatusChange = useCallback(async (taskId: string, newStatus: Task['status']) => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
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
    }
  }, [updateTask, isUpdating]);

  // Keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    onEditTask: selectedTasks.length === 1 ? () => onEditTask(selectedTasks[0]) : undefined,
    onCompleteTask: (taskId: string) => handleCompleteTask(taskId),
    onDeleteTask: handleDeleteTask,
    onSelectAll: () => setSelectedTasks(filteredTasks),
    onEscape: () => {
      setSelectedTasks([]);
      setSelectedTask(null);
    },
    selectedTasks,
    isEnabled: true
  });

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
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
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
      {/* Header con breadcrumbs y controles */}
      <div className="flex items-center justify-between">
        <TaskBreadcrumbs />
        <div className="flex items-center gap-2">
          <KeyboardShortcutsHelp />
        </div>
      </div>

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

      <motion.div 
        className="flex gap-6 overflow-x-auto pb-4"
        variants={boardVariants}
      >
        {columns.map((column) => (
          <SmartKanbanColumn
            key={column.id}
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
        ))}
      </motion.div>

      {/* Quick Actions Bar */}
      <QuickActionsBar
        selectedTasks={selectedTasks}
        onCompleteTask={handleCompleteTask}
        onArchiveTask={handleArchiveTask}
        onAssignTask={handleAssignTask}
        onEditTask={onEditTask}
        onDeleteTask={handleDeleteTask}
        onManageDependencies={handleManageDependencies}
        onMarkAsWorked={handleMarkAsWorked}
        onToggleFollowup={handleToggleFollowup}
      />

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
