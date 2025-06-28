import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { Auth } from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Projects from '@/pages/Projects';
import Team from '@/pages/Team';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/Layout/MainLayout';
import LLMSettings from '@/pages/LLMSettings';
import TestingSuite from '@/components/testing/TestingSuite';
import TaskDetails from '@/components/tasks/TaskDetails';
import AIAssistantSimple from '@/pages/AIAssistantSimple';

function App() {
  const { isLoggedIn, checkAuth } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const check = async () => {
      await checkAuth();
      setCheckingAuth(false);
    };

    check();
  }, [checkAuth]);

  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (checkingAuth) {
      return <div>Cargando...</div>;
    }

    if (!isLoggedIn) {
      return <Navigate to="/auth" replace />;
    }

    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
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
                        <Route path="/tasks/:taskId" element={<TaskDetails />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/llm-settings" element={<LLMSettings />} />
                        <Route path="/testing" element={<TestingSuite />} />
                        <Route path="/ai-assistant-simple" element={<AIAssistantSimple />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
