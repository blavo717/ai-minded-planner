
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { FilterState } from '@/types/filters';

interface SavedFilter {
  id: string;
  name: string;
  filter_data: FilterState;
}

interface SavedFilterButtonProps {
  savedFilter: SavedFilter;
  onLoadFilter: (filterData: FilterState) => void;
}

const SavedFilterButton = ({ savedFilter, onLoadFilter }: SavedFilterButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLoadFilter(savedFilter.filter_data)}
      className="text-xs"
    >
      <Bookmark className="h-3 w-3 mr-1" />
      {savedFilter.name}
    </Button>
  );
};

export default SavedFilterButton;
