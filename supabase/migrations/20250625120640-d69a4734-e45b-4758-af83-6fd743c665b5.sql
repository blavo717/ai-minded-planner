
-- Crear tabla para configuraciones de LLM
CREATE TABLE public.llm_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  provider TEXT NOT NULL DEFAULT 'openrouter',
  api_key_name TEXT NOT NULL DEFAULT 'OPENROUTER_API_KEY', -- Nombre del secret en Supabase
  model_name TEXT NOT NULL DEFAULT 'openai/gpt-3.5-turbo',
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 1000,
  top_p FLOAT DEFAULT 1.0,
  frequency_penalty FLOAT DEFAULT 0.0,
  presence_penalty FLOAT DEFAULT 0.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider) -- Un usuario solo puede tener una configuración activa por proveedor
);

-- Habilitar RLS
ALTER TABLE public.llm_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para llm_configurations
CREATE POLICY "Users can view their own LLM configurations" 
  ON public.llm_configurations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LLM configurations" 
  ON public.llm_configurations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LLM configurations" 
  ON public.llm_configurations FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LLM configurations" 
  ON public.llm_configurations FOR DELETE 
  USING (auth.uid() = user_id);

-- Índices para optimización
CREATE INDEX idx_llm_configurations_user_id ON public.llm_configurations(user_id);
CREATE INDEX idx_llm_configurations_active ON public.llm_configurations(user_id, is_active) WHERE is_active = TRUE;

-- Trigger para updated_at
CREATE TRIGGER update_llm_configurations_updated_at BEFORE UPDATE ON public.llm_configurations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
