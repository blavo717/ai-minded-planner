
-- Eliminar la restricción de clave foránea que impide la eliminación de tareas
-- cuando tienen sesiones de trabajo asociadas
ALTER TABLE public.task_sessions DROP CONSTRAINT IF EXISTS task_sessions_task_id_fkey;

-- Eliminar también otras restricciones que podrían causar problemas similares
ALTER TABLE public.task_assignments DROP CONSTRAINT IF EXISTS task_assignments_task_id_fkey;
ALTER TABLE public.task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_task_id_fkey;
ALTER TABLE public.task_dependencies DROP CONSTRAINT IF EXISTS task_dependencies_depends_on_task_id_fkey;
ALTER TABLE public.ai_task_monitoring DROP CONSTRAINT IF EXISTS ai_task_monitoring_task_id_fkey;
