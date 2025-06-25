
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface TaskCreatorProps {
  placeholder: string;
  buttonText: string;
  onCreateTask: () => void; // Changed to just trigger modal opening
  size?: 'sm' | 'default';
}

const TaskCreator = ({ placeholder, buttonText, onCreateTask, size = 'default' }: TaskCreatorProps) => {
  // Simple component that just shows the button to open the modal
  return (
    <Button
      variant={size === 'sm' ? 'ghost' : 'outline'}
      size={size}
      onClick={onCreateTask}
      className={size === 'sm' ? 'text-xs text-gray-600 hover:text-gray-800' : 'w-full flex items-center gap-2'}
    >
      <Plus className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'}`} />
      {buttonText}
    </Button>
  );
};

export default TaskCreator;
