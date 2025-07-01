
import React from 'react';
import { Label } from '@/components/ui/label';
import SavedFiltersGrid from './SavedFiltersGrid';
import { FilterState } from '@/types/filters';

interface SavedFilter {
  id: string;
  name: string;
  filter_data: FilterState;
}

interface SavedFiltersSectionProps {
  savedFilters: SavedFilter[];
  loading: boolean;
  onLoadFilter: (filterData: FilterState) => void;
}

const SavedFiltersSection = ({ savedFilters, loading, onLoadFilter }: SavedFiltersSectionProps) => {
  if (loading || savedFilters.length === 0) return null;

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Filtros Guardados</Label>
      <SavedFiltersGrid 
        savedFilters={savedFilters}
        onLoadFilter={onLoadFilter}
      />
    </div>
  );
};

export default SavedFiltersSection;
