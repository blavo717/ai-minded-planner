import React, { useState, useCallback, useMemo } from 'react';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { Task } from '@/hooks/useTasks';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Pause
} from 'lucide-react';
import KanbanColumn from './kanban/KanbanColumn';

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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleStatusChange = useCallback((taskId: string, newStatus: Task['status']) => {
    updateTask({ 
      id: taskId, 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
  }, [updateTask]);

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
    e.currentTarget.classList.add('opacity-50', 'scale-95');
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedTask(null);
    setDragOverColumn(null);
    e.currentTarget.classList.remove('opacity-50', 'scale-95');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((columnId: string) => {
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== targetStatus) {
      handleStatusChange(draggedTask.id, targetStatus);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  }, [draggedTask, handleStatusChange]);

  const handleDeleteTask = useCallback((taskId: string) => {
    deleteTask(taskId);
  }, [deleteTask]);

  const memoizedColumns = useMemo(() => columns, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {memoizedColumns.map((column) => (
        <div 
          key={column.id}
          className={`transition-all duration-200 ${
            dragOverColumn === column.id ? 'scale-105 shadow-lg' : ''
          }`}
        >
          <KanbanColumn
            column={column}
            tasks={tasks}
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
          />
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
