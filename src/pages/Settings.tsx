
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Brain, 
  BarChart3,
  Settings as SettingsIcon,
  ChevronRight 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Settings = () => {
  const settingsSections = [
    {
      title: 'Perfil de Usuario',
      description: 'Gestiona tu información personal y preferencias',
      icon: User,
      href: '/settings/profile',
      color: 'text-blue-600',
    },
    {
      title: 'Inteligencia Artificial',
      description: 'Configuraciones de IA, modelos LLM y análisis',
      icon: Brain,
      href: '/settings/ai',
      color: 'text-purple-600',
    },
    {
      title: 'Configuración LLM',
      description: 'Modelos de lenguaje y parámetros de IA',
      icon: SettingsIcon,
      href: '/settings/llm',
      color: 'text-green-600',
    },
    {
      title: 'Notificaciones',
      description: 'Configura alertas y recordatorios',
      icon: Bell,
      href: '/settings/notifications',
      color: 'text-yellow-600',
    },
    {
      title: 'Privacidad y Seguridad',
      description: 'Controla tu información y seguridad',
      icon: Shield,
      href: '/settings/privacy',
      color: 'text-red-600',
    },
    {
      title: 'Apariencia',
      description: 'Personaliza el tema y la interfaz',
      icon: Palette,
      href: '/settings/appearance',
      color: 'text-pink-600',
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Personaliza tu experiencia y gestiona tu cuenta
          </p>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {settingsSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.href} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className={`h-5 w-5 ${section.color}`} />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {section.description}
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full">
                    <Link to={section.href} className="flex items-center justify-between">
                      <span>Configurar</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings/ai">
                  <Brain className="h-4 w-4 mr-2" />
                  Dashboard de IA
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings/llm">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configurar LLM
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link to="/settings/profile">
                  <User className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
