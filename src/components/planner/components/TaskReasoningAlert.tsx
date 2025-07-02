import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain } from 'lucide-react';

interface TaskReasoningAlertProps {
  reasoning: string;
}

export const TaskReasoningAlert: React.FC<TaskReasoningAlertProps> = ({ reasoning }) => {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <Brain className="w-4 h-4" />
      <AlertDescription className="text-primary font-medium">
        <span className="font-semibold">Por qué AHORA es perfecto:</span> {reasoning}
      </AlertDescription>
    </Alert>
  );
};