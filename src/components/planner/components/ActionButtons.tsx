import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Clock } from 'lucide-react';

interface ActionButtonsProps {
  onWorkOnTask: () => void;
  onSkipTask: () => void;
  onRemindLater?: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onWorkOnTask,
  onSkipTask,
  onRemindLater
}) => {
  return (
    <div className="space-y-2">
      <Button 
        onClick={onWorkOnTask}
        className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
      >
        <Play className="w-5 h-5 mr-2" />
        🚀 Empezar a trabajar
      </Button>
      
      <div className="flex gap-2">
        <Button 
          onClick={onSkipTask}
          variant="outline"
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Ver siguiente
        </Button>
        
        <Button 
          onClick={onRemindLater}
          variant="ghost"
          className="flex-1 text-xs"
        >
          <Clock className="w-4 h-4 mr-1" />
          No ahora (30 min)
        </Button>
      </div>
    </div>
  );
};