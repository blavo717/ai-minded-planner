
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SubtaskHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  completedCount: number;
  totalCount: number;
}

const SubtaskHeader = ({ isExpanded, onToggle, completedCount, totalCount }: SubtaskHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Subtareas
        <Badge variant="outline" className="ml-2">
          {completedCount}/{totalCount}
        </Badge>
      </Button>
    </div>
  );
};

export default SubtaskHeader;
