
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useCheckSession = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Verificación de sesión - se ejecuta cuando cambia el estado de autenticación
    if (!loading) {
      console.log('Session check:', user ? 'Authenticated' : 'Not authenticated');
    }
  }, [user, loading]);

  return { user, loading };
};
