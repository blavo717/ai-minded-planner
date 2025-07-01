
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FilterState } from '@/types/filters';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import { useAdvancedFilters } from './hooks/useAdvancedFilters';
import AdvancedFiltersHeader from './AdvancedFiltersHeader';
import AdvancedFiltersSearch from './AdvancedFiltersSearch';
import SmartFiltersSection from './SmartFiltersSection';
import SavedFiltersSection from './SavedFiltersSection';
import AdvancedFiltersContent from './AdvancedFiltersContent';

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

interface AdvancedFiltersMainProps {
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

const AdvancedFiltersMain = ({ 
  projects, 
  profiles,
  availableTags, 
  filters, 
  onFiltersChange,
  onSaveFilter,
  onLoadFilter
}: AdvancedFiltersMainProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { savedFilters, saveFilter, loading } = useSavedFilters();
  
  const {
    handleArrayFilterChange,
    handleSmartFilterChange,
    handleOperatorChange,
    handleDateRangeChange,
    handleBooleanFilterChange,
    clearAllFilters,
    getActiveFiltersCount,
    handleSaveFilterOperation,
    handleLoadFilter
  } = useAdvancedFilters({
    filters,
    onFiltersChange,
    onSaveFilter,
    onLoadFilter,
    saveFilter
  });

  useEffect(() => {
    const defaultFilter = savedFilters.find(filter => filter.is_default);
    if (defaultFilter && onLoadFilter) {
      onLoadFilter(defaultFilter.filter_data);
    }
  }, [savedFilters, onLoadFilter]);

  return (
    <Card className="w-48">
      <AdvancedFiltersHeader
        activeFiltersCount={getActiveFiltersCount()}
        isExpanded={isExpanded}
        onToggleExpanded={() => setIsExpanded(!isExpanded)}
        onClearFilters={clearAllFilters}
      />
      
      <CardContent className="space-y-3 p-3">
        <AdvancedFiltersSearch
          searchValue={filters.search}
          onSearchChange={(value) => onFiltersChange({ ...filters, search: value })}
        />

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
          <AdvancedFiltersContent
            projects={projects}
            profiles={profiles}
            availableTags={availableTags}
            filters={filters}
            activeFiltersCount={getActiveFiltersCount()}
            onArrayFilterChange={handleArrayFilterChange}
            onOperatorChange={handleOperatorChange}
            onDateRangeChange={handleDateRangeChange}
            onBooleanFilterChange={handleBooleanFilterChange}
            onSaveFilter={handleSaveFilterOperation}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AdvancedFiltersMain;
