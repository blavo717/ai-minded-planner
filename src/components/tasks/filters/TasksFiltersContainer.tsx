
import React from 'react';
import AdvancedFilters from '@/components/tasks/AdvancedFilters';
import { FilterState } from '@/types/filters';

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

interface TasksFiltersContainerProps {
  projects: Project[];
  profiles: Profile[];
  availableTags: string[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSaveFilter: (name: string, filterData: FilterState) => void;
  onLoadFilter: (filters: FilterState) => void;
  taskAssignments: any[];
  taskDependencies: any[];
}

const TasksFiltersContainer = ({
  projects,
  profiles,
  availableTags,
  filters,
  onFiltersChange,
  onSaveFilter,
  onLoadFilter,
  taskAssignments,
  taskDependencies
}: TasksFiltersContainerProps) => {
  return (
    <AdvancedFilters
      projects={projects}
      profiles={profiles}
      availableTags={availableTags}
      filters={filters}
      onFiltersChange={onFiltersChange}
      onSaveFilter={onSaveFilter}
      onLoadFilter={onLoadFilter}
      taskAssignments={taskAssignments}
      taskDependencies={taskDependencies}
    />
  );
};

export default TasksFiltersContainer;
