-- Create user achievements table for persistent achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress NUMERIC DEFAULT 0,
  max_progress NUMERIC DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user achievements
CREATE POLICY "Users can create their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create user productivity preferences table
CREATE TABLE public.user_productivity_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  work_hours_start INTEGER DEFAULT 9, -- Hour of day (0-23)
  work_hours_end INTEGER DEFAULT 17,   -- Hour of day (0-23)
  preferred_work_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Days of week (0=Sunday, 6=Saturday)
  energy_schedule JSONB DEFAULT '{"high": [9,10,11], "medium": [12,13,14,15,16], "low": [17,18,19]}',
  notification_frequency INTEGER DEFAULT 30, -- Minutes
  focus_session_duration INTEGER DEFAULT 25, -- Minutes (Pomodoro style)
  break_duration INTEGER DEFAULT 5, -- Minutes
  timezone TEXT DEFAULT 'UTC',
  productivity_goals JSONB DEFAULT '{"daily_tasks": 3, "weekly_tasks": 15}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_productivity_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for productivity preferences
CREATE POLICY "Users can create their own preferences" 
ON public.user_productivity_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own preferences" 
ON public.user_productivity_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_productivity_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_user_productivity_preferences_updated_at
BEFORE UPDATE ON public.user_productivity_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();