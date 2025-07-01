
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';

interface AdvancedFiltersSearchProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const AdvancedFiltersSearch = ({ searchValue, onSearchChange }: AdvancedFiltersSearchProps) => {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-primary">Buscar Tareas</Label>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-7 h-8 text-xs border-primary/20 focus:border-primary"
        />
      </div>
    </div>
  );
};

export default AdvancedFiltersSearch;
