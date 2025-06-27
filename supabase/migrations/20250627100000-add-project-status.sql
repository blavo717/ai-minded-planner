
-- Add status and completion fields to projects table
ALTER TABLE public.projects 
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'on_hold')),
ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN completion_notes TEXT;

-- Add index for better performance on status queries
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_user_status ON public.projects(user_id, status);
