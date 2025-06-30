
-- Crear tabla para logs de tareas
CREATE TABLE public.task_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  log_type TEXT NOT NULL DEFAULT 'manual',
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Añadir índices para mejorar el rendimiento
CREATE INDEX idx_task_logs_task_id ON public.task_logs(task_id);
CREATE INDEX idx_task_logs_user_id ON public.task_logs(user_id);
CREATE INDEX idx_task_logs_created_at ON public.task_logs(created_at);

-- Habilitar RLS
ALTER TABLE public.task_logs ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios logs
CREATE POLICY "Users can view their own task logs" 
  ON public.task_logs 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan crear logs en sus tareas
CREATE POLICY "Users can create logs for their own tasks" 
  ON public.task_logs 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_logs.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Política para que los usuarios puedan actualizar sus propios logs
CREATE POLICY "Users can update their own task logs" 
  ON public.task_logs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para que los usuarios puedan eliminar sus propios logs
CREATE POLICY "Users can delete their own task logs" 
  ON public.task_logs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_task_logs_updated_at
  BEFORE UPDATE ON public.task_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.task_logs IS 'Registro de logs y actualizaciones para tareas, subtareas y microtareas';
COMMENT ON COLUMN public.task_logs.log_type IS 'Tipo de log: manual, status_change, creation, completion, assignment, etc.';
COMMENT ON COLUMN public.task_logs.metadata IS 'Datos adicionales del log como valores anteriores, nuevos valores, etc.';
