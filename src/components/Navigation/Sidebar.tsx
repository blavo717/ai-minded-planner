
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  FolderOpen, 
  Users, 
  Settings,
  Brain,
  BarChart3,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, current: location.pathname === '/' },
    { name: 'Tareas', href: '/tasks', icon: CheckSquare, current: location.pathname === '/tasks' },
    { name: 'Proyectos', href: '/projects', icon: FolderOpen, current: location.pathname === '/projects' },
    { name: 'Contactos', href: '/contacts', icon: Users, current: location.pathname === '/contacts' },
    { name: 'Analíticas', href: '/analytics', icon: BarChart3, current: location.pathname === '/analytics' },
    { name: 'IA Configuración', href: '/ai-settings', icon: Brain, current: location.pathname === '/ai-settings' },
    { name: 'LLM Settings', href: '/llm-settings', icon: Settings, current: location.pathname === '/llm-settings' },
    { name: 'Configuración', href: '/settings', icon: Settings, current: location.pathname === '/settings' },
    { name: 'Test Tareas', href: '/task-testing', icon: Database, current: location.pathname === '/task-testing' },
  ];

  return (
    <div className="flex h-screen w-64 flex-col fixed left-0 top-0 z-40 bg-card border-r border-border">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">AI Planner</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.current;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
