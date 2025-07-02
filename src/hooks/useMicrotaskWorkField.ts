import { useState, useEffect, useCallback } from 'react';
import { useTaskLogMutations } from './useTaskLogMutations';
import { useDebounce } from './useDebounce';
import { Task } from './useTasks';

interface UseMicrotaskWorkFieldProps {
  microtask: Task;
}

export const useMicrotaskWorkField = ({ microtask }: UseMicrotaskWorkFieldProps) => {
  const [workContent, setWorkContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const { createAutoLog } = useTaskLogMutations();
  const debouncedContent = useDebounce(workContent, 2000); // Más rápido para microtareas

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
        microtask.id,
        'quick_update',
        'Trabajo específico en microtarea',
        content,
        { 
          microtask_work: true,
          task_level: microtask.task_level,
          parent_task_id: microtask.parent_task_id,
          auto_saved: true,
          timestamp: new Date().toISOString()
        }
      );
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving microtask work:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    setWorkContent(content);
  };

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const getContextualPlaceholder = () => {
    const title = microtask.title.toLowerCase();
    
    // Placeholder contextual basado en el título de la microtarea
    if (title.includes('llamar') || title.includes('contactar')) {
      return "¿Con quién hablaste? ¿Qué se acordó?";
    }
    if (title.includes('escribir') || title.includes('redactar')) {
      return "¿Qué puntos clave incluiste? ¿Cómo va el progreso?";
    }
    if (title.includes('revisar') || title.includes('verificar')) {
      return "¿Qué encontraste? ¿Hay algo que corregir?";
    }
    if (title.includes('enviar') || title.includes('solicitar')) {
      return "¿Ya lo enviaste? ¿Cuándo esperas respuesta?";
    }
    if (title.includes('buscar') || title.includes('investigar')) {
      return "¿Qué información encontraste? ¿Necesitas más datos?";
    }
    if (title.includes('completar') || title.includes('finalizar')) {
      return "¿Qué falta por hacer? ¿Estás cerca de terminar?";
    }
    
    return `¿En qué avanzaste con "${microtask.title}"?`;
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    
    if (diffSeconds < 30) return 'Guardado ahora';
    if (diffSeconds < 120) return `Guardado hace ${diffSeconds}s`;
    return `Guardado hace ${Math.floor(diffSeconds / 60)}m`;
  };

  return {
    workContent,
    isExpanded,
    isSaving,
    lastSaved,
    handleContentChange,
    handleToggleExpanded,
    getContextualPlaceholder,
    formatLastSaved,
  };
};