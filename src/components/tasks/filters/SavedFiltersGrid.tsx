
import React from 'react';
import SavedFilterButton from './SavedFilterButton';
import { FilterState } from '@/types/filters';

interface SavedFilter {
  id: string;
  name: string;
  filter_data: FilterState;
}

interface SavedFiltersGridProps {
  savedFilters: SavedFilter[];
  onLoadFilter: (filterData: FilterState) => void;
}

const SavedFiltersGrid = ({ savedFilters, onLoadFilter }: SavedFiltersGridProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {savedFilters.map((savedFilter) => (
        <SavedFilterButton
          key={savedFilter.id}
          savedFilter={savedFilter}
          onLoadFilter={onLoadFilter}
        />
      ))}
    </div>
  );
};

export default SavedFiltersGrid;
