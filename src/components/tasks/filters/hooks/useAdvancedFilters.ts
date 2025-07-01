
import { useCallback } from 'react';
import { FilterState } from '@/types/filters';

interface UseAdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter?: (name: string, filters: FilterState) => void;
  onLoadFilter?: (filters: FilterState) => void;
  saveFilter: (name: string, description: string, filterData: FilterState) => Promise<any>;
}

export const useAdvancedFilters = ({
  filters,
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  saveFilter
}: UseAdvancedFiltersProps) => {
  const handleArrayFilterChange = useCallback((key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[] || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [key]: newArray
    });
  }, [filters, onFiltersChange]);

  const handleSmartFilterChange = useCallback((filterId: string, checked: boolean) => {
    const currentFilters = filters.smartFilters || [];
    const newFilters = checked
      ? [...currentFilters, filterId]
      : currentFilters.filter(id => id !== filterId);
    
    onFiltersChange({
      ...filters,
      smartFilters: newFilters
    });
  }, [filters, onFiltersChange]);

  const handleOperatorChange = useCallback((filterType: keyof FilterState['operators'], operatorType: 'AND' | 'OR') => {
    onFiltersChange({
      ...filters,
      operators: {
        ...filters.operators,
        [filterType]: { type: operatorType }
      }
    });
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((type: 'from' | 'to', date?: Date) => {
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'dueDateFrom' : 'dueDateTo']: date
    });
  }, [filters, onFiltersChange]);

  const handleBooleanFilterChange = useCallback((key: keyof FilterState, value?: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
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
  }, [onFiltersChange]);

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

  const handleSaveFilterOperation = useCallback(async (name: string, description: string) => {
    if (onSaveFilter) {
      onSaveFilter(name, filters);
    } else {
      await saveFilter(name, description, filters);
    }
  }, [onSaveFilter, filters, saveFilter]);

  const handleLoadFilter = useCallback((filterData: FilterState) => {
    if (onLoadFilter) {
      onLoadFilter(filterData);
    } else {
      onFiltersChange(filterData);
    }
  }, [onLoadFilter, onFiltersChange]);

  return {
    handleArrayFilterChange,
    handleSmartFilterChange,
    handleOperatorChange,
    handleDateRangeChange,
    handleBooleanFilterChange,
    clearAllFilters,
    getActiveFiltersCount,
    handleSaveFilterOperation,
    handleLoadFilter
  };
};
