
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from "@/components/theme-provider"
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Projects from '@/pages/Projects';
import Team from '@/pages/Team';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import NotFound from '@/pages/NotFound';
import { useAuth, AuthProvider } from '@/hooks/useAuth';
import MainLayout from '@/components/Layout/MainLayout';
import LLMSettings from '@/pages/LLMSettings';
import AIAssistantSimple from '@/pages/AIAssistantSimple';
import AIAssistantEnhanced from '@/pages/AIAssistantEnhanced';
import Phase7Testing from '@/pages/Phase7Testing';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  const { user, loading } = useAuth();

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Cargando...</div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando aplicación...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/llm-settings" element={<LLMSettings />} />
                  <Route path="/ai-assistant-simple" element={<AIAssistantSimple />} />
                  <Route path="/ai-assistant-enhanced" element={<AIAssistantEnhanced />} />
                  <Route path="/phase7-testing" element={<Phase7Testing />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
