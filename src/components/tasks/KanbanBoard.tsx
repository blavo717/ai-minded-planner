
import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
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
import VirtualKanbanColumn from './kanban/VirtualKanbanColumn';
import ProjectKanbanSelector from './kanban/ProjectKanbanSelector';

interface KanbanBoardProps {
  tasks: Task[];
  getSubtasksForTask: (taskId: string) => Task[];
  onEditTask: (task: Task) => void;
}

const columns = [
  {
    id: 'pending',
    title: 'Pendientes',
    status: 'pending' as const,
    color: 'border-yellow-200 bg-yellow-50',
    icon: <AlertTriangle className="h-4 w-4 text-yellow-600" />
  },
  {
    id: 'in_progress',
    title: 'En Progreso',
    status: 'in_progress' as const,
    color: 'border-blue-200 bg-blue-50',
    icon: <Clock className="h-4 w-4 text-blue-600" />
  },
  {
    id: 'completed',
    title: 'Completadas',
    status: 'completed' as const,
    color: 'border-green-200 bg-green-50',
    icon: <CheckCircle className="h-4 w-4 text-green-600" />
  },
  {
    id: 'cancelled',
    title: 'Canceladas',
    status: 'cancelled' as const,
    color: 'border-red-200 bg-red-50',
    icon: <Pause className="h-4 w-4 text-red-600" />
  }
];

const KanbanBoard = ({ tasks, getSubtasksForTask, onEditTask }: KanbanBoardProps) => {
  const { updateTask, deleteTask } = useTaskMutations();
  const { projects } = useProjects();
  const { preferences, setSelectedProject } = useKanbanPreferences();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter tasks by selected project with memoization
  const filteredTasks = useMemo(() => {
    if (!preferences.selectedProjectId) return tasks;
    return tasks.filter(task => task.project_id === preferences.selectedProjectId);
  }, [tasks, preferences.selectedProjectId]);

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
        title: "Tarea actualizada",
        description: `Estado cambiado a ${newStatus === 'completed' ? 'completada' : 'en progreso'}`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la tarea",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
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
    // Only clear drag over if we're actually leaving the column
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

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado correctamente",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  }, [deleteTask]);

  const boardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6">
      <ProjectKanbanSelector
        projects={projects}
        selectedProjectId={preferences.selectedProjectId}
        onProjectSelect={setSelectedProject}
        tasks={filteredTasks}
      />

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={boardVariants}
        initial="hidden"
        animate="visible"
      >
        {columns.map((column) => (
          <motion.div 
            key={column.id}
            className={`transition-all duration-200 ${
              dragOverColumn === column.id ? 'scale-105 shadow-lg' : ''
            }`}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
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
    </div>
  );
};

export default KanbanBoard;
