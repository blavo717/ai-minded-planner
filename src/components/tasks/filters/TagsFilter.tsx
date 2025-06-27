
import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag } from 'lucide-react';

interface TagsFilterProps {
  availableTags: string[];
  selectedTags: string[];
  operator: 'AND' | 'OR';
  onTagChange: (tag: string, checked: boolean) => void;
  onOperatorChange: (operator: 'AND' | 'OR') => void;
}

const TagsFilter = ({ 
  availableTags, 
  selectedTags, 
  operator, 
  onTagChange, 
  onOperatorChange 
}: TagsFilterProps) => {
  if (availableTags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Etiquetas</Label>
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
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {availableTags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer text-xs flex items-center gap-1"
            onClick={() => onTagChange(tag, !selectedTags.includes(tag))}
          >
            <Tag className="h-2 w-2" />
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsFilter;
