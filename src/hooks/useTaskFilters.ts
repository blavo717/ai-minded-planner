
import { useState, useMemo, useCallback } from 'react';
import { Task } from './useTasks';
import { TaskAssignment } from './useTaskAssignments';
import { TaskDependency } from './useTaskDependencies';
import { FilterState } from '@/types/filters';
import { useTaskFilterOperations } from './filters/useTaskFilterOperations';

export const useTaskFilters = (
  tasks: Task[],
  getSubtasksForTask: (taskId: string) => Task[],
  taskAssignments: TaskAssignment[],
  taskDependencies: TaskDependency[]
) => {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    priorities: [],
    projects: [],
    assignedTo: [],
    tags: [],
    dateRange: {
      from: undefined,
      to: undefined
    },
    hasSubtasks: undefined,
    hasDependencies: undefined,
    smartFilters: [],
    operators: {
      status: 'OR',
      priority: 'OR', 
      project: 'OR',
      assignedTo: 'OR',
      tags: 'OR'
    }
  });

  const [customFilteredTasks, setCustomFilteredTasks] = useState<Task[] | null>(null);

  const { applyFilters } = useTaskFilterOperations();

  const filteredTasks = useMemo(() => {
    // Si hay tareas personalizadas (por ejemplo, de búsqueda semántica), usar esas
    if (customFilteredTasks) {
      return customFilteredTasks;
    }

    return applyFilters(tasks, filters, getSubtasksForTask, taskAssignments, taskDependencies);
  }, [tasks, filters, getSubtasksForTask, taskAssignments, taskDependencies, customFilteredTasks, applyFilters]);

  const availableTags = useMemo(() => {
    return Array.from(new Set(
      tasks.flatMap(task => task.tags || [])
    )).sort();
  }, [tasks]);

  const updateFilter = useCallback((key: keyof FilterState | `operators.${keyof FilterState['operators']}`, value: any) => {
    // Limpiar filtros personalizados cuando se aplican filtros normales
    setCustomFilteredTasks(null);
    
    setFilters(prev => {
      if (key.startsWith('operators.')) {
        const operatorKey = key.split('.')[1] as keyof FilterState['operators'];
        return {
          ...prev,
          operators: {
            ...prev.operators,
            [operatorKey]: value
          }
        };
      }
      return {
        ...prev,
        [key]: value
      };
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setCustomFilteredTasks(null);
    setFilters({
      statuses: [],
      priorities: [],
      projects: [],
      assignedTo: [],
      tags: [],
      dateRange: {
        from: undefined,
        to: undefined
      },
      hasSubtasks: undefined,
      hasDependencies: undefined,
      smartFilters: [],
      operators: {
        status: 'OR',
        priority: 'OR',
        project: 'OR', 
        assignedTo: 'OR',
        tags: 'OR'
      }
    });
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.statuses.length > 0) count++;
    if (filters.priorities.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.hasSubtasks !== undefined) count++;
    if (filters.hasDependencies !== undefined) count++;
    if (filters.smartFilters.length > 0) count++;
    return count;
  }, [filters]);

  const loadFilter = useCallback((filterData: FilterState) => {
    setCustomFilteredTasks(null);
    setFilters(filterData);
  }, []);

  const setFilteredTasks = useCallback((tasks: Task[]) => {
    setCustomFilteredTasks(tasks);
  }, []);

  return {
    filters,
    updateFilter,
    filteredTasks,
    availableTags,
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter,
    setFilteredTasks
  };
};
