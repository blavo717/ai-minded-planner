
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Projects from "./pages/Projects";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import LLMSettings from "./pages/LLMSettings";
import AISettings from "./pages/AISettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/contacts" element={<Contacts />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/settings/llm" element={<LLMSettings />} />
                        <Route path="/settings/ai" element={<AISettings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
