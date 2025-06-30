
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Crear un usuario mock para desarrollo
const mockUser: User = {
  id: 'dev-user-id',
  email: 'dev@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
  email_confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { full_name: 'Usuario de Desarrollo' },
  identities: [],
  factors: []
};

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // En desarrollo, siempre retornamos un usuario autenticado
  const [user, setUser] = useState<User | null>(mockUser);
  const [session, setSession] = useState<Session | null>(mockSession);
  const [loading, setLoading] = useState(false); // Sin loading en desarrollo
  const { toast } = useToast();

  useEffect(() => {
    // En desarrollo, simplemente establecemos el usuario mock
    console.log('🔧 AUTH DISABLED FOR DEVELOPMENT - Using mock user');
    setSession(mockSession);
    setUser(mockUser);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    toast({
      title: "Modo desarrollo",
      description: "Autenticación deshabilitada para desarrollo",
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    toast({
      title: "Modo desarrollo",
      description: "Autenticación deshabilitada para desarrollo",
    });
    return { error: null };
  };

  const signOut = async () => {
    toast({
      title: "Modo desarrollo",
      description: "Autenticación deshabilitada para desarrollo",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
