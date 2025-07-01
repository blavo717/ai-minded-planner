
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  email?: string;
  full_name: string; // Made required to match CreateTaskModal expectations
  avatar_url?: string;
  timezone?: string;
  role?: 'project_manager' | 'engineer' | 'coordinator' | 'specialist' | 'admin';
  skills?: string[];
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      
      // Transform the data to ensure full_name is always present
      return data.map(profile => ({
        ...profile,
        full_name: profile.full_name || profile.email || 'Usuario Sin Nombre'
      })) as Profile[];
    },
  });

  return {
    profiles,
    isLoading: profilesLoading,
  };
};
