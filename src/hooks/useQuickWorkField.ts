import { useState, useEffect, useCallback } from 'react';
import { useTaskLogMutations } from './useTaskLogMutations';
import { useDebounce } from './useDebounce';
import { Task } from './useTasks';

interface UseQuickWorkFieldProps {
  task: Task;
  currentProgress: number;
}

export const useQuickWorkField = ({ task, currentProgress }: UseQuickWorkFieldProps) => {
  const [workContent, setWorkContent] = useState('');
  const [progress, setProgress] = useState(currentProgress);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { createAutoLog } = useTaskLogMutations();
  const debouncedContent = useDebounce(workContent, 3000);

  // Auto-save cuando el contenido cambia (debounced)
  useEffect(() => {
    if (debouncedContent.trim() && debouncedContent !== '') {
      handleAutoSave(debouncedContent);
    }
  }, [debouncedContent]);

  const handleAutoSave = async (content: string) => {
    setIsSaving(true);
    try {
      createAutoLog(
        task.id,
        'quick_update',
        'Actualización de trabajo rápida',
        content,
        { 
          previous_progress: currentProgress,
          current_progress: progress,
          auto_saved: true,
          timestamp: new Date().toISOString()
        }
      );
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving quick work:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProgressUpdate = useCallback((increment: number) => {
    const newProgress = Math.min(100, Math.max(0, progress + increment));
    setProgress(newProgress);
    
    // Log el cambio de progreso inmediatamente
    createAutoLog(
      task.id,
      'quick_update',
      `Progreso actualizado: +${increment}%`,
      workContent || 'Actualización manual de progreso',
      {
        previous_progress: progress,
        current_progress: newProgress,
        increment,
        manual_update: true,
        timestamp: new Date().toISOString()
      }
    );
  }, [progress, workContent, task.id, createAutoLog]);

  const handleContentChange = (content: string) => {
    setWorkContent(content);
  };

  const getProgressDiff = () => {
    const diff = progress - currentProgress;
    return diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : '0%';
  };

  return {
    workContent,
    progress,
    isSaving,
    lastSaved,
    handleContentChange,
    handleProgressUpdate,
    getProgressDiff,
  };
};