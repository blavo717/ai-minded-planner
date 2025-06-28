
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, ListChecks, Settings, Users, TestTube, BarChart3, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

export const Sidebar = () => {
  const location = useLocation();

  const navigationItems: NavItem[] = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      description: 'Resumen general de tu actividad'
    },
    {
      name: 'Tareas',
      href: '/tasks',
      icon: ListChecks,
      description: 'Gestión de tareas y proyectos'
    },
    {
      name: 'Proyectos',
      href: '/projects',
      icon: FolderOpen,
      description: 'Gestión de proyectos'
    },
    {
      name: 'Calendario',
      href: '/calendar',
      icon: Calendar,
      description: 'Planificación y gestión de eventos'
    },
    {
      name: 'Analíticas',
      href: '/analytics',
      icon: BarChart3,
      description: 'Métricas y análisis de productividad'
    },
    {
      name: 'Equipo',
      href: '/team',
      icon: Users,
      description: 'Colaboración y gestión de equipo'
    },
    {
      name: 'Ajustes',
      href: '/settings',
      icon: Settings,
      description: 'Configuración de la aplicación'
    },
    {
      name: 'Phase 2 Testing',
      href: '/phase2-testing',
      icon: TestTube,
      description: 'Testing completo del Context Engine'
    },
  ];

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Navegación</h2>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        {/* Footer */}
        <div className="border-t border-border p-4">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TaskAI
          </p>
        </div>
      </div>
    </div>
  );
};
