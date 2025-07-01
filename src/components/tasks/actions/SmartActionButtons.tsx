
import React from 'react';
import { IntelligentAction } from '@/types/intelligent-actions';
import { CreateSubtaskButton } from './CreateSubtaskButton';
import { CreateReminderButton } from './CreateReminderButton';
import { DraftEmailButton } from './DraftEmailButton';
import { Task } from '@/hooks/useTasks';

interface SmartActionButtonsProps {
  task: Task;
  actions: IntelligentAction[];
  onActionComplete?: (actionType: string) => void;
  className?: string;
}

export function SmartActionButtons({ 
  task, 
  actions, 
  onActionComplete,
  className = '' 
}: SmartActionButtonsProps) {
  if (!actions || actions.length === 0) {
    return null;
  }

  const handleActionComplete = (actionType: string) => {
    onActionComplete?.(actionType);
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {actions.map((action) => {
        switch (action.type) {
          case 'create_subtask':
            return (
              <CreateSubtaskButton
                key={action.id}
                task={task}
                action={action}
                onComplete={() => handleActionComplete('create_subtask')}
              />
            );
          case 'create_reminder':
            return (
              <CreateReminderButton
                key={action.id}
                task={task}
                action={action}
                onComplete={() => handleActionComplete('create_reminder')}
              />
            );
          case 'draft_email':
            return (
              <DraftEmailButton
                key={action.id}
                task={task}
                action={action}
                onComplete={() => handleActionComplete('draft_email')}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
