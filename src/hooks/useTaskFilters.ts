
import { useState, useMemo, useCallback } from 'react';
import { Task } from './useTasks';
import { TaskAssignment } from './useTaskAssignments';
import { TaskDependency } from './useTaskDependencies';
import { FilterState } from '@/types/filters';
import { applyTaskFilters } from '@/utils/taskFilterUtils';

export const useTaskFilters = (
  tasks: Task[],
  getSubtasksForTask: (taskId: string) => Task[],
  taskAssignments: TaskAssignment[],
  taskDependencies: TaskDependency[]
) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    projects: [],
    assignedTo: [],
    tags: [],
    dueDateFrom: undefined,
    dueDateTo: undefined,
    hasSubtasks: undefined,
    hasDependencies: undefined,
    smartFilters: [],
    operators: {
      status: { type: 'OR' },
      priority: { type: 'OR' }, 
      projects: { type: 'OR' },
      assignedTo: { type: 'OR' },
      tags: { type: 'OR' }
    }
  });

  const [customFilteredTasks, setCustomFilteredTasks] = useState<Task[] | null>(null);

  const filteredTasks = useMemo(() => {
    // Si hay tareas personalizadas (por ejemplo, de búsqueda semántica), usar esas
    if (customFilteredTasks) {
      return customFilteredTasks;
    }

    return applyTaskFilters(tasks, filters, filters.search, getSubtasksForTask, taskAssignments, taskDependencies);
  }, [tasks, filters, getSubtasksForTask, taskAssignments, taskDependencies, customFilteredTasks]);

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
      search: '',
      status: [],
      priority: [],
      projects: [],
      assignedTo: [],
      tags: [],
      dueDateFrom: undefined,
      dueDateTo: undefined,
      hasSubtasks: undefined,
      hasDependencies: undefined,
      smartFilters: [],
      operators: {
        status: { type: 'OR' },
        priority: { type: 'OR' },
        projects: { type: 'OR' }, 
        assignedTo: { type: 'OR' },
        tags: { type: 'OR' }
      }
    });
  }, []);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
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
