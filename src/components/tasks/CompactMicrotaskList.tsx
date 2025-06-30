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
import LogIcon from '@/components/tasks/logs/LogIcon';
import TaskActivityLog from '@/components/tasks/logs/TaskActivityLog';

interface CompactMicrotaskListProps {
  parentSubtask: Task;
  microtasks: Task[];
}

const CompactMicrotaskList = memo(({ 
  parentSubtask, 
  microtasks 
}: CompactMicrotaskListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newMicrotaskTitle, setNewMicrotaskTitle] = useState('');
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);
  const { updateTask, deleteTask, createMicrotask } = useTaskMutations();

  const handleCreateMicrotask = () => {
    if (newMicrotaskTitle.trim()) {
      createMicrotask(parentSubtask.id, newMicrotaskTitle.trim());
      setNewMicrotaskTitle('');
      setIsCreating(false);
    }
  };

  const handleToggleMicrotaskComplete = (microtask: Task, checked: boolean) => {
    updateTask({
      id: microtask.id,
      status: checked ? 'completed' : 'pending',
      completed_at: checked ? new Date().toISOString() : null
    });
  };

  return (
    <>
      <div className="ml-12 border-l border-gray-300 pl-4 space-y-1">
        {microtasks.map((microtask) => {
          const isCompleted = microtask.status === 'completed';
          
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

                <span className={`font-normal text-xs flex-1 truncate ${
                  isCompleted ? 'text-gray-400 line-through' : 'text-gray-600'
                }`}>
                  {microtask.title}
                </span>

                <LogIcon 
                  taskId={microtask.id} 
                  className="h-2 w-2"
                  onClick={() => setSelectedLogTask(microtask)}
                />

                <div className="w-1 h-1 rounded-full bg-indigo-400" />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-2 w-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32 bg-white shadow-lg border">
                    <DropdownMenuItem onClick={() => updateTask({ id: microtask.id, title: 'Nuevo título' })}>
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
          );
        })}

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
        <TaskActivityLog
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
