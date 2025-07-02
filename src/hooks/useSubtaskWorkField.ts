import { useState, useCallback } from 'react';
import { useTaskLogMutations } from './useTaskLogMutations';
import { Task } from './useTasks';

interface UseSubtaskWorkFieldProps {
  subtask: Task;
}

export const useSubtaskWorkField = ({ subtask }: UseSubtaskWorkFieldProps) => {
  const [workContent, setWorkContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const { createAutoLog } = useTaskLogMutations();

  const handleSubmit = async (content: string) => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    try {
      createAutoLog(
        subtask.id,
        'quick_update',
        'Avance en subtarea',
        content,
        { 
          subtask_work: true,
          task_level: subtask.task_level,
          parent_task_id: subtask.parent_task_id,
          manual_save: true,
          timestamp: new Date().toISOString()
        }
      );
      // Limpiar el campo después de guardar
      setWorkContent('');
    } catch (error) {
      console.error('Error saving subtask work:', error);
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
    const title = subtask.title.toLowerCase();
    
    // Placeholder contextual basado en el título de la subtarea
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
    
    return "Describe tu avance y presiona Enter";
  };

  return {
    workContent,
    isExpanded,
    isSaving,
    handleContentChange,
    handleToggleExpanded,
    handleSubmit,
    getContextualPlaceholder,
  };
};