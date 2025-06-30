
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'subtask-expansion-state';

export const useSubtaskExpansion = () => {
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(() => {
    // Cargar estado inicial desde localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persistir en localStorage cuando cambie el estado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(expandedSubtasks)));
    } catch {
      // Ignorar errores de localStorage
    }
  }, [expandedSubtasks]);

  const toggleSubtaskExpansion = useCallback((subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(subtaskId)) {
        newExpanded.delete(subtaskId);
      } else {
        newExpanded.add(subtaskId);
      }
      return newExpanded;
    });
  }, []);

  const isSubtaskExpanded = useCallback((subtaskId: string) => {
    return expandedSubtasks.has(subtaskId);
  }, [expandedSubtasks]);

  const preserveExpansionState = useCallback(() => {
    // Devolver el estado actual para preservarlo
    return new Set(expandedSubtasks);
  }, [expandedSubtasks]);

  const restoreExpansionState = useCallback((savedState: Set<string>) => {
    setExpandedSubtasks(savedState);
  }, []);

  const removeFromExpansion = useCallback((subtaskId: string) => {
    setExpandedSubtasks(prev => {
      const newExpanded = new Set(prev);
      newExpanded.delete(subtaskId);
      return newExpanded;
    });
  }, []);

  return {
    toggleSubtaskExpansion,
    isSubtaskExpanded,
    preserveExpansionState,
    restoreExpansionState,
    removeFromExpansion,
  };
};
