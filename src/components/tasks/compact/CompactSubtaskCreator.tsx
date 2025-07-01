
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X } from 'lucide-react';

interface CompactSubtaskCreatorProps {
  isCreating: boolean;
  newSubtaskTitle: string;
  onTitleChange: (value: string) => void;
  onCreate: () => void;
  onCancel: () => void;
  onStartCreating: () => void;
}

const CompactSubtaskCreator = ({
  isCreating,
  newSubtaskTitle,
  onTitleChange,
  onCreate,
  onCancel,
  onStartCreating
}: CompactSubtaskCreatorProps) => {
  return (
    <div className="py-1">
      {isCreating ? (
        <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-md">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Nueva subtarea..."
            className="h-6 text-sm flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCreate();
              if (e.key === 'Escape') onCancel();
            }}
          />
          <Button
            size="sm"
            onClick={onCreate}
            className="h-6 w-6 p-0"
            disabled={!newSubtaskTitle.trim()}
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartCreating}
          className="h-6 text-xs text-gray-500 hover:text-gray-700 justify-start w-full"
        >
          <Plus className="h-3 w-3 mr-1" />
          Añadir subtarea
        </Button>
      )}
    </div>
  );
};

export default CompactSubtaskCreator;
