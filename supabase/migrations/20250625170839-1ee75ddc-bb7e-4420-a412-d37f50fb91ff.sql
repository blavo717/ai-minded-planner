
-- CRÍTICO: Agregar constraint único para permitir UPSERT en ai_task_monitoring
-- Esto solucionará el error "there is no unique or exclusion constraint matching the ON CONFLICT specification"

-- Crear constraint único en la tabla ai_task_monitoring
ALTER TABLE public.ai_task_monitoring 
ADD CONSTRAINT ai_task_monitoring_task_monitoring_unique 
UNIQUE (task_id, monitoring_type);

-- Agregar índice para mejorar rendimiento en consultas de análisis
CREATE INDEX IF NOT EXISTS idx_ai_task_monitoring_task_monitoring 
ON public.ai_task_monitoring(task_id, monitoring_type);

-- Agregar índice para consultas por tipo de análisis
CREATE INDEX IF NOT EXISTS idx_ai_task_monitoring_type_created 
ON public.ai_task_monitoring(monitoring_type, created_at DESC);
