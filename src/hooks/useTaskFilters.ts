
import { useState, useMemo } from 'react';
import { Task } from '@/hooks/useTasks';
import { FilterState } from '@/types/filters';
import { useDebounce } from './useDebounce';
import { useTaskFilterOperations } from './filters/useTaskFilterOperations';
import { applyTaskFilters } from '@/utils/taskFilterUtils';

const DEFAULT_FILTERS: FilterState = {
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

export const useTaskFilters = (
  tasks: Task[],
  getSubtasksForTask: (taskId: string) => Task[],
  taskAssignments: any[] = [],
  taskDependencies: any[] = []
) => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Aplicar debouncing al filtro de búsqueda
  const debouncedSearch = useDebounce(filters.search, 300);

  const {
    updateFilter,
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter
  } = useTaskFilterOperations(filters, setFilters);

  // Memoizar el filtrado de tareas
  const filteredTasks = useMemo(() => {
    return applyTaskFilters(
      tasks,
      filters,
      debouncedSearch,
      getSubtasksForTask,
      taskAssignments,
      taskDependencies
    );
  }, [tasks, filters, debouncedSearch, getSubtasksForTask, taskAssignments, taskDependencies]);

  // Memoizar las etiquetas disponibles
  const availableTags = useMemo(() => {
    const allTags = tasks.flatMap(task => task.tags || []);
    return [...new Set(allTags)];
  }, [tasks]);

  return {
    filters,
    setFilters,
    updateFilter,
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter,
    filteredTasks,
    availableTags
  };
};
