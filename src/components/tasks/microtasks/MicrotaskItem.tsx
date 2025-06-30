
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal,
  X,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import TaskLogIcon from '../TaskLogIcon';

interface MicrotaskItemProps {
  microtask: Task;
  onUpdate: (data: any) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const MicrotaskItem = ({ microtask, onUpdate, onDelete, onEdit }: MicrotaskItemProps) => {
  const [editingMicrotaskId, setEditingMicrotaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const isCompleted = microtask.status === 'completed';
  const isEditing = editingMicrotaskId === microtask.id;

  const handleToggleComplete = (checked: boolean) => {
    onUpdate({
      id: microtask.id,
      status: checked ? 'completed' : 'pending',
      completed_at: checked ? new Date().toISOString() : null
    });
  };

  const handleDoubleClick = () => {
    setEditingMicrotaskId(microtask.id);
    setEditTitle(microtask.title);
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== microtask.title) {
      onUpdate({
        id: microtask.id,
        title: editTitle.trim()
      });
    }
    setEditingMicrotaskId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingMicrotaskId(null);
    setEditTitle('');
  };

  return (
    <div className={`py-1 px-3 rounded-sm transition-colors group relative ${
      isCompleted ? 'bg-gray-25' : 'hover:bg-gray-25'
    }`}>
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
      
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={handleToggleComplete}
          className="h-3 w-3"
        />

        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-4 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') handleCancelEdit();
              }}
              onBlur={handleSaveTitle}
            />
            <Button
              size="sm"
              onClick={handleSaveTitle}
              className="h-4 w-4 p-0"
            >
              <Check className="h-2 w-2" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-4 w-4 p-0"
            >
              <X className="h-2 w-2" />
            </Button>
          </div>
        ) : (
          <span 
            className={`font-normal text-xs flex-1 truncate cursor-pointer hover:text-blue-600 ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
            }`}
            onDoubleClick={handleDoubleClick}
            title="Doble clic para editar"
          >
            {microtask.title}
          </span>
        )}

        <TaskLogIcon 
          taskId={microtask.id} 
          className="h-2 w-2"
        />

        <div className="w-1 h-1 rounded-full bg-indigo-400" />

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-3 w-3 p-0">
                <MoreHorizontal className="h-2 w-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-white shadow-lg border z-50">
              <DropdownMenuItem onClick={() => onEdit(microtask)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(microtask.id)}
                className="text-red-600"
              >
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MicrotaskItem;
