
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bookmark } from 'lucide-react';
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
      <div className="flex flex-wrap gap-2">
        {savedFilters.map((savedFilter) => (
          <Button
            key={savedFilter.id}
            variant="outline"
            size="sm"
            onClick={() => onLoadFilter(savedFilter.filter_data)}
            className="text-xs"
          >
            <Bookmark className="h-3 w-3 mr-1" />
            {savedFilter.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SavedFiltersSection;
