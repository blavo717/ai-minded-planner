
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from '@/hooks/useTasks';

interface TasksContextType {
  // Existing modals
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  
  isDependenciesModalOpen: boolean;
  setIsDependenciesModalOpen: (open: boolean) => void;
  
  isAssignModalOpen: boolean;
  setIsAssignModalOpen: (open: boolean) => void;
  
  // New complete modal
  isCompleteModalOpen: boolean;
  setIsCompleteModalOpen: (open: boolean) => void;
  
  // View and state management
  viewMode: 'list' | 'kanban' | 'timeline' | 'calendar';
  setViewMode: (mode: 'list' | 'kanban' | 'timeline' | 'calendar') => void;
  
  showInsights: boolean;
  setShowInsights: (show: boolean) => void;
  
  // Task state
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  
  dependenciesTask: Task | null;
  setDependenciesTask: (task: Task | null) => void;
  
  assigningTask: Task | null;
  setAssigningTask: (task: Task | null) => void;
  
  completingTask: Task | null;
  setCompletingTask: (task: Task | null) => void;
  
  // History view
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasksContext = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasksContext must be used within a TasksProvider');
  }
  return context;
};

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider = ({ children }: TasksProviderProps) => {
  // Modal states
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'timeline' | 'calendar'>('list');
  const [showInsights, setShowInsights] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Task states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dependenciesTask, setDependenciesTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);

  const value: TasksContextType = {
    // Modal states
    isCreateTaskOpen,
    setIsCreateTaskOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDependenciesModalOpen,
    setIsDependenciesModalOpen,
    isAssignModalOpen,
    setIsAssignModalOpen,
    isCompleteModalOpen,
    setIsCompleteModalOpen,
    
    // View states
    viewMode,
    setViewMode,
    showInsights,
    setShowInsights,
    showHistory,
    setShowHistory,
    
    // Task states
    editingTask,
    setEditingTask,
    dependenciesTask,
    setDependenciesTask,
    assigningTask,
    setAssigningTask,
    completingTask,
    setCompletingTask,
  };

  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};
