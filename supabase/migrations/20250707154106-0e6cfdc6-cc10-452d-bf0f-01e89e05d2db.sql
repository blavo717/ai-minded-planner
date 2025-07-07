-- Create weekly plans table for automatic planning
CREATE TABLE public.weekly_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  planned_tasks JSONB DEFAULT '[]',
  optimization_strategy TEXT DEFAULT 'balanced',
  ai_confidence NUMERIC DEFAULT 0.0,
  completion_rate NUMERIC DEFAULT 0.0,
  total_estimated_hours NUMERIC DEFAULT 0.0,
  actual_hours NUMERIC DEFAULT 0.0,
  status TEXT DEFAULT 'draft', -- draft, active, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Enable Row Level Security
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly plans
CREATE POLICY "Users can create their own weekly plans" 
ON public.weekly_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own weekly plans" 
ON public.weekly_plans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly plans" 
ON public.weekly_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own weekly plans" 
ON public.weekly_plans 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create predictive analysis table
CREATE TABLE public.predictive_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_type TEXT NOT NULL, -- 'bottleneck', 'overload', 'completion_risk'
  target_date DATE NOT NULL,
  prediction_data JSONB NOT NULL,
  confidence_score NUMERIC DEFAULT 0.0,
  severity TEXT DEFAULT 'low', -- low, medium, high, critical
  suggestions JSONB DEFAULT '[]',
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.predictive_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for predictive analysis
CREATE POLICY "Users can create their own analysis" 
ON public.predictive_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis" 
ON public.predictive_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis" 
ON public.predictive_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create proactive notifications table
CREATE TABLE public.proactive_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL, -- 'reminder', 'suggestion', 'warning', 'celebration'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_data JSONB DEFAULT '{}',
  priority INTEGER DEFAULT 3, -- 1 (highest) to 5 (lowest)
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  is_sent BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.proactive_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for proactive notifications
CREATE POLICY "Users can view their own notifications" 
ON public.proactive_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.proactive_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create calendar integrations table for future use
CREATE TABLE public.calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL, -- 'google', 'outlook', 'apple'
  integration_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_frequency INTEGER DEFAULT 15, -- minutes
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calendar_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for calendar integrations
CREATE POLICY "Users can manage their own calendar integrations" 
ON public.calendar_integrations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_weekly_plans_updated_at
BEFORE UPDATE ON public.weekly_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_predictive_analysis_updated_at
BEFORE UPDATE ON public.predictive_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at
BEFORE UPDATE ON public.calendar_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();