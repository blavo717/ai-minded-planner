
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
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  console.log('useThemePreference - User:', user?.id, 'Current theme:', theme);

  // Consultar preferencias del usuario
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useThemePreference - No user, skipping query');
        return null;
      }
      
      console.log('useThemePreference - Fetching preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
      
      console.log('useThemePreference - Fetched preferences:', data);
      return data as UserPreference | null;
    },
    enabled: !!user,
  });

  // Aplicar tema guardado al cargar (solo una vez cuando se obtienen las preferencias)
  useEffect(() => {
    if (preferences?.theme && !isLoading && preferences.theme !== theme) {
      console.log('useThemePreference - Applying saved theme:', preferences.theme);
      setTheme(preferences.theme);
    }
  }, [preferences?.theme, isLoading]); // Removí setTheme y theme de las dependencias para evitar loops

  // Mutación para actualizar preferencias
  const updateThemePreferenceMutation = useMutation({
    mutationFn: async (newTheme: string) => {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('useThemePreference - Updating theme in DB:', newTheme, 'for user:', user.id);

      // Verificar si ya existe una preferencia
      const { data: existingData, error: selectError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking existing preferences:', selectError);
        throw selectError;
      }

      if (existingData) {
        // Actualizar preferencia existente
        console.log('useThemePreference - Updating existing preference');
        const { data, error } = await supabase
          .from('user_preferences')
          .update({ theme: newTheme })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        console.log('useThemePreference - Updated preference:', data);
        return data;
      } else {
        // Crear nueva preferencia
        console.log('useThemePreference - Creating new preference');
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, theme: newTheme })
          .select()
          .single();

        if (error) throw error;
        console.log('useThemePreference - Created preference:', data);
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('useThemePreference - Successfully updated theme preference:', data);
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
