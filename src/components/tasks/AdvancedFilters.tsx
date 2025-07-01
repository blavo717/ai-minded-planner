
import React from 'react';
import AdvancedFiltersMain from './filters/AdvancedFiltersMain';
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

const AdvancedFilters = (props: AdvancedFiltersProps) => {
  return <AdvancedFiltersMain {...props} />;
};

export default AdvancedFilters;
