
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Key, User, Bell, Palette, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  const settingsCards = [
    {
      title: 'Configuración de IA',
      description: 'Configura tus modelos de lenguaje y parámetros de IA',
      icon: Brain,
      href: '/settings/llm',
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Perfil',
      description: 'Gestiona tu información personal y preferencias',
      icon: User,
      href: '/settings/profile',
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Notificaciones',
      description: 'Configura alertas y recordatorios',
      icon: Bell,
      href: '/settings/notifications',
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      title: 'Apariencia',
      description: 'Personaliza temas y diseño',
      icon: Palette,
      href: '/settings/appearance',
      color: 'text-purple-600 bg-purple-100',
    },
    {
      title: 'Seguridad',
      description: 'Controla la privacidad y seguridad de tu cuenta',
      icon: Shield,
      href: '/settings/security',
      color: 'text-red-600 bg-red-100',
    },
  ];

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus preferencias y configuraciones de la aplicación
          </p>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card) => (
            <Link key={card.href} to={card.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color} mb-3`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
