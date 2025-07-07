-- Crear tabla para recordatorios inteligentes
CREATE TABLE public.smart_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  reminder_type VARCHAR(50) NOT NULL DEFAULT 'task_reminder',
  message TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'dismissed', 'expired')),
  context_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.smart_reminders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own reminders" 
ON public.smart_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.smart_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.smart_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.smart_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_smart_reminders_updated_at
BEFORE UPDATE ON public.smart_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on scheduled reminders
CREATE INDEX idx_smart_reminders_scheduled ON public.smart_reminders(scheduled_for, status) WHERE status = 'pending';
CREATE INDEX idx_smart_reminders_user_status ON public.smart_reminders(user_id, status);

-- Create function to get pending reminders
CREATE OR REPLACE FUNCTION public.get_pending_reminders(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  task_id UUID,
  reminder_type VARCHAR(50),
  message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  task_title TEXT,
  task_priority VARCHAR(20)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sr.id,
    sr.task_id,
    sr.reminder_type,
    sr.message,
    sr.scheduled_for,
    t.title as task_title,
    t.priority as task_priority
  FROM public.smart_reminders sr
  LEFT JOIN public.tasks t ON sr.task_id = t.id
  WHERE sr.user_id = user_uuid 
    AND sr.status = 'pending'
    AND sr.scheduled_for <= now()
  ORDER BY sr.scheduled_for ASC;
END;
$$;