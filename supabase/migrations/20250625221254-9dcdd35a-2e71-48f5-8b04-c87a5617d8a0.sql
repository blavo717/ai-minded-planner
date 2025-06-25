
-- Crear tabla para mensajes de chat AI
CREATE TABLE public.ai_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('user', 'assistant', 'notification', 'suggestion')),
  content TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  context_data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  has_error BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para estado de smart messaging
CREATE TABLE public.smart_notifications_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_followup_check TIMESTAMP WITH TIME ZONE,
  last_inactive_check TIMESTAMP WITH TIME ZONE,
  last_deadline_check TIMESTAMP WITH TIME ZONE,
  last_productivity_check TIMESTAMP WITH TIME ZONE,
  notification_frequency INTEGER NOT NULL DEFAULT 300, -- 5 minutos en segundos
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_notifications_state ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ai_chat_messages
CREATE POLICY "Users can manage their own chat messages" ON public.ai_chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para smart_notifications_state
CREATE POLICY "Users can manage their own notification state" ON public.smart_notifications_state
  FOR ALL USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_ai_chat_messages_user_id_created_at ON public.ai_chat_messages(user_id, created_at DESC);
CREATE INDEX idx_ai_chat_messages_user_id_unread ON public.ai_chat_messages(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_smart_notifications_state_user_id ON public.smart_notifications_state(user_id);

-- Trigger para updated_at en ambas tablas
CREATE TRIGGER update_ai_chat_messages_updated_at
  BEFORE UPDATE ON public.ai_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_smart_notifications_state_updated_at
  BEFORE UPDATE ON public.smart_notifications_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar realtime para sincronización
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_notifications_state;
