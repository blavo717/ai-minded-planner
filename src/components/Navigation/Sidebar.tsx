
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  Settings,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Tareas', href: '/tasks', icon: CheckSquare },
  { name: 'Proyectos', href: '/projects', icon: FolderOpen },
  { name: 'Contactos', href: '/contacts', icon: Users },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 z-40 bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">AI Planner</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <IconComponent className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
