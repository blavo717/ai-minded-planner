
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface CharacteristicsFilterProps {
  hasSubtasks?: boolean;
  hasDependencies?: boolean;
  onSubtasksChange: (value?: boolean) => void;
  onDependenciesChange: (value?: boolean) => void;
}

const CharacteristicsFilter = ({
  hasSubtasks,
  hasDependencies,
  onSubtasksChange,
  onDependenciesChange
}: CharacteristicsFilterProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Características</Label>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasSubtasks"
            checked={hasSubtasks === true}
            onCheckedChange={(checked) => onSubtasksChange(checked ? true : undefined)}
          />
          <Label htmlFor="hasSubtasks" className="text-sm font-normal">
            Con subtareas
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasDependencies"
            checked={hasDependencies === true}
            onCheckedChange={(checked) => onDependenciesChange(checked ? true : undefined)}
          />
          <Label htmlFor="hasDependencies" className="text-sm font-normal">
            Con dependencias
          </Label>
        </div>
      </div>
    </div>
  );
};

export default CharacteristicsFilter;
