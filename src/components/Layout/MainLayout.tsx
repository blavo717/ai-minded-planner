
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, MessageSquare, X, Brain } from 'lucide-react';
import Sidebar from '@/components/Navigation/Sidebar';
import EnhancedAIAssistantPanel from '@/components/ai/EnhancedAIAssistantPanel';
import ThemeToggle from '@/components/ui/theme-toggle';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, signOut } = useAuth();
  const [showAIPopup, setShowAIPopup] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Header */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="flex justify-between items-center h-16 px-6">
            <div className="flex-1" />
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-card-foreground">
                  {user?.email}
                </span>
              </div>
              
              <ThemeToggle />
              
              {/* AI Assistant Pop-up Toggle - Enhanced version */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAIPopup(true)}
                className="flex items-center space-x-2 bg-purple-50 border-purple-200 hover:bg-purple-100"
              >
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-purple-700">IA Enriquecido</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Enhanced AI Assistant Pop-up */}
      {showAIPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-2 border-purple-200">
            <div className="flex items-center justify-between p-4 border-b border-purple-100 bg-purple-50">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-purple-800">
                <Brain className="h-5 w-5 text-purple-600" />
                Asistente IA Enriquecido
                <span className="text-sm font-normal text-purple-600">
                  Con memoria y contexto completo
                </span>
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAIPopup(false)}
                className="hover:bg-purple-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <EnhancedAIAssistantPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
