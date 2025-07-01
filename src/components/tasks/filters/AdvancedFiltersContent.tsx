
import React from 'react';
import { FilterState } from '@/types/filters';
import StatusFilter from './StatusFilter';
import PriorityFilter from './PriorityFilter';
import ProjectsFilter from './ProjectsFilter';
import AssignedToFilter from './AssignedToFilter';
import TagsFilter from './TagsFilter';
import DateRangeFilter from './DateRangeFilter';
import CharacteristicsFilter from './CharacteristicsFilter';
import FilterOperations from './FilterOperations';

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

interface AdvancedFiltersContentProps {
  projects: Project[];
  profiles: Profile[];
  availableTags: string[];
  filters: FilterState;
  activeFiltersCount: number;
  onArrayFilterChange: (key: keyof FilterState, value: string, checked: boolean) => void;
  onOperatorChange: (filterType: keyof FilterState['operators'], operatorType: 'AND' | 'OR') => void;
  onDateRangeChange: (type: 'from' | 'to', date?: Date) => void;
  onBooleanFilterChange: (key: keyof FilterState, value?: boolean) => void;
  onSaveFilter: (name: string, description: string) => void;
}

const AdvancedFiltersContent = ({
  projects,
  profiles,
  availableTags,
  filters,
  activeFiltersCount,
  onArrayFilterChange,
  onOperatorChange,
  onDateRangeChange,
  onBooleanFilterChange,
  onSaveFilter
}: AdvancedFiltersContentProps) => {
  return (
    <div className="space-y-4">
      <StatusFilter
        selectedStatuses={filters.status}
        operator={filters.operators.status.type}
        onStatusChange={(status, checked) => onArrayFilterChange('status', status, checked)}
        onOperatorChange={(operator) => onOperatorChange('status', operator)}
      />

      <PriorityFilter
        selectedPriorities={filters.priority}
        operator={filters.operators.priority.type}
        onPriorityChange={(priority, checked) => onArrayFilterChange('priority', priority, checked)}
        onOperatorChange={(operator) => onOperatorChange('priority', operator)}
      />

      <ProjectsFilter
        projects={projects}
        selectedProjects={filters.projects}
        operator={filters.operators.projects.type}
        onProjectChange={(projectId, checked) => onArrayFilterChange('projects', projectId, checked)}
        onOperatorChange={(operator) => onOperatorChange('projects', operator)}
      />

      <AssignedToFilter
        profiles={profiles}
        selectedAssignees={filters.assignedTo}
        operator={filters.operators.assignedTo.type}
        onAssigneeChange={(profileId, checked) => onArrayFilterChange('assignedTo', profileId, checked)}
        onOperatorChange={(operator) => onOperatorChange('assignedTo', operator)}
      />

      <TagsFilter
        availableTags={availableTags}
        selectedTags={filters.tags}
        operator={filters.operators.tags.type}
        onTagChange={(tag, checked) => onArrayFilterChange('tags', tag, checked)}
        onOperatorChange={(operator) => onOperatorChange('tags', operator)}
      />

      <DateRangeFilter
        dueDateFrom={filters.dueDateFrom}
        dueDateTo={filters.dueDateTo}
        onDateFromChange={(date) => onDateRangeChange('from', date)}
        onDateToChange={(date) => onDateRangeChange('to', date)}
      />

      <CharacteristicsFilter
        hasSubtasks={filters.hasSubtasks}
        hasDependencies={filters.hasDependencies}
        onSubtasksChange={(value) => onBooleanFilterChange('hasSubtasks', value)}
        onDependenciesChange={(value) => onBooleanFilterChange('hasDependencies', value)}
      />

      <FilterOperations
        activeFiltersCount={activeFiltersCount}
        onSaveFilter={onSaveFilter}
      />
    </div>
  );
};

export default AdvancedFiltersContent;
