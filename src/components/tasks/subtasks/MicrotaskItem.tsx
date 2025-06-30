
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal,
  X,
  Check,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import TaskLogIcon from '../TaskLogIcon';
import TaskActivityLogModal from '../TaskActivityLogModal';

interface MicrotaskItemProps {
  microtask: Task;
  onUpdate: (data: any) => void;
  onDelete: (id: string) => void;
}

const MicrotaskItem = ({ microtask, onUpdate, onDelete }: MicrotaskItemProps) => {
  const [editingMicrotaskId, setEditingMicrotaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);

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
    <>
      <div className={`py-1 px-2 rounded transition-colors group ${
        isCompleted ? 'bg-gray-50' : 'hover:bg-gray-50'
      }`}>
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
                className="h-6 text-xs"
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
                className="h-5 w-5 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
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
            className="h-3 w-3"
            onClick={() => setSelectedLogTask(microtask)}
          />

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => onDelete(microtask.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {selectedLogTask && (
        <TaskActivityLogModal
          taskId={selectedLogTask.id}
          taskTitle={selectedLogTask.title}
          isOpen={true}
          onClose={() => setSelectedLogTask(null)}
        />
      )}
    </>
  );
};

export default MicrotaskItem;
