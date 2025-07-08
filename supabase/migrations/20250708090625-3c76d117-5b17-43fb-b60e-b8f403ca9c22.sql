-- Crear tabla central de conocimiento del usuario
CREATE TABLE public.user_knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  knowledge_type TEXT NOT NULL, -- 'personal', 'professional', 'preference', 'fact'
  category TEXT NOT NULL, -- 'basic_info', 'work_style', 'communication', 'preferences', etc.
  key_name TEXT NOT NULL, -- 'age', 'birthday', 'coffee_preference', 'work_hours', etc.
  value_text TEXT,
  value_json JSONB,
  confidence_score DECIMAL DEFAULT 0.8, -- Qué tan seguros estamos de esta información
  source TEXT NOT NULL, -- 'conversation', 'behavior_analysis', 'explicit_input'
  learned_from TEXT, -- ID del mensaje o contexto donde se aprendió
  last_confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Índices únicos para evitar duplicados
  UNIQUE(user_id, category, key_name)
);

-- Habilitar RLS
ALTER TABLE public.user_knowledge_base ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own knowledge"
ON public.user_knowledge_base
FOR ALL
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_knowledge_base_updated_at
BEFORE UPDATE ON public.user_knowledge_base
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_user_knowledge_user_id ON public.user_knowledge_base(user_id);
CREATE INDEX idx_user_knowledge_type_category ON public.user_knowledge_base(knowledge_type, category);
CREATE INDEX idx_user_knowledge_active ON public.user_knowledge_base(is_active) WHERE is_active = true;