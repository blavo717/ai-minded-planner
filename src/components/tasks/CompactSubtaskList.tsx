
import React, { memo, useState } from 'react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import CompactMicrotaskList from './CompactMicrotaskList';
import TaskActivityLogModal from './TaskActivityLogModal';
import CompactSubtaskItem from './compact/CompactSubtaskItem';
import CompactSubtaskCreator from './compact/CompactSubtaskCreator';

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

  return (
    <>
      <div className="ml-6 border-l-2 border-gray-200 pl-4 space-y-1">
        {subtasks.map((subtask) => {
          // Obtener microtareas específicamente para esta subtarea
          const microtasks = getSubtasksForTask(subtask.id).filter(task => task.task_level === 3);
          const isExpanded = expandedSubtasks.has(subtask.id);
          const isEditing = editingSubtaskId === subtask.id;
          const isDropdownOpen = dropdownOpenMap[subtask.id] || false;

          console.log('Rendering subtask:', {
            id: subtask.id,
            title: subtask.title,
            hasMicrotasks: microtasks.length > 0,
            microtasksCount: microtasks.length,
            isExpanded,
            microtasks: microtasks.map(m => ({ id: m.id, title: m.title, task_level: m.task_level }))
          });

          return (
            <CompactSubtaskItem
              key={subtask.id}
              subtask={subtask}
              microtasks={microtasks}
              isExpanded={isExpanded}
              isEditing={isEditing}
              editTitle={editTitle}
              dropdownOpen={isDropdownOpen}
              onToggleExpansion={() => toggleSubtaskExpansion(subtask.id)}
              onToggleComplete={(checked) => handleToggleSubtaskComplete(subtask, checked)}
              onDoubleClick={() => handleDoubleClickSubtask(subtask)}
              onEditTitleChange={setEditTitle}
              onSaveTitle={() => handleSaveSubtaskTitle(subtask.id)}
              onCancelEdit={handleCancelSubtaskEdit}
              onDropdownOpenChange={(open) => setDropdownOpen(subtask.id, open)}
              onLogClick={setSelectedLogTask}
              onEditTask={() => onEditTask(subtask)}
              onDeleteTask={() => deleteTask(subtask.id)}
            >
              <CompactMicrotaskList
                parentSubtask={subtask}
                microtasks={microtasks}
                onEditTask={onEditTask}
              />
            </CompactSubtaskItem>
          );
        })}

        {/* Creador de subtareas compacto */}
        <CompactSubtaskCreator
          isCreating={isCreating}
          newSubtaskTitle={newSubtaskTitle}
          onTitleChange={setNewSubtaskTitle}
          onCreate={handleCreateSubtask}
          onCancel={() => setIsCreating(false)}
          onStartCreating={() => setIsCreating(true)}
        />
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
