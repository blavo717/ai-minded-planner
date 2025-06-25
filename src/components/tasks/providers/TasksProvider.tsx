
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '@/hooks/useTasks';

interface TasksContextValue {
  // Modal states
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDependenciesModalOpen: boolean;
  setIsDependenciesModalOpen: (open: boolean) => void;
  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (open: boolean) => void;
  
  // Current task states
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  dependenciesTask: Task | null;
  setDependenciesTask: (task: Task | null) => void;
  assigningTask: Task | null;
  setAssigningTask: (task: Task | null) => void;
  
  // View states
  viewMode: 'list' | 'kanban';
  setViewMode: (mode: 'list' | 'kanban') => void;
  showInsights: boolean;
  setShowInsights: (show: boolean) => void;
}

const TasksContext = createContext<TasksContextValue | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  // Modal states
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // Current task states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dependenciesTask, setDependenciesTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showInsights, setShowInsights] = useState(false);

  const value: TasksContextValue = {
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDependenciesModalOpen,
    setIsDependenciesModalOpen,
    isAssignModalOpen,
    setIsAssignModalOpen,
    editingTask,
    setEditingTask,
    dependenciesTask,
    setDependenciesTask,
    assigningTask,
    setAssigningTask,
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};
