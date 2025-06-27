
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface KanbanPreferences {
  selectedProjectId: string | null;
  viewMode: 'all' | 'project';
  autoRefresh: boolean;
  columnCollapsed: Record<string, boolean>;
}

const DEFAULT_PREFERENCES: KanbanPreferences = {
  selectedProjectId: null,
  viewMode: 'all',
  autoRefresh: true,
  columnCollapsed: {}
};

export const useKanbanPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<KanbanPreferences>(DEFAULT_PREFERENCES);

  const storageKey = `kanban-preferences-${user?.id}`;

  // Load preferences from localStorage
  useEffect(() => {
    if (!user) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as KanbanPreferences;
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Error loading Kanban preferences:', error);
    }
  }, [user, storageKey]);

  // Save preferences to localStorage
  const savePreferences = (newPreferences: Partial<KanbanPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving Kanban preferences:', error);
    }
  };

  const setSelectedProject = (projectId: string | null) => {
    savePreferences({ 
      selectedProjectId: projectId,
      viewMode: projectId ? 'project' : 'all'
    });
  };

  const toggleColumnCollapsed = (columnId: string) => {
    const newCollapsed = {
      ...preferences.columnCollapsed,
      [columnId]: !preferences.columnCollapsed[columnId]
    };
    savePreferences({ columnCollapsed: newCollapsed });
  };

  const setAutoRefresh = (enabled: boolean) => {
    savePreferences({ autoRefresh: enabled });
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error resetting Kanban preferences:', error);
    }
  };

  return {
    preferences,
    setSelectedProject,
    toggleColumnCollapsed,
    setAutoRefresh,
    resetPreferences,
  };
};
