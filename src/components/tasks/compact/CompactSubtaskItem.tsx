
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Check,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import TaskLogIcon from '../TaskLogIcon';

interface CompactSubtaskItemProps {
  subtask: Task;
  microtasks: Task[];
  isExpanded: boolean;
  isEditing: boolean;
  editTitle: string;
  dropdownOpen: boolean;
  onToggleExpansion: () => void;
  onToggleComplete: (checked: boolean) => void;
  onDoubleClick: () => void;
  onEditTitleChange: (value: string) => void;
  onSaveTitle: () => void;
  onCancelEdit: () => void;
  onDropdownOpenChange: (open: boolean) => void;
  onLogClick: (task: Task) => void;
  onEditTask: () => void;
  onDeleteTask: () => void;
  onCreateMicrotask?: (subtaskId: string) => void;
  children?: React.ReactNode;
}

const CompactSubtaskItem = ({
  subtask,
  microtasks,
  isExpanded,
  isEditing,
  editTitle,
  dropdownOpen,
  onToggleExpansion,
  onToggleComplete,
  onDoubleClick,
  onEditTitleChange,
  onSaveTitle,
  onCancelEdit,
  onDropdownOpenChange,
  onLogClick,
  onEditTask,
  onDeleteTask,
  onCreateMicrotask,
  children
}: CompactSubtaskItemProps) => {
  const isCompleted = subtask.status === 'completed';
  const completedMicrotasks = microtasks.filter(m => m.status === 'completed').length;
  const hasMicrotasks = microtasks.length > 0;

  const handleActionAndClose = (action: () => void) => {
    action();
    onDropdownOpenChange(false);
  };

  const handleCreateMicrotaskKeepOpen = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCreateMicrotask) {
      onCreateMicrotask(subtask.id);
    }
  };

  return (
    <div className="space-y-1">
      <div className={`py-2 px-4 rounded-md transition-colors group ${
        isCompleted ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      }`}>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={onToggleComplete}
            className="h-3 w-3"
          />

          {/* Siempre mostrar botón de expansión */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpansion}
            className="h-3 w-3 p-0 text-gray-400"
          >
            {isExpanded ? (
              <ChevronDown className="h-2 w-2" />
            ) : (
              <ChevronRight className="h-2 w-2" />
            )}
          </Button>

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                className="h-5 text-sm"
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
                className="h-5 w-5 p-0"
              >
                <Check className="h-2 w-2" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                className="h-5 w-5 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          ) : (
            <span 
              className={`font-normal text-sm flex-1 truncate cursor-pointer hover:text-blue-600 ${
                isCompleted ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}
              onDoubleClick={onDoubleClick}
              title="Doble clic para editar"
            >
              {subtask.title}
            </span>
          )}

          <TaskLogIcon 
            taskId={subtask.id} 
            className="h-3 w-3"
            onClick={() => onLogClick(subtask)}
          />

          {hasMicrotasks && (
            <Badge variant="outline" className="text-xs px-1 py-0.5">
              {completedMicrotasks}/{microtasks.length}
            </Badge>
          )}

          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu 
              open={dropdownOpen} 
              onOpenChange={onDropdownOpenChange}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-white shadow-lg border z-50">
                <DropdownMenuItem onClick={() => handleActionAndClose(onEditTask)}>
                  Editar
                </DropdownMenuItem>
                {onCreateMicrotask && (
                  <DropdownMenuItem 
                    onPointerDown={handleCreateMicrotaskKeepOpen}
                    onSelect={(e) => e.preventDefault()}
                  >
                    Añadir microtarea
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleActionAndClose(onDeleteTask)}
                  className="text-red-600"
                >
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Contenido expandible (microtareas) */}
      {isExpanded && children}
    </div>
  );
};

export default CompactSubtaskItem;
