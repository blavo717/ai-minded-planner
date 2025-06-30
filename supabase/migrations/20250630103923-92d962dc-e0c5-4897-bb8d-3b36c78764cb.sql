
-- Eliminar la restricción de clave foránea que impide la eliminación de tareas con jerarquías
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_parent_task_id_fkey;

-- Opcional: Limpiar datos huérfanos si existen
UPDATE public.tasks 
SET parent_task_id = NULL 
WHERE parent_task_id IS NOT NULL 
AND parent_task_id NOT IN (SELECT id FROM public.tasks);
