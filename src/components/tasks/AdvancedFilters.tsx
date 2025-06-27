
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FilterState } from '@/types/filters';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import FilterHeader from './filters/FilterHeader';
import SmartFiltersSection from './filters/SmartFiltersSection';
import SavedFiltersSection from './filters/SavedFiltersSection';
import StatusFilter from './filters/StatusFilter';
import PriorityFilter from './filters/PriorityFilter';
import ProjectsFilter from './filters/ProjectsFilter';
import AssignedToFilter from './filters/AssignedToFilter';
import TagsFilter from './filters/TagsFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import CharacteristicsFilter from './filters/CharacteristicsFilter';
import FilterOperations from './filters/FilterOperations';

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
}

interface AdvancedFiltersProps {
  projects: Project[];
  profiles: Profile[];
  availableTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter?: (name: string, filters: FilterState) => void;
  onLoadFilter?: (filters: FilterState) => void;
  taskAssignments?: any[];
  taskDependencies?: any[];
}

const AdvancedFilters = ({ 
  projects, 
  profiles,
  availableTags, 
  filters, 
  onFiltersChange,
  onSaveFilter,
  onLoadFilter
}: AdvancedFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { savedFilters, saveFilter, loading } = useSavedFilters();

  useEffect(() => {
    const defaultFilter = savedFilters.find(filter => filter.is_default);
    if (defaultFilter && onLoadFilter) {
      onLoadFilter(defaultFilter.filter_data);
    }
  }, [savedFilters, onLoadFilter]);

  const handleArrayFilterChange = (key: keyof FilterState, value: string, checked: boolean) => {
    const currentArray = filters[key] as string[] || [];
    const newArray = checked 
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    
    onFiltersChange({
      ...filters,
      [key]: newArray
    });
  };

  const handleSmartFilterChange = (filterId: string, checked: boolean) => {
    const currentFilters = filters.smartFilters || [];
    const newFilters = checked
      ? [...currentFilters, filterId]
      : currentFilters.filter(id => id !== filterId);
    
    onFiltersChange({
      ...filters,
      smartFilters: newFilters
    });
  };

  const handleOperatorChange = (filterType: keyof FilterState['operators'], operatorType: 'AND' | 'OR') => {
    onFiltersChange({
      ...filters,
      operators: {
        ...filters.operators,
        [filterType]: { type: operatorType }
      }
    });
  };

  const handleDateRangeChange = (type: 'from' | 'to', date?: Date) => {
    onFiltersChange({
      ...filters,
      [type === 'from' ? 'dueDateFrom' : 'dueDateTo']: date
    });
  };

  const handleBooleanFilterChange = (key: keyof FilterState, value?: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
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
  };

  const getActiveFiltersCount = () => {
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
  };

  const handleSaveFilterOperation = async (name: string, description: string) => {
    if (onSaveFilter) {
      onSaveFilter(name, filters);
    } else {
      await saveFilter(name, description, filters);
    }
  };

  const handleLoadFilter = (filterData: FilterState) => {
    if (onLoadFilter) {
      onLoadFilter(filterData);
    } else {
      onFiltersChange(filterData);
    }
  };

  return (
    <Card>
      <FilterHeader
        activeFiltersCount={getActiveFiltersCount()}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        onClearFilters={clearAllFilters}
      />
      
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="Buscar tareas..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          />
        </div>

        <SmartFiltersSection
          selectedFilters={filters.smartFilters || []}
          onFilterChange={handleSmartFilterChange}
        />

        <SavedFiltersSection
          savedFilters={savedFilters}
          loading={loading}
          onLoadFilter={handleLoadFilter}
        />

        {isExpanded && (
          <div className="space-y-6">
            <StatusFilter
              selectedStatuses={filters.status}
              operator={filters.operators.status.type}
              onStatusChange={(status, checked) => handleArrayFilterChange('status', status, checked)}
              onOperatorChange={(operator) => handleOperatorChange('status', operator)}
            />

            <PriorityFilter
              selectedPriorities={filters.priority}
              operator={filters.operators.priority.type}
              onPriorityChange={(priority, checked) => handleArrayFilterChange('priority', priority, checked)}
              onOperatorChange={(operator) => handleOperatorChange('priority', operator)}
            />

            <ProjectsFilter
              projects={projects}
              selectedProjects={filters.projects}
              operator={filters.operators.projects.type}
              onProjectChange={(projectId, checked) => handleArrayFilterChange('projects', projectId, checked)}
              onOperatorChange={(operator) => handleOperatorChange('projects', operator)}
            />

            <AssignedToFilter
              profiles={profiles}
              selectedAssignees={filters.assignedTo}
              operator={filters.operators.assignedTo.type}
              onAssigneeChange={(profileId, checked) => handleArrayFilterChange('assignedTo', profileId, checked)}
              onOperatorChange={(operator) => handleOperatorChange('assignedTo', operator)}
            />

            <TagsFilter
              availableTags={availableTags}
              selectedTags={filters.tags}
              operator={filters.operators.tags.type}
              onTagChange={(tag, checked) => handleArrayFilterChange('tags', tag, checked)}
              onOperatorChange={(operator) => handleOperatorChange('tags', operator)}
            />

            <DateRangeFilter
              dueDateFrom={filters.dueDateFrom}
              dueDateTo={filters.dueDateTo}
              onDateFromChange={(date) => handleDateRangeChange('from', date)}
              onDateToChange={(date) => handleDateRangeChange('to', date)}
            />

            <CharacteristicsFilter
              hasSubtasks={filters.hasSubtasks}
              hasDependencies={filters.hasDependencies}
              onSubtasksChange={(value) => handleBooleanFilterChange('hasSubtasks', value)}
              onDependenciesChange={(value) => handleBooleanFilterChange('hasDependencies', value)}
            />

            <FilterOperations
              activeFiltersCount={getActiveFiltersCount()}
              onSaveFilter={handleSaveFilterOperation}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFilters;
