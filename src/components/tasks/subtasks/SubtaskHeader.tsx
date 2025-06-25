
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SubtaskHeaderProps {
  isExpanded: boolean;
  onToggle: () => void;
  completedCount: number;
  totalCount: number;
}

const SubtaskHeader = ({ isExpanded, onToggle, completedCount, totalCount }: SubtaskHeaderProps) => {
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        Subtareas ({completedCount}/{totalCount})
      </CardTitle>
      
      {totalCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
          <div className="w-20 h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskHeader;
