-- Extender user_productivity_preferences con configuración de alertas personalizadas
ALTER TABLE public.user_productivity_preferences 
ADD COLUMN alert_preferences JSONB DEFAULT '{
  "enabled": true,
  "deadline_days_before": [0, 1, 2],
  "allowed_hours": "work_hours",
  "min_severity": "medium", 
  "max_daily_alerts": 3,
  "respect_focus_time": true,
  "custom_messages": false,
  "alert_types": {
    "deadline_warnings": true,
    "productivity_reminders": true,
    "task_health_alerts": true,
    "achievement_celebrations": false
  },
  "timing_strategy": "smart",
  "energy_based_timing": true
}'::jsonb;

-- Crear tabla para tracking de efectividad de alertas
CREATE TABLE public.alert_effectiveness_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  shown_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_action TEXT, -- 'accepted', 'dismissed', 'ignored', 'completed'
  action_timestamp TIMESTAMP WITH TIME ZONE,
  relevance_score INTEGER, -- 1-5 rating if provided by user
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for tracking table
ALTER TABLE public.alert_effectiveness_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for tracking
CREATE POLICY "Users can create their own tracking records"
ON public.alert_effectiveness_tracking
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tracking records"
ON public.alert_effectiveness_tracking
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking records"
ON public.alert_effectiveness_tracking
FOR UPDATE
USING (auth.uid() = user_id);

-- Índices para optimizar consultas
CREATE INDEX idx_alert_tracking_user_type ON public.alert_effectiveness_tracking(user_id, alert_type);
CREATE INDEX idx_alert_tracking_shown_at ON public.alert_effectiveness_tracking(shown_at);
CREATE INDEX idx_user_productivity_alert_prefs ON public.user_productivity_preferences USING GIN(alert_preferences);