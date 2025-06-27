
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PriorityFilterProps {
  selectedPriorities: string[];
  operator: 'AND' | 'OR';
  onPriorityChange: (priority: string, checked: boolean) => void;
  onOperatorChange: (operator: 'AND' | 'OR') => void;
}

const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'bg-green-500' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgente', color: 'bg-red-500' }
];

const PriorityFilter = ({ selectedPriorities, operator, onPriorityChange, onOperatorChange }: PriorityFilterProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Prioridades</Label>
        <Select value={operator} onValueChange={onOperatorChange}>
          <SelectTrigger className="w-20 h-6 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OR">O</SelectItem>
            <SelectItem value="AND">Y</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {priorityOptions.map((priority) => (
          <div key={priority.value} className="flex items-center space-x-2">
            <Checkbox
              id={`priority-${priority.value}`}
              checked={selectedPriorities.includes(priority.value)}
              onCheckedChange={(checked) => onPriorityChange(priority.value, checked as boolean)}
            />
            <Label htmlFor={`priority-${priority.value}`} className="text-sm font-normal flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${priority.color}`} />
              {priority.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriorityFilter;
