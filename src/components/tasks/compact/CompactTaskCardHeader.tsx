
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface CompactTaskCardHeaderProps {
  task: Task;
  isCompleted: boolean;
  isExpanded: boolean;
  isEditingTitle: boolean;
  editTitle: string;
  onToggleComplete: (checked: boolean) => void;
  onToggleExpand: () => void;
  onDoubleClickTitle: () => void;
  onEditTitleChange: (value: string) => void;
  onSaveTitle: () => void;
  onCancelEdit: () => void;
  onTitleClick?: () => void; // NEW: Handler for title click
}

const CompactTaskCardHeader = ({
  task,
  isCompleted,
  isExpanded,
  isEditingTitle,
  editTitle,
  onToggleComplete,
  onToggleExpand,
  onDoubleClickTitle,
  onEditTitleChange,
  onSaveTitle,
  onCancelEdit,
  onTitleClick
}: CompactTaskCardHeaderProps) => {
  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTitleClick) {
      onTitleClick();
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Checkbox prominente */}
      <Checkbox
        checked={isCompleted}
        onCheckedChange={onToggleComplete}
        className="h-4 w-4 flex-shrink-0"
      />

      {/* Botón de expansión */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleExpand}
        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Título de la tarea */}
      <div className="flex-1 min-w-0">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="h-7 text-base font-medium"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveTitle();
                if (e.key === 'Escape') onCancelEdit();
              }}
              onBlur={onSaveTitle}
            />
            <Button
              size="sm"
              onClick={onSaveTitle}
              className="h-7 w-7 p-0 flex-shrink-0"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="h-7 w-7 p-0 flex-shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <h3 
            className={`font-medium text-base truncate cursor-pointer hover:text-blue-600 transition-colors ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
            onClick={handleTitleClick}
            onDoubleClick={onDoubleClickTitle}
            title="Click para ver detalles • Doble clic para editar"
          >
            {task.title}
          </h3>
        )}
        {task.description && (
          <p className="text-sm text-gray-500 truncate mt-1">
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompactTaskCardHeader;
