
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  FolderOpen,
  Settings,
  LogOut,
  BarChart3,
  Brain,
  Menu,
  X,
  User,
  Calendar
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import IntelligentAIAssistantPanel from '@/components/ai/IntelligentAIAssistantPanel';
import AIAssistantBadge from '@/components/Navigation/AIAssistantBadge';
import { useReminderBadge } from '@/hooks/useReminderBadge';

const TopNavigation = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAIPopup, setShowAIPopup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hook para manejo del badge de recordatorios
  const { 
    reminderCount, 
    urgentCount, 
    hasReminders, 
    markRemindersAsRead 
  } = useReminderBadge();

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname === href;
  };

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Tareas',
      href: '/tasks',
      icon: ListChecks,
    },
    {
      title: 'Planner',
      href: '/planner',
      icon: Calendar,
    },
    {
      title: 'Proyectos',
      href: '/projects',
      icon: FolderOpen,
    },
    {
      title: 'Analíticas',
      href: '/analytics',
      icon: BarChart3,
    },
    {
      title: 'Configuración',
      href: '/settings',
      icon: Settings,
    },
  ];

  // Escuchar evento custom para abrir asistente desde notificaciones
  useEffect(() => {
    const handleOpenAIAssistant = (event: CustomEvent) => {
      setShowAIPopup(true);
      if (hasReminders) {
        markRemindersAsRead();
      }
    };

    window.addEventListener('openAIAssistant', handleOpenAIAssistant as EventListener);
    return () => window.removeEventListener('openAIAssistant', handleOpenAIAssistant as EventListener);
  }, [hasReminders, markRemindersAsRead]);

  const handleAIButtonClick = () => {
    setShowAIPopup(true);
    if (hasReminders) {
      markRemindersAsRead();
    }
  };

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-foreground">AI Planner</h2>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  className={cn(
                    "h-16 px-4 rounded-none border-b-2 border-transparent hover:border-border transition-colors",
                    isActive(item.href) && "border-primary bg-accent/50"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* User info - hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground truncate max-w-32">
                  {user?.email}
                </span>
              </div>
              
              <ThemeToggle />
              
              {/* AI Assistant con Badge de Notificaciones */}
              <AIAssistantBadge onClick={handleAIButtonClick} />
              
              {/* Logout - hidden on mobile */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={signOut}
                className="hidden sm:flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-card">
              <div className="space-y-1 py-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-12",
                      isActive(item.href) && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => {
                      navigate(item.href);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.title}
                  </Button>
                ))}
                
                {/* Mobile user info and logout */}
                <div className="border-t border-border pt-2 mt-2">
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    {user?.email}
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* AI Assistant Pop-up */}
      {showAIPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-2 border-purple-200">
            <div className="flex items-center justify-between p-4 border-b border-purple-100 bg-purple-50 dark:bg-purple-900/20">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-purple-800 dark:text-purple-300">
                <Brain className="h-5 w-5 text-purple-600" />
                Asistente de IA
                <span className="text-sm font-normal text-purple-600 dark:text-purple-400">
                  Con memoria y contexto completo
                </span>
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAIPopup(false)}
                className="hover:bg-purple-100 dark:hover:bg-purple-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <IntelligentAIAssistantPanel />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavigation;
