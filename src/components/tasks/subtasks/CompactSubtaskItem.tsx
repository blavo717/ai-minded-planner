
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import TaskLogIcon from '../TaskLogIcon';

interface CompactSubtaskItemProps {
  subtask: Task;
  microtasks: Task[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateTask: (data: any) => void;
  onDeleteTask: (id: string) => void;
  children?: React.ReactNode;
}

const CompactSubtaskItem = ({ 
  subtask, 
  microtasks, 
  isExpanded, 
  onToggleExpanded,
  onUpdateTask,
  onDeleteTask,
  children 
}: CompactSubtaskItemProps) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const completedMicrotasks = microtasks.filter(m => m.status === 'completed').length;

  const handleToggleComplete = (checked: boolean) => {
    onUpdateTask({
      id: subtask.id,
      status: checked ? 'completed' : 'pending',
      completed_at: checked ? new Date().toISOString() : null
    });
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Checkbox
            checked={subtask.status === 'completed'}
            onCheckedChange={handleToggleComplete}
            className="h-4 w-4"
          />
          
          {getStatusIcon(subtask.status)}
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate flex items-center gap-2">
              {subtask.title}
              {subtask.needs_followup && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  <Flag className="h-2 w-2 mr-1" />
                  Seguimiento
                </Badge>
              )}
            </h4>
            {subtask.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {subtask.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {microtasks.length > 0 && (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-xs">
                {completedMicrotasks}/{microtasks.length}
              </Badge>
            )}
            
            <TaskLogIcon taskId={subtask.id} />
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onToggleExpanded}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => onDeleteTask(subtask.id)}
                className="text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {children}
    </div>
  );
};

export default CompactSubtaskItem;
