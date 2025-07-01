
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, RotateCcw } from 'lucide-react';

interface AdvancedFiltersHeaderProps {
  activeFiltersCount: number;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onClearFilters: () => void;
}

const AdvancedFiltersHeader = ({ 
  activeFiltersCount, 
  isExpanded, 
  onToggleExpanded, 
  onClearFilters 
}: AdvancedFiltersHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros Avanzados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </span>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpanded}
          >
            {isExpanded ? 'Contraer' : 'Expandir'}
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default AdvancedFiltersHeader;
