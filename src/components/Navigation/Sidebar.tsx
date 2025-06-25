
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Calendar, 
  BarChart3, 
  Settings,
  Brain
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    name: 'Tareas',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Proyectos',
    href: '/projects',
    icon: FolderOpen,
  },
  {
    name: 'Calendario',
    href: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <Brain className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">AI Planner</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          AI Planner v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
