
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Check } from 'lucide-react';

interface MicrotaskCreatorProps {
  onCreateMicrotask: (title: string) => void;
}

const MicrotaskCreator = ({ onCreateMicrotask }: MicrotaskCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newMicrotaskTitle, setNewMicrotaskTitle] = useState('');

  const handleCreate = () => {
    if (newMicrotaskTitle.trim()) {
      onCreateMicrotask(newMicrotaskTitle.trim());
      setNewMicrotaskTitle('');
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setNewMicrotaskTitle('');
  };

  if (isCreating) {
    return (
      <div className="flex items-center gap-1 py-1 px-2 bg-gray-25 rounded-sm">
        <Input
          value={newMicrotaskTitle}
          onChange={(e) => setNewMicrotaskTitle(e.target.value)}
          placeholder="Nueva microtarea..."
          className="h-5 text-xs flex-1 border-0 bg-transparent focus:ring-0"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <Button
          size="sm"
          onClick={handleCreate}
          className="h-4 w-4 p-0"
          disabled={!newMicrotaskTitle.trim()}
        >
          <Check className="h-2 w-2" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-4 w-4 p-0"
        >
          <X className="h-2 w-2" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsCreating(true)}
      className="h-5 text-xs text-gray-400 hover:text-gray-600 justify-start w-full px-2"
    >
      <Plus className="h-2 w-2 mr-1" />
      Añadir microtarea
    </Button>
  );
};

export default MicrotaskCreator;
