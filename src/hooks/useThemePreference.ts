
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { useEffect } from 'react';

interface UserPreference {
  id: string;
  user_id: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export const useThemePreference = () => {
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Consultar preferencias del usuario
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
      
      return data as UserPreference | null;
    },
    enabled: !!user,
  });

  // Aplicar tema guardado al cargar
  useEffect(() => {
    if (preferences?.theme && !isLoading) {
      setTheme(preferences.theme);
    }
  }, [preferences, isLoading, setTheme]);

  // Mutación para actualizar preferencias
  const updateThemePreferenceMutation = useMutation({
    mutationFn: async (newTheme: string) => {
      if (!user) throw new Error('Usuario no autenticado');

      // Intentar actualizar primero
      const { data: existingData, error: selectError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing preferences:', selectError);
      }

      if (existingData) {
        // Actualizar preferencia existente
        const { data, error } = await supabase
          .from('user_preferences')
          .update({ theme: newTheme })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Crear nueva preferencia
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, theme: newTheme })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences', user?.id] });
    },
    onError: (error) => {
      console.error('Error updating theme preference:', error);
    },
  });

  return {
    preferences,
    isLoading,
    updateThemePreference: updateThemePreferenceMutation.mutateAsync,
    isUpdating: updateThemePreferenceMutation.isPending,
  };
};
