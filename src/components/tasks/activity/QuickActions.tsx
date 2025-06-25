
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Flag } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskActivity } from '@/hooks/useTaskActivity';

interface QuickActionsProps {
  task: Task;
}

const QuickActions = ({ task }: QuickActionsProps) => {
  const { markAsWorked, toggleFollowup, isUpdating } = useTaskActivity();

  const handleMarkAsWorked = () => {
    markAsWorked(task.id);
  };

  const handleToggleFollowup = () => {
    toggleFollowup(task.id, !task.needs_followup);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleMarkAsWorked}
        disabled={isUpdating}
        className="flex items-center gap-1"
      >
        <CheckCircle className="h-3 w-3" />
        Trabajado hoy
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggleFollowup}
        disabled={isUpdating}
        className={`flex items-center gap-1 ${task.needs_followup ? 'bg-orange-50 text-orange-700' : ''}`}
      >
        <Flag className="h-3 w-3" />
        {task.needs_followup ? 'Quitar seguimiento' : 'Necesita seguimiento'}
      </Button>
    </div>
  );
};

export default QuickActions;
