
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterState } from '@/types/filters';

interface StatusFilterProps {
  selectedStatuses: string[];
  operator: 'AND' | 'OR';
  onStatusChange: (status: string, checked: boolean) => void;
  onOperatorChange: (operator: 'AND' | 'OR') => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'in_progress', label: 'En Progreso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' }
];

const StatusFilter = ({ selectedStatuses, operator, onStatusChange, onOperatorChange }: StatusFilterProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Estados</Label>
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
        {statusOptions.map((status) => (
          <div key={status.value} className="flex items-center space-x-2">
            <Checkbox
              id={`status-${status.value}`}
              checked={selectedStatuses.includes(status.value)}
              onCheckedChange={(checked) => onStatusChange(status.value, checked as boolean)}
            />
            <Label htmlFor={`status-${status.value}`} className="text-sm font-normal">
              {status.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;
