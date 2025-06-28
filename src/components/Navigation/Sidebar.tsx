
import React from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ListChecks,
  Settings,
  LogOut,
  MessageSquare,
  TestTube
} from 'lucide-react';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => {
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
      title: 'IA Asistente',
      href: '/ai-assistant-simple',
      icon: MessageSquare,
    },
    {
      title: 'Testing Fase 7',
      href: '/phase7-testing',
      icon: TestTube,
    },
    {
      title: 'Configuración',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold">AI Planner</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isActive(item.href) && "bg-accent text-accent-foreground"
            )}
            onClick={() => navigate(item.href)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Button>
        ))}
      </nav>
      
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
