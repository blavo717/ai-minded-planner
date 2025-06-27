
import { useEffect, useCallback } from 'react';
import { Task } from '@/hooks/useTasks';

interface KeyboardShortcutsConfig {
  onCreateTask?: () => void;
  onEditTask?: (task: Task) => void;
  onCompleteTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleView?: () => void;
  onToggleFilters?: () => void;
  onFocusSearch?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
  selectedTasks?: Task[];
  isEnabled?: boolean;
}

export const useKeyboardShortcuts = ({
  onCreateTask,
  onEditTask,
  onCompleteTask,
  onDeleteTask,
  onToggleView,
  onToggleFilters,
  onFocusSearch,
  onSelectAll,
  onEscape,
  selectedTasks = [],
  isEnabled = true
}: KeyboardShortcutsConfig) => {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;
    
    // Prevenir shortcuts cuando se está escribiendo en inputs
    const target = event.target as HTMLElement;
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || 
                   target.contentEditable === 'true';
    
    if (isInput && !event.metaKey && !event.ctrlKey) return;

    const { key, metaKey, ctrlKey, shiftKey, altKey } = event;
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? metaKey : ctrlKey;

    // Shortcuts principales
    switch (true) {
      // Crear nueva tarea: Ctrl/Cmd + N
      case modKey && key === 'n':
        event.preventDefault();
        onCreateTask?.();
        break;

      // Editar tarea seleccionada: E (sin modificadores)
      case !modKey && !shiftKey && !altKey && key === 'e' && selectedTasks.length === 1:
        event.preventDefault();
        onEditTask?.(selectedTasks[0]);
        break;

      // Completar tareas seleccionadas: Ctrl/Cmd + Enter
      case modKey && key === 'Enter':
        event.preventDefault();
        selectedTasks.forEach(task => {
          if (task.status !== 'completed') {
            onCompleteTask?.(task.id);
          }
        });
        break;

      // Eliminar tareas seleccionadas: Delete o Backspace
      case (key === 'Delete' || key === 'Backspace') && !isInput:
        event.preventDefault();
        selectedTasks.forEach(task => onDeleteTask?.(task.id));
        break;

      // Cambiar vista: Ctrl/Cmd + Shift + V
      case modKey && shiftKey && key === 'V':
        event.preventDefault();
        onToggleView?.();
        break;

      // Toggle filtros: Ctrl/Cmd + F
      case modKey && key === 'f':
        event.preventDefault();
        onToggleFilters?.();
        break;

      // Enfocar búsqueda: Ctrl/Cmd + K o /
      case (modKey && key === 'k') || key === '/':
        event.preventDefault();
        onFocusSearch?.();
        break;

      // Seleccionar todo: Ctrl/Cmd + A
      case modKey && key === 'a':
        event.preventDefault();
        onSelectAll?.();
        break;

      // Escape: cancelar selección o cerrar modales
      case key === 'Escape':
        event.preventDefault();
        onEscape?.();
        break;

      default:
        break;
    }
  }, [
    isEnabled,
    onCreateTask,
    onEditTask,
    onCompleteTask,
    onDeleteTask,
    onToggleView,
    onToggleFilters,
    onFocusSearch,
    onSelectAll,
    onEscape,
    selectedTasks
  ]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);

  // Devolver información sobre los shortcuts disponibles
  const shortcuts = {
    create: 'Ctrl/Cmd + N',
    edit: 'E',
    complete: 'Ctrl/Cmd + Enter',
    delete: 'Delete/Backspace',
    toggleView: 'Ctrl/Cmd + Shift + V',
    toggleFilters: 'Ctrl/Cmd + F',
    search: 'Ctrl/Cmd + K o /',
    selectAll: 'Ctrl/Cmd + A',
    escape: 'Escape'
  };

  return { shortcuts };
};
