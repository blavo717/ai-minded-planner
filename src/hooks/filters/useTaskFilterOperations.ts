
import { useCallback } from 'react';
import { FilterState } from '@/types/filters';

export const useTaskFilterOperations = (
  filters: FilterState,
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
) => {
  const updateFilter = useCallback((key: keyof FilterState | string, value: any) => {
    if (key.includes('.')) {
      const [parentKey, childKey] = key.split('.');
      setFilters(prev => ({
        ...prev,
        [parentKey]: {
          ...(prev[parentKey as keyof FilterState] as object),
          [childKey]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  }, [setFilters]);

  const clearAllFilters = useCallback(() => {
    setFilters({
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
    });
  }, [setFilters]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status?.length > 0) count++;
    if (filters.priority?.length > 0) count++;
    if (filters.projects?.length > 0) count++;
    if (filters.tags?.length > 0) count++;
    if (filters.assignedTo?.length > 0) count++;
    if (filters.dueDateFrom || filters.dueDateTo) count++;
    if (filters.hasSubtasks !== undefined) count++;
    if (filters.hasDependencies !== undefined) count++;
    if (filters.smartFilters?.length > 0) count++;
    return count;
  }, [filters]);

  const loadFilter = useCallback((filterData: FilterState) => {
    setFilters(filterData);
  }, [setFilters]);

  return {
    updateFilter,
    clearAllFilters,
    getActiveFiltersCount,
    loadFilter
  };
};
