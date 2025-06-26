
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/Layout/MainLayout';
import Index from '@/pages/Index';
import Tasks from '@/pages/Tasks';
import Projects from '@/pages/Projects';
import Contacts from '@/pages/Contacts';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import AISettings from '@/pages/AISettings';
import LLMSettings from '@/pages/LLMSettings';
import Auth from '@/pages/Auth';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Index />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <MainLayout>
                  <Tasks />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/projects" element={
              <ProtectedRoute>
                <MainLayout>
                  <Projects />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/contacts" element={
              <ProtectedRoute>
                <MainLayout>
                  <Contacts />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <MainLayout>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/ai-settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <AISettings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/llm-settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <LLMSettings />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
