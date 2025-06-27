
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  status?: 'active' | 'completed' | 'archived' | 'on_hold';
  completed_at?: string;
  archived_at?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  // Nuevos campos añadidos
  start_date?: string;
  end_date?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  budget?: number;
  budget_used: number;
  tags?: string[];
  category?: string;
  estimated_hours?: number;
  actual_hours: number;
  change_reason?: string;
  last_status_change?: string;
  template_name?: string;
  custom_fields: Record<string, any>;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
  start_date?: string;
  end_date?: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  budget?: number;
  tags?: string[];
  category?: string;
  estimated_hours?: number;
  template_name?: string;
  custom_fields?: Record<string, any>;
}

export interface UpdateProjectData {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  status?: 'active' | 'completed' | 'archived' | 'on_hold';
  completed_at?: string | null;
  archived_at?: string | null;
  completion_notes?: string;
  start_date?: string | null;
  end_date?: string | null;
  deadline?: string | null;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number;
  budget?: number;
  budget_used?: number;
  tags?: string[];
  category?: string;
  estimated_hours?: number;
  actual_hours?: number;
  change_reason?: string;
  last_status_change?: string;
  template_name?: string;
  custom_fields?: Record<string, any>;
}

export const useProjects = () => {
  const { user } = useAuth();

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  return {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
  };
};
