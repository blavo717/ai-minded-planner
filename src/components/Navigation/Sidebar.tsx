
import React from 'react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ui/theme-toggle";
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  ListChecks,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Menu,
  MessageSquare
} from 'lucide-react';

const Sidebar = () => {
  const { user, signOut } = useAuth();
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
      description: 'Resumen general de tu actividad'
    },
    {
      title: 'Tareas',
      href: '/tasks',
      icon: ListChecks,
      description: 'Gestiona tus tareas y proyectos'
    },
    {
      title: 'Calendario',
      href: '/calendar',
      icon: Calendar,
      description: 'Visualiza tus tareas en un calendario'
    },
    {
      title: 'IA Asistente Simple',
      href: '/ai-assistant-simple',
      icon: MessageSquare,
      description: 'Asistente de IA simplificado'
    },
    {
      title: 'Perfil',
      href: '/profile',
      icon: User,
      description: 'Gestiona tu perfil de usuario'
    },
    {
      title: 'Configuración',
      href: '/settings',
      icon: Settings,
      description: 'Ajusta la configuración de la aplicación'
    },
    {
      title: 'Ayuda',
      href: '/help',
      icon: HelpCircle,
      description: 'Obtén ayuda y soporte'
    },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-64 flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between">
          <span className="font-bold">Menú</span>
          <ThemeToggle />
        </div>
        <nav className="flex flex-col space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "justify-start",
                isActive(item.href) ? "font-semibold" : "text-muted-foreground"
              )}
              onClick={() => navigate(item.href)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          ))}
        </nav>
        <div className="mt-auto">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
