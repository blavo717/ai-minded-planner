
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface TaskCreatorProps {
  placeholder: string;
  buttonText: string;
  onCreateTask: (title: string) => void;
  size?: 'sm' | 'default';
}

const TaskCreator = ({ placeholder, buttonText, onCreateTask, size = 'default' }: TaskCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = () => {
    if (title.trim()) {
      onCreateTask(title.trim());
      setTitle('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setTitle('');
  };

  if (!isCreating) {
    return (
      <Button
        variant={size === 'sm' ? 'ghost' : 'outline'}
        size={size}
        onClick={() => setIsCreating(true)}
        className={size === 'sm' ? 'text-xs text-gray-600 hover:text-gray-800' : 'w-full'}
      >
        <Plus className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-${size === 'sm' ? '1' : '2'}`} />
        {buttonText}
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder={placeholder}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleCreate();
          }
        }}
        className={size === 'sm' ? 'text-xs' : ''}
        autoFocus
      />
      <Button onClick={handleCreate} size={size} className={size === 'sm' ? 'text-xs' : ''}>
        Crear
      </Button>
      <Button 
        variant="outline" 
        onClick={handleCancel}
        size={size}
        className={size === 'sm' ? 'text-xs' : ''}
      >
        Cancelar
      </Button>
    </div>
  );
};

export default TaskCreator;
