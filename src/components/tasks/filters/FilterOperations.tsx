
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bookmark, X } from 'lucide-react';
import { FilterState } from '@/types/filters';

interface FilterOperationsProps {
  activeFiltersCount: number;
  onSaveFilter: (name: string, description: string) => void;
}

const FilterOperations = ({ activeFiltersCount, onSaveFilter }: FilterOperationsProps) => {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [saveFilterDescription, setSaveFilterDescription] = useState('');

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter(saveFilterName.trim(), saveFilterDescription.trim());
      setSaveFilterName('');
      setSaveFilterDescription('');
      setShowSaveInput(false);
    }
  };

  const handleCancel = () => {
    setShowSaveInput(false);
    setSaveFilterName('');
    setSaveFilterDescription('');
  };

  if (activeFiltersCount === 0) return null;

  return (
    <div className="space-y-2 pt-4 border-t">
      {!showSaveInput ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveInput(true)}
          className="w-full"
        >
          <Bookmark className="h-3 w-3 mr-2" />
          Guardar Filtro Actual
        </Button>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="Nombre del filtro..."
            value={saveFilterName}
            onChange={(e) => setSaveFilterName(e.target.value)}
            className="text-sm"
          />
          <Input
            placeholder="Descripción (opcional)..."
            value={saveFilterDescription}
            onChange={(e) => setSaveFilterDescription(e.target.value)}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveFilter}>
              Guardar
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterOperations;
