
import React from 'react';
import { Button } from "@/components/ui/button";
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
  Brain
} from 'lucide-react';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      title: 'Planificador',
      href: '/planner',
      icon: Brain,
    },
    {
      title: 'IA',
      href: '/ai-assistant-enhanced',
      icon: Brain,
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
              isActive(item.href) && "bg-accent text-accent-foreground",
              item.href === '/ai-assistant-enhanced' && "text-purple-700 hover:text-purple-800 hover:bg-purple-100"
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
