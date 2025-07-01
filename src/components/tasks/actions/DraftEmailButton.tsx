
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { IntelligentAction } from '@/types/intelligent-actions';
import { Task } from '@/hooks/useTasks';
import { DraftEmailModal } from './DraftEmailModal';

interface DraftEmailButtonProps {
  task: Task;
  action: IntelligentAction;
  onComplete?: () => void;
}

export function DraftEmailButton({ task, action, onComplete }: DraftEmailButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEmailGenerated = () => {
    setIsModalOpen(false);
    onComplete?.();
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1 text-xs border-green-200 hover:bg-green-50 hover:border-green-300"
      >
        <Mail className="h-3 w-3" />
        {action.label}
      </Button>

      <DraftEmailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={task}
        action={action}
        onEmailGenerated={handleEmailGenerated}
      />
    </>
  );
}
