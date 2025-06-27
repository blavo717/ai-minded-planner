
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Profile {
  id: string;
  full_name?: string;
  email?: string;
}

interface AssignedToFilterProps {
  profiles: Profile[];
  selectedAssignees: string[];
  operator: 'AND' | 'OR';
  onAssigneeChange: (profileId: string, checked: boolean) => void;
  onOperatorChange: (operator: 'AND' | 'OR') => void;
}

const AssignedToFilter = ({ 
  profiles, 
  selectedAssignees, 
  operator, 
  onAssigneeChange, 
  onOperatorChange 
}: AssignedToFilterProps) => {
  if (profiles.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Personas Asignadas</Label>
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
      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
        {profiles.map((profile) => (
          <div key={profile.id} className="flex items-center space-x-2">
            <Checkbox
              id={`assignedTo-${profile.id}`}
              checked={selectedAssignees.includes(profile.id)}
              onCheckedChange={(checked) => onAssigneeChange(profile.id, checked as boolean)}
            />
            <Label htmlFor={`assignedTo-${profile.id}`} className="text-sm font-normal">
              {profile.full_name || profile.email}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedToFilter;
