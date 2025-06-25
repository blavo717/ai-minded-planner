
-- Crear tabla para ubicaciones primero (sin referencias circulares)
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  latitude FLOAT,
  longitude FLOAT,
  location_type TEXT DEFAULT 'work', -- 'work', 'home', 'cafe', 'library', etc.
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para patrones de usuario
CREATE TABLE public.user_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  pattern_type TEXT NOT NULL, -- 'work_hours', 'task_duration', 'completion_rate', etc.
  pattern_data JSONB NOT NULL, -- Datos del patrón en formato flexible
  confidence_score FLOAT DEFAULT 0.5, -- Confianza en el patrón (0-1)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para insights de IA
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  insight_type TEXT NOT NULL, -- 'productivity_trend', 'task_suggestion', 'time_optimization', etc.
  title TEXT NOT NULL,
  description TEXT,
  insight_data JSONB NOT NULL, -- Datos específicos del insight
  priority INTEGER DEFAULT 3, -- 1=alta, 2=media, 3=baja
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE -- Algunos insights pueden expirar
);

-- Crear tabla para recordatorios inteligentes
CREATE TABLE public.smart_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES public.tasks,
  reminder_type TEXT NOT NULL, -- 'deadline_approach', 'overdue', 'optimal_time', 'break_suggestion'
  title TEXT NOT NULL,
  message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para sesiones de trabajo (ahora puede referenciar locations)
CREATE TABLE public.task_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  task_id UUID REFERENCES public.tasks,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER, -- Calculado cuando termina la sesión
  productivity_score INTEGER, -- 1-5, opcional
  notes TEXT,
  location_id UUID REFERENCES public.locations,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para locations
CREATE POLICY "Users can view their own locations" 
  ON public.locations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own locations" 
  ON public.locations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locations" 
  ON public.locations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own locations" 
  ON public.locations FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para user_patterns
CREATE POLICY "Users can view their own patterns" 
  ON public.user_patterns FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patterns" 
  ON public.user_patterns FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patterns" 
  ON public.user_patterns FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patterns" 
  ON public.user_patterns FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para ai_insights
CREATE POLICY "Users can view their own insights" 
  ON public.ai_insights FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights" 
  ON public.ai_insights FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights" 
  ON public.ai_insights FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights" 
  ON public.ai_insights FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para smart_reminders
CREATE POLICY "Users can view their own reminders" 
  ON public.smart_reminders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
  ON public.smart_reminders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
  ON public.smart_reminders FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
  ON public.smart_reminders FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para task_sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.task_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.task_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.task_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.task_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear índices para optimización
CREATE INDEX idx_locations_user_id ON public.locations(user_id);
CREATE INDEX idx_user_patterns_user_id ON public.user_patterns(user_id);
CREATE INDEX idx_user_patterns_type ON public.user_patterns(pattern_type);
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_unread ON public.ai_insights(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_smart_reminders_user_id ON public.smart_reminders(user_id);
CREATE INDEX idx_smart_reminders_scheduled ON public.smart_reminders(scheduled_for) WHERE is_sent = FALSE;
CREATE INDEX idx_task_sessions_user_id ON public.task_sessions(user_id);
CREATE INDEX idx_task_sessions_task_id ON public.task_sessions(task_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user_patterns
CREATE TRIGGER update_user_patterns_updated_at BEFORE UPDATE ON public.user_patterns 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
