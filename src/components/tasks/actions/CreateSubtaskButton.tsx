
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { IntelligentAction } from '@/types/intelligent-actions';
import { Task } from '@/hooks/useTasks';
import { useTaskHierarchy } from '@/hooks/useTaskHierarchy';
import { useToast } from '@/hooks/use-toast';

interface CreateSubtaskButtonProps {
  task: Task;
  action: IntelligentAction;
  onComplete?: () => void;
}

export function CreateSubtaskButton({ task, action, onComplete }: CreateSubtaskButtonProps) {
  const { createSubtask } = useTaskHierarchy();
  const { toast } = useToast();

  const handleCreateSubtask = () => {
    const suggestedTitle = action.suggestedData.title || 
      `Subtarea para: ${task.title.slice(0, 30)}...`;

    createSubtask(
      { 
        parentTaskId: task.id, 
        title: suggestedTitle 
      },
      {
        onSuccess: () => {
          toast({
            title: 'Subtarea creada',
            description: `Se creó: ${suggestedTitle}`,
          });
          onComplete?.();
        },
        onError: (error) => {
          toast({
            title: 'Error al crear subtarea',
            description: error.message,
            variant: 'destructive',
          });
        }
      }
    );
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleCreateSubtask}
      className="flex items-center gap-1 text-xs border-blue-200 hover:bg-blue-50 hover:border-blue-300"
    >
      <Plus className="h-3 w-3" />
      {action.label}
    </Button>
  );
}
