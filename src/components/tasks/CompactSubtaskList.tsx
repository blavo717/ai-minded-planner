
import React, { memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
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
import CompactMicrotaskList from './CompactMicrotaskList';
import TaskLogIcon from './TaskLogIcon';
import TaskActivityLogModal from './TaskActivityLogModal';

interface CompactSubtaskListProps {
  parentTask: Task;
  subtasks: Task[];
  onCreateSubtask: (parentTaskId: string, title: string) => void;
  onEditTask: (task: Task) => void;
  getSubtasksForTask: (taskId: string) => Task[];
}

const CompactSubtaskList = memo(({ 
  parentTask, 
  subtasks, 
  onCreateSubtask,
  onEditTask,
  getSubtasksForTask 
}: CompactSubtaskListProps) => {
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedLogTask, setSelectedLogTask] = useState<Task | null>(null);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [dropdownOpenMap, setDropdownOpenMap] = useState<Record<string, boolean>>({});
  const { updateTask, deleteTask } = useTaskMutations();

  console.log('CompactSubtaskList rendered:', {
    parentTaskId: parentTask.id,
    parentTaskTitle: parentTask.title,
    subtasksCount: subtasks.length,
    subtasks: subtasks.map(s => ({ 
      id: s.id, 
      title: s.title, 
      microtasksCount: getSubtasksForTask(s.id).length 
    }))
  });

  const toggleSubtaskExpansion = (subtaskId: string) => {
    const newExpanded = new Set(expandedSubtasks);
    if (newExpanded.has(subtaskId)) {
      newExpanded.delete(subtaskId);
    } else {
      newExpanded.add(subtaskId);
    }
    setExpandedSubtasks(newExpanded);
    console.log('Toggling subtask expansion:', subtaskId, 'expanded:', newExpanded.has(subtaskId));
  };

  const setDropdownOpen = (subtaskId: string, open: boolean) => {
    setDropdownOpenMap(prev => ({
      ...prev,
      [subtaskId]: open
    }));
  };

  function handleCreateSubtask() {
    if (newSubtaskTitle.trim()) {
      onCreateSubtask(parentTask.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
      setIsCreating(false);
    }
  }

  function handleToggleSubtaskComplete(subtask: Task, checked: boolean) {
    updateTask({
      id: subtask.id,
      status: checked ? 'completed' : 'pending',
      completed_at: checked ? new Date().toISOString() : null
    });
  }

  function handleDoubleClickSubtask(subtask: Task) {
    setEditingSubtaskId(subtask.id);
    setEditTitle(subtask.title);
  }

  function handleSaveSubtaskTitle(subtaskId: string) {
    if (editTitle.trim() && editTitle.trim() !== subtasks.find(s => s.id === subtaskId)?.title) {
      updateTask({
        id: subtaskId,
        title: editTitle.trim()
      });
    }
    setEditingSubtaskId(null);
    setEditTitle('');
  }

  function handleCancelSubtaskEdit() {
    setEditingSubtaskId(null);
    setEditTitle('');
  }

  const handleActionAndClose = (subtaskId: string, action: () => void) => {
    action();
    setDropdownOpen(subtaskId, false);
  };

  return (
    <>
      <div className="ml-6 border-l-2 border-gray-200 pl-4 space-y-1">
        {subtasks.map((subtask) => {
          // Obtener microtareas específicamente para esta subtarea
          const microtasks = getSubtasksForTask(subtask.id).filter(task => task.task_level === 3);
          const hasMicrotasks = microtasks.length > 0;
          const isExpanded = expandedSubtasks.has(subtask.id);
          const completedMicrotasks = microtasks.filter(m => m.status === 'completed').length;
          const isCompleted = subtask.status === 'completed';
          const isEditing = editingSubtaskId === subtask.id;
          const isDropdownOpen = dropdownOpenMap[subtask.id] || false;

          console.log('Rendering subtask:', {
            id: subtask.id,
            title: subtask.title,
            hasMicrotasks,
            microtasksCount: microtasks.length,
            isExpanded,
            microtasks: microtasks.map(m => ({ id: m.id, title: m.title, task_level: m.task_level }))
          });

          return (
            <div key={subtask.id} className="space-y-1">
              <div className={`py-2 px-4 rounded-md transition-colors group ${
                isCompleted ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => handleToggleSubtaskComplete(subtask, checked as boolean)}
                    className="h-3 w-3"
                  />

                  {/* Siempre mostrar botón de expansión */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSubtaskExpansion(subtask.id)}
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
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="h-5 text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveSubtaskTitle(subtask.id);
                          if (e.key === 'Escape') handleCancelSubtaskEdit();
                        }}
                        onBlur={() => handleSaveSubtaskTitle(subtask.id)}
                      />
                      <Button
                        size="sm"
                        onClick={() => handleSaveSubtaskTitle(subtask.id)}
                        className="h-5 w-5 p-0"
                      >
                        <Check className="h-2 w-2" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelSubtaskEdit}
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
                      onDoubleClick={() => handleDoubleClickSubtask(subtask)}
                      title="Doble clic para editar"
                    >
                      {subtask.title}
                    </span>
                  )}

                  <TaskLogIcon 
                    taskId={subtask.id} 
                    className="h-3 w-3"
                    onClick={() => setSelectedLogTask(subtask)}
                  />

                  {hasMicrotasks && (
                    <div className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                      {completedMicrotasks}/{microtasks.length}
                    </div>
                  )}

                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu 
                      open={isDropdownOpen} 
                      onOpenChange={(open) => setDropdownOpen(subtask.id, open)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-white shadow-lg border z-50">
                        <DropdownMenuItem onClick={() => handleActionAndClose(subtask.id, () => onEditTask(subtask))}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleActionAndClose(subtask.id, () => deleteTask(subtask.id))}
                          className="text-red-600"
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              {/* Mostrar microtareas cuando está expandida */}
              {isExpanded && (
                <CompactMicrotaskList
                  parentSubtask={subtask}
                  microtasks={microtasks}
                  onEditTask={onEditTask}
                />
              )}
            </div>
          );
        })}

        {/* Creador de subtareas compacto */}
        <div className="py-1">
          {isCreating ? (
            <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-md">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Nueva subtarea..."
                className="h-6 text-sm flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSubtask();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
              />
              <Button
                size="sm"
                onClick={handleCreateSubtask}
                className="h-6 w-6 p-0"
                disabled={!newSubtaskTitle.trim()}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="h-6 text-xs text-gray-500 hover:text-gray-700 justify-start w-full"
            >
              <Plus className="h-3 w-3 mr-1" />
              Añadir subtarea
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

CompactSubtaskList.displayName = 'CompactSubtaskList';

export default CompactSubtaskList;
