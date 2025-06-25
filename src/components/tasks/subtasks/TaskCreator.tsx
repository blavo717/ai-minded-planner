
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface TaskCreatorProps {
  placeholder: string;
  buttonText: string;
  onCreateTask: () => void;
  size?: 'sm' | 'default';
}

const TaskCreator = ({ placeholder, buttonText, onCreateTask, size = 'default' }: TaskCreatorProps) => {
  return (
    <Button
      variant={size === 'sm' ? 'outline' : 'outline'}
      size={size}
      onClick={onCreateTask}
      className={
        size === 'sm' 
          ? 'w-full text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-300 justify-start' 
          : 'w-full flex items-center gap-2'
      }
    >
      <Plus className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      {buttonText}
    </Button>
  );
};

export default TaskCreator;
