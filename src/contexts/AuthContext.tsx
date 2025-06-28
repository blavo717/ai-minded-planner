
import React, { createContext, useContext } from 'react';
import { useAuth as useSupabaseAuth } from '@/hooks/useAuth';

// Re-exportamos el contexto de autenticación desde useAuth
const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  return useSupabaseAuth();
};
