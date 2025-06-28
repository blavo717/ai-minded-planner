
import React from 'react';
import { AuthProvider as UseAuthProvider } from '@/hooks/useAuth';

// Usamos el AuthProvider que está definido en useAuth.tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <UseAuthProvider>
      {children}
    </UseAuthProvider>
  );
};
