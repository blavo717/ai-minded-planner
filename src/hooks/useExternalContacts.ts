
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ExternalContact {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  country?: string;
  contact_type: 'contractor' | 'supplier' | 'authority' | 'consultant' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExternalContactData {
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  country?: string;
  contact_type: 'contractor' | 'supplier' | 'authority' | 'consultant' | 'other';
  notes?: string;
}

export const useExternalContacts = () => {
  const { user } = useAuth();

  const { data: externalContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['external_contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('external_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ExternalContact[];
    },
    enabled: !!user,
  });

  return {
    externalContacts,
    isLoading: contactsLoading,
  };
};
