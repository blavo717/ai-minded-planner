
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

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
