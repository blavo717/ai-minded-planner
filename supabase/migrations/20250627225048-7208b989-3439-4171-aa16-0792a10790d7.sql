
-- Añadir nuevos campos a la tabla projects para hacerla más flexible
ALTER TABLE public.projects 
ADD COLUMN start_date DATE,
ADD COLUMN end_date DATE,
ADD COLUMN deadline DATE,
ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
ADD COLUMN progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
ADD COLUMN budget DECIMAL(12,2),
ADD COLUMN budget_used DECIMAL(12,2) DEFAULT 0,
ADD COLUMN tags TEXT[],
ADD COLUMN category TEXT,
ADD COLUMN estimated_hours INTEGER,
ADD COLUMN actual_hours INTEGER DEFAULT 0,
ADD COLUMN change_reason TEXT,
ADD COLUMN last_status_change TIMESTAMP WITH TIME ZONE,
ADD COLUMN template_name TEXT,
ADD COLUMN custom_fields JSONB DEFAULT '{}';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_projects_priority ON public.projects(priority);
CREATE INDEX idx_projects_category ON public.projects(category);
CREATE INDEX idx_projects_start_date ON public.projects(start_date);
CREATE INDEX idx_projects_deadline ON public.projects(deadline);
CREATE INDEX idx_projects_tags ON public.projects USING GIN(tags);

-- Crear tabla para historial de cambios de proyectos
CREATE TABLE public.project_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  change_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla de historial
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_history
CREATE POLICY "Users can view their project history" 
  ON public.project_history 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create project history entries" 
  ON public.project_history 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Crear tabla para plantillas de proyectos
CREATE TABLE public.project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en plantillas
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plantillas
CREATE POLICY "Users can view their own templates and public ones" 
  ON public.project_templates 
  FOR SELECT 
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own templates" 
  ON public.project_templates 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates" 
  ON public.project_templates 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates" 
  ON public.project_templates 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_project_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-actualizar updated_at en plantillas
CREATE TRIGGER update_project_templates_updated_at
    BEFORE UPDATE ON public.project_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_project_templates_updated_at();
