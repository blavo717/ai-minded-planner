
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Settings } from 'lucide-react';

interface InlineTaskCreatorProps {
  placeholder: string;
  onCreateTask: (title: string) => void;
  onOpenAdvanced?: () => void;
  size?: 'sm' | 'default';
}

const InlineTaskCreator = ({ 
  placeholder, 
  onCreateTask, 
  onOpenAdvanced,
  size = 'default' 
}: InlineTaskCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreateTask(title.trim());
      setTitle('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsCreating(false);
  };

  if (!isCreating) {
    return (
      <div className={`flex items-center gap-2 ${size === 'sm' ? 'p-2' : 'p-3'}`}>
        <Button
          variant="ghost"
          size={size}
          onClick={() => setIsCreating(true)}
          className={`flex-1 justify-start text-gray-500 hover:text-gray-700 ${
            size === 'sm' ? 'h-8 text-xs' : 'h-10'
          }`}
        >
          <Plus className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-2`} />
          {placeholder}
        </Button>
        
        {onOpenAdvanced && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenAdvanced}
            className="h-8 w-8 p-0"
            title="Opciones avanzadas"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        className={size === 'sm' ? 'h-8 text-xs' : 'h-10'}
        autoFocus
      />
      <Button
        type="submit"
        size="sm"
        className="h-8 px-3"
        disabled={!title.trim()}
      >
        Crear
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="h-8 w-8 p-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </form>
  );
};

export default InlineTaskCreator;
