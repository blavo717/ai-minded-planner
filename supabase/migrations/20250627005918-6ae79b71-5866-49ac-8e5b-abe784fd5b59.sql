
-- Crear tabla para filtros guardados de usuarios
CREATE TABLE public.saved_filters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  filter_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para filtros guardados
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que usuarios solo vean sus propios filtros
CREATE POLICY "Users can view their own saved filters" 
  ON public.saved_filters 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved filters" 
  ON public.saved_filters 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved filters" 
  ON public.saved_filters 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved filters" 
  ON public.saved_filters 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_saved_filters_updated_at
  BEFORE UPDATE ON public.saved_filters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para optimizar consultas
CREATE INDEX idx_saved_filters_user_id ON public.saved_filters(user_id);
CREATE INDEX idx_saved_filters_name ON public.saved_filters(user_id, name);
