
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { List, LayoutGrid, Clock, Calendar, Grid3X3 } from 'lucide-react';
import { ListTree } from 'lucide-react';

interface TaskViewControlsProps {
  viewMode: 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower' | 'tree';
  onViewModeChange: (mode: 'list' | 'kanban' | 'timeline' | 'calendar' | 'eisenhower' | 'tree') => void;
  taskCount: number;
}

const TaskViewControls = ({ viewMode, onViewModeChange, taskCount }: TaskViewControlsProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4 mr-2" />
          Lista
        </Button>
        <Button
          variant={viewMode === 'tree' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('tree')}
        >
          <ListTree className="h-4 w-4 mr-2" />
          Árbol
        </Button>
        <Button
          variant={viewMode === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('kanban')}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          Kanban
        </Button>
        <Button
          variant={viewMode === 'timeline' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('timeline')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Timeline
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('calendar')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Calendario
        </Button>
        <Button
          variant={viewMode === 'eisenhower' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('eisenhower')}
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Eisenhower
        </Button>
      </div>
      
      <Badge variant="outline">
        {taskCount} tareas
      </Badge>
    </div>
  );
};

export default TaskViewControls;
