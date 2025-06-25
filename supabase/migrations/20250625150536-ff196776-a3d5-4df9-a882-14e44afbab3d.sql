
-- FASE 1: Extender tabla tasks con campos de tracking y IA
ALTER TABLE public.tasks ADD COLUMN last_worked_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tasks ADD COLUMN last_communication_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.tasks ADD COLUMN communication_type TEXT CHECK (communication_type IN ('email', 'phone', 'meeting', 'whatsapp', 'chat', 'video_call', 'in_person', 'other'));
ALTER TABLE public.tasks ADD COLUMN communication_notes TEXT;
ALTER TABLE public.tasks ADD COLUMN task_level INTEGER NOT NULL DEFAULT 1 CHECK (task_level IN (1, 2, 3));
ALTER TABLE public.tasks ADD COLUMN ai_priority_score DECIMAL(5,2) DEFAULT 0.0;
ALTER TABLE public.tasks ADD COLUMN needs_followup BOOLEAN DEFAULT false;

-- Crear tabla para monitoreo inteligente de IA
CREATE TABLE public.ai_task_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  monitoring_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL DEFAULT '{}',
  priority_score DECIMAL(5,2) DEFAULT 0.0,
  predicted_completion_date TIMESTAMP WITH TIME ZONE,
  bottleneck_detected BOOLEAN DEFAULT false,
  suggestions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para planes diarios de IA
CREATE TABLE public.ai_daily_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_date DATE NOT NULL,
  planned_tasks JSONB NOT NULL DEFAULT '[]',
  optimization_strategy TEXT,
  estimated_duration INTEGER, -- en minutos
  ai_confidence DECIMAL(3,2) DEFAULT 0.0 CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0),
  user_feedback JSONB DEFAULT '{}',
  completion_rate DECIMAL(3,2) DEFAULT 0.0 CHECK (completion_rate >= 0.0 AND completion_rate <= 1.0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_date)
);

-- Enable RLS en las nuevas tablas
ALTER TABLE public.ai_task_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_daily_plans ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_task_monitoring
CREATE POLICY "Users can view monitoring of their tasks" 
  ON public.ai_task_monitoring 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = ai_task_monitoring.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create monitoring for their tasks" 
  ON public.ai_task_monitoring 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = ai_task_monitoring.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update monitoring of their tasks" 
  ON public.ai_task_monitoring 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = ai_task_monitoring.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete monitoring of their tasks" 
  ON public.ai_task_monitoring 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.id = ai_task_monitoring.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Políticas RLS para ai_daily_plans
CREATE POLICY "Users can view their own daily plans" 
  ON public.ai_daily_plans 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own daily plans" 
  ON public.ai_daily_plans 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own daily plans" 
  ON public.ai_daily_plans 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own daily plans" 
  ON public.ai_daily_plans 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Crear índices para mejor performance
CREATE INDEX idx_ai_task_monitoring_task_id ON public.ai_task_monitoring(task_id);
CREATE INDEX idx_ai_task_monitoring_created_at ON public.ai_task_monitoring(created_at);
CREATE INDEX idx_ai_daily_plans_user_date ON public.ai_daily_plans(user_id, plan_date);
CREATE INDEX idx_tasks_task_level ON public.tasks(task_level);
CREATE INDEX idx_tasks_last_worked_at ON public.tasks(last_worked_at);
CREATE INDEX idx_tasks_needs_followup ON public.tasks(needs_followup) WHERE needs_followup = true;

-- Trigger para updated_at en ai_task_monitoring
CREATE TRIGGER update_ai_task_monitoring_updated_at 
    BEFORE UPDATE ON public.ai_task_monitoring 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at en ai_daily_plans
CREATE TRIGGER update_ai_daily_plans_updated_at 
    BEFORE UPDATE ON public.ai_daily_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();

-- Actualizar task_level para tareas existentes basado en parent_task_id
UPDATE public.tasks 
SET task_level = CASE 
  WHEN parent_task_id IS NULL THEN 1  -- Tareas principales
  WHEN parent_task_id IS NOT NULL THEN 2  -- Subtareas
END;
