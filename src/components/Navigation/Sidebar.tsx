import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Calendar, ListChecks, Settings, Users, TestTube } from 'lucide-react';

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
      name: 'Calendario',
      href: '/calendar',
      icon: Calendar,
      description: 'Planificación y gestión de eventos'
    },
    {
      name: 'Tareas',
      href: '/tasks',
      icon: ListChecks,
      description: 'Gestión de tareas y proyectos'
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
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <h3 className="font-bold text-lg">Navegación</h3>
      </div>
      <nav className="flex-1">
        <ul>
          {navigationItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 ${location.pathname === item.href ? 'bg-gray-200' : ''
                  }`}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto px-4 py-2 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} TaskAI</p>
      </div>
    </div>
  );
};
