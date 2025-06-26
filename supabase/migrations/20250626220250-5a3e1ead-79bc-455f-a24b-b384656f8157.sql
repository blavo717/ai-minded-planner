
-- Agregar campos para completar tareas y sistema de archivo
ALTER TABLE public.tasks 
ADD COLUMN completion_notes TEXT,
ADD COLUMN is_archived BOOLEAN DEFAULT false NOT NULL;

-- Crear índices para optimizar consultas
CREATE INDEX idx_tasks_is_archived ON public.tasks(is_archived);
CREATE INDEX idx_tasks_completed_at ON public.tasks(completed_at) WHERE completed_at IS NOT NULL;
CREATE INDEX idx_tasks_archived_completed ON public.tasks(is_archived, completed_at) WHERE completed_at IS NOT NULL;

-- Función para auto-completar subtareas cuando se completa una tarea principal
CREATE OR REPLACE FUNCTION auto_complete_subtasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la tarea se marca como completada
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Auto-completar todas las subtareas pendientes
    UPDATE public.tasks 
    SET 
      status = 'completed',
      completed_at = NEW.completed_at,
      completion_notes = COALESCE(completion_notes, 'Auto-completada con tarea principal')
    WHERE parent_task_id = NEW.id 
      AND status != 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auto-completar subtareas
CREATE TRIGGER trigger_auto_complete_subtasks
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_subtasks();
