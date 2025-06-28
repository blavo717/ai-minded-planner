
import React from 'react';

// Este componente simplemente renderiza los children
// ya que useAuth maneja su propio contexto internamente
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
