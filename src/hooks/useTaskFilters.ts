
import { useState, useMemo } from 'react';
import { Task } from '@/hooks/useTasks';
import { FilterState } from '@/types/filters';
import { applySmartFilter } from '@/utils/smartFilters';

const initialFilterState: FilterState = {
  search: '',
  status: [],
  priority: [],
  projects: [],
  tags: [],
  assignedTo: [],
  dueDateFrom: undefined,
  dueDateTo: undefined,
  hasSubtasks: undefined,
  hasDependencies: undefined,
  smartFilters: [],
  operators: {
    status: { type: 'OR' },
    priority: { type: 'OR' },
    projects: { type: 'OR' },
    tags: { type: 'OR' },
    assignedTo: { type: 'OR' },
  }
};

export const useTaskFilters = (tasks: Task[], getSubtasksForTask: (taskId: string) => Task[]) => {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  const availableTags = useMemo(() => {
    return Array.from(
      new Set(
        tasks
          .filter(task => task.tags)
          .flatMap(task => task.tags || [])
      )
    );
  }, [tasks]);

  // Función auxiliar para aplicar filtros con operadores
  const applyArrayFilter = (
    taskValue: string | string[] | undefined | null,
    filterValues: string[],
    operator: 'AND' | 'OR'
  ): boolean => {
    if (filterValues.length === 0) return true;
    
    if (Array.isArray(taskValue)) {
      if (operator === 'AND') {
        return filterValues.every(filterValue => taskValue.includes(filterValue));
      } else {
        return filterValues.some(filterValue => taskValue.includes(filterValue));
      }
    } else {
      return taskValue ? filterValues.includes(taskValue) : false;
    }
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Aplicar filtros inteligentes primero
    if (filters.smartFilters.length > 0) {
      const smartFilteredTasks = new Set<Task>();
      filters.smartFilters.forEach(filterId => {
        const filtered = applySmartFilter(result, filterId);
        filtered.forEach(task => smartFilteredTasks.add(task));
      });
      result = Array.from(smartFilteredTasks);
    }

    // Aplicar filtros regulares
    result = result.filter((task) => {
      // Filtro de búsqueda
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchInTask = task.title.toLowerCase().includes(searchLower) ||
                           task.description?.toLowerCase().includes(searchLower);
        
        if (!searchInTask) {
          // Buscar también en subtareas
          const subtasks = getSubtasksForTask(task.id);
          const searchInSubtasks = subtasks.some(subtask => 
            subtask.title.toLowerCase().includes(searchLower) ||
            subtask.description?.toLowerCase().includes(searchLower)
          );
          if (!searchInSubtasks) return false;
        }
      }

      // Filtros con operadores
      if (!applyArrayFilter(task.status, filters.status, filters.operators.status.type)) {
        return false;
      }

      if (!applyArrayFilter(task.priority, filters.priority, filters.operators.priority.type)) {
        return false;
      }

      if (!applyArrayFilter(task.project_id, filters.projects, filters.operators.projects.type)) {
        return false;
      }

      if (!applyArrayFilter(task.tags, filters.tags, filters.operators.tags.type)) {
        return false;
      }

      // Filtros de fecha
      if (filters.dueDateFrom && task.due_date) {
        if (new Date(task.due_date) < filters.dueDateFrom) {
          return false;
        }
      }
      if (filters.dueDateTo && task.due_date) {
        if (new Date(task.due_date) > filters.dueDateTo) {
          return false;
        }
      }

      // Filtros booleanos
      if (filters.hasSubtasks !== undefined) {
        const hasSubtasks = getSubtasksForTask(task.id).length > 0;
        if (filters.hasSubtasks !== hasSubtasks) {
          return false;
        }
      }

      return true;
    });

    return result;
  }, [tasks, filters, getSubtasksForTask]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateOperator = (filterType: keyof FilterState['operators'], operatorType: 'AND' | 'OR') => {
    setFilters(prev => ({
      ...prev,
      operators: {
        ...prev.operators,
        [filterType]: { type: operatorType }
      }
    }));
  };

  const clearAllFilters = () => {
    setFilters(initialFilterState);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.projects.length > 0) count++;
    if (filters.tags.length > 0) count++;
    if (filters.assignedTo.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.hasSubtasks !== undefined) count++;
    if (filters.hasDependencies !== undefined) count++;
    if (filters.smartFilters.length > 0) count++;
    return count;
  };

  const loadFilter = (savedFilter: FilterState) => {
    setFilters(savedFilter);
  };

  return {
    filters,
    setFilters,
    updateFilter,
    updateOperator,
    filteredTasks,
    availableTags,
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter
  };
};
