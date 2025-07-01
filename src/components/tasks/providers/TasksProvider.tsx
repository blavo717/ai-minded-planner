
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '@/hooks/useTasks';

interface TasksContextType {
  // Estados de vista
  viewMode: 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower' | 'tree';
  setViewMode: (mode: 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower' | 'tree') => void;
  showInsights: boolean;
  setShowInsights: (show: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;

  // Estados para modal de detalles
  detailTask: Task | null;
  setDetailTask: (task: Task | null) => void;
  isTaskDetailModalOpen: boolean;
  setIsTaskDetailModalOpen: (open: boolean) => void;

  // Estados para modal de crear tarea
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;

  // Estados para modal de editar tarea
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;

  // Estados para modal de dependencias
  dependenciesTask: Task | null;
  setDependenciesTask: (task: Task | null) => void;
  isDependenciesModalOpen: boolean;
  setIsDependenciesModalOpen: (open: boolean) => void;

  // Estados para modal de asignación
  assigningTask: Task | null;
  setAssigningTask: (task: Task | null) => void;
  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (open: boolean) => void;

  // Estados para modal de completar
  completingTask: Task | null;
  setCompletingTask: (task: Task | null) => void;
  isCompleteModalOpen: boolean;
  setIsCompleteModalOpen: (open: boolean) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext debe ser usado dentro de TasksProvider');
  }
  return context;
};

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  // Estados de vista
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower' | 'tree'>('list');
  const [showInsights, setShowInsights] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Estados para modal de detalles
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);

  // Estados para modal de crear tarea
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  // Estados para modal de editar tarea
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estados para modal de dependencias
  const [dependenciesTask, setDependenciesTask] = useState<Task | null>(null);
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);

  // Estados para modal de asignación
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Estados para modal de completar
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const value: TasksContextType = {
    // Estados de vista
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
    showHistory,
    setShowHistory,

    // Estados para modal de detalles
    detailTask,
    setDetailTask,
    isTaskDetailModalOpen,
    setIsTaskDetailModalOpen,

    // Estados para modal de crear tarea
    isCreateTaskOpen,
    setIsCreateTaskOpen,

    // Estados para modal de editar tarea
    editingTask,
    setEditingTask,
    isEditModalOpen,
    setIsEditModalOpen,

    // Estados para modal de dependencias
    dependenciesTask,
    setDependenciesTask,
    isDependenciesModalOpen,
    setIsDependenciesModalOpen,

    // Estados para modal de asignación
    assigningTask,
    setAssigningTask,
    isAssignModalOpen,
    setIsAssignModalOpen,

    // Estados para modal de completar
    completingTask,
    setCompletingTask,
    isCompleteModalOpen,
    setIsCompleteModalOpen,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};
