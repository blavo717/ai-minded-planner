
-- Añadir campos para jerarquía de tareas
ALTER TABLE public.tasks ADD COLUMN parent_task_id UUID REFERENCES public.tasks(id);
ALTER TABLE public.tasks ADD COLUMN estimated_duration INTEGER;
ALTER TABLE public.tasks ADD COLUMN actual_duration INTEGER;
ALTER TABLE public.tasks ADD COLUMN tags TEXT[];

-- Crear tabla para dependencias de tareas
CREATE TABLE public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) NOT NULL,
  depends_on_task_id UUID REFERENCES public.tasks(id) NOT NULL,
  dependency_type TEXT NOT NULL DEFAULT 'blocks' CHECK (dependency_type IN ('blocks', 'requires', 'follows')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Enable RLS on task_dependencies
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;

-- Create policies for task_dependencies
CREATE POLICY "Users can view dependencies of their tasks" 
  ON public.task_dependencies 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_dependencies.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create dependencies for their tasks" 
  ON public.task_dependencies 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_dependencies.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update dependencies of their tasks" 
  ON public.task_dependencies 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_dependencies.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete dependencies of their tasks" 
  ON public.task_dependencies 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = task_dependencies.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_task_dependencies_task_id ON public.task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON public.task_dependencies(depends_on_task_id);
CREATE INDEX idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX idx_tasks_tags ON public.tasks USING GIN(tags);

-- Update tasks trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists for tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
