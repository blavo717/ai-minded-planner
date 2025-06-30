import React, { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal,
  Plus,
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
import { useTaskMutations } from '@/hooks/useTaskMutations';
import TaskLogIcon from './TaskLogIcon';
import TaskActivityLogModal from './TaskActivityLogModal';

interface CompactMicrotaskListProps {
  parentSubtask: Task;
  microtasks: Task[];
  onEditTask: (task: Task) => void;
}

const CompactMicrotaskList = memo(({ 
  parentSubtask, 
  microtasks,
  onEditTask
}: CompactMicrotaskListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newMicrotaskTitle, setNewMicrotaskTitle] = useState('');
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);
  const [editingMicrotaskId, setEditingMicrotaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { updateTask, deleteTask, createMicrotask } = useTaskMutations();

  console.log('CompactMicrotaskList rendered:', {
    parentSubtaskId: parentSubtask.id,
    parentSubtaskTitle: parentSubtask.title,
    microtasksCount: microtasks.length,
    microtasks: microtasks.map(m => ({ id: m.id, title: m.title, parent_task_id: m.parent_task_id }))
  });

  const handleCreateMicrotask = () => {
    if (newMicrotaskTitle.trim()) {
      console.log('Creating microtask:', {
        parentId: parentSubtask.id,
        title: newMicrotaskTitle.trim()
      });
      createMicrotask({ parentSubtaskId: parentSubtask.id, title: newMicrotaskTitle.trim() });
      setNewMicrotaskTitle('');
      setIsCreating(false);
    }
  };

  function handleToggleMicrotaskComplete(microtask: Task, checked: boolean) {
    updateTask({
      id: microtask.id,
      status: checked ? 'completed' : 'pending',
      completed_at: checked ? new Date().toISOString() : null
    });
  }

  function handleDoubleClickMicrotask(microtask: Task) {
    setEditingMicrotaskId(microtask.id);
    setEditTitle(microtask.title);
  }

  function handleSaveMicrotaskTitle(microtaskId: string) {
    if (editTitle.trim() && editTitle.trim() !== microtasks.find(m => m.id === microtaskId)?.title) {
      updateTask({
        id: microtaskId,
        title: editTitle.trim()
      });
    }
    setEditingMicrotaskId(null);
    setEditTitle('');
  }

  function handleCancelMicrotaskEdit() {
    setEditingMicrotaskId(null);
    setEditTitle('');
  }

  return (
    <>
      <div className="ml-12 border-l border-gray-300 pl-4 space-y-1">
        {microtasks.length > 0 ? (
          microtasks.map((microtask) => {
            const isCompleted = microtask.status === 'completed';
            const isEditing = editingMicrotaskId === microtask.id;
            
            return (
              <div 
                key={microtask.id} 
                className={`py-1 px-3 rounded-sm transition-colors group relative ${
                  isCompleted ? 'bg-gray-25' : 'hover:bg-gray-25'
                }`}
              >
                {/* Conector visual sutil */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleToggleMicrotaskComplete(microtask, checked as boolean)}
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
                          if (e.key === 'Enter') handleSaveMicrotaskTitle(microtask.id);
                          if (e.key === 'Escape') handleCancelMicrotaskEdit();
                        }}
                        onBlur={() => handleSaveMicrotaskTitle(microtask.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveMicrotaskTitle(microtask.id)}
                        className="h-4 w-4 p-0"
                      >
                        <Check className="h-2 w-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelMicrotaskEdit}
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
                      onDoubleClick={() => handleDoubleClickMicrotask(microtask)}
                      title="Doble clic para editar"
                    >
                      {microtask.title}
                    </span>
                  )}

                  <TaskLogIcon 
                    taskId={microtask.id} 
                    className="h-2 w-2"
                    onClick={() => setSelectedLogTask(microtask)}
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
                        <DropdownMenuItem onClick={() => onEditTask(microtask)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteTask(microtask.id)}
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
          })
        ) : (
          <div className="py-1 px-3 text-xs text-gray-400 italic">
            No hay microtareas
          </div>
        )}

        {/* Creador de microtareas ultra-compacto */}
        <div className="py-0.5">
          {isCreating ? (
            <div className="flex items-center gap-1 py-1 px-2 bg-gray-25 rounded-sm">
              <Input
                value={newMicrotaskTitle}
                onChange={(e) => setNewMicrotaskTitle(e.target.value)}
                placeholder="Nueva microtarea..."
                className="h-5 text-xs flex-1 border-0 bg-transparent focus:ring-0"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateMicrotask();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
              />
              <Button
                size="sm"
                onClick={handleCreateMicrotask}
                className="h-4 w-4 p-0"
                disabled={!newMicrotaskTitle.trim()}
              >
                <Check className="h-2 w-2" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="h-4 w-4 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="h-5 text-xs text-gray-400 hover:text-gray-600 justify-start w-full px-2"
            >
              <Plus className="h-2 w-2 mr-1" />
              Añadir microtarea
            </Button>
          )}
        </div>
      </div>

      {/* Modal de Log de Actividad */}
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
});

CompactMicrotaskList.displayName = 'CompactMicrotaskList';

export default CompactMicrotaskList;
