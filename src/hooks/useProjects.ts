
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
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
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
