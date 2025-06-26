
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, Zap, MessageCircle } from 'lucide-react';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';
import { Link } from 'react-router-dom';

const AIConfigurationPanel = () => {
  const { configurations, activeConfiguration, isLoading } = useLLMConfigurations();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Panel de Configuración IA
          </CardTitle>
          <CardDescription>
            Gestiona la configuración y el comportamiento de tu asistente IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado de configuración activa */}
          {activeConfiguration ? (
            <Alert className="bg-green-50 border-green-200">
              <Zap className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Configuración activa:</strong> {activeConfiguration.model_name}
                <br />
                <span className="text-sm">
                  Temperatura: {activeConfiguration.temperature} | 
                  Max tokens: {activeConfiguration.max_tokens}
                </span>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Settings className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Sin configuración activa.</strong> Configura tu LLM para habilitar el asistente IA.
              </AlertDescription>
            </Alert>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Configuraciones</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                {configurations.length}
              </p>
              <p className="text-sm text-blue-600">Total disponibles</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="font-medium">Estado</span>
              </div>
              <Badge variant={activeConfiguration ? "default" : "secondary"} className="mt-2">
                {activeConfiguration ? "Activo" : "Inactivo"}
              </Badge>
              <p className="text-sm text-green-600 mt-1">Sistema IA</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Modo</span>
              </div>
              <p className="text-lg font-bold text-purple-700 mt-2">
                Chat Simple
              </p>
              <p className="text-sm text-purple-600">Asistente básico</p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="flex gap-3 pt-4">
            <Button asChild>
              <Link to="/settings/llm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar LLM
              </Link>
            </Button>
            
            {activeConfiguration && (
              <Button variant="outline">
                <MessageCircle className="h-4 w-4 mr-2" />
                Probar Chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información del asistente simplificado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asistente IA Simplificado</CardTitle>
          <CardDescription>
            Versión básica del asistente para máxima estabilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Chat manual</span>
              <Badge variant="default">✓ Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Historial local</span>
              <Badge variant="default">✓ Activo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Notificaciones automáticas</span>
              <Badge variant="secondary">✗ Desactivado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Smart Messaging</span>
              <Badge variant="secondary">✗ Desactivado</Badge>
            </div>
          </div>
          
          <Alert className="mt-4">
            <AlertDescription className="text-sm">
              <strong>Modo simplificado activo:</strong> El asistente funciona solo con chat manual 
              para garantizar máxima estabilidad y facilidad de testing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigurationPanel;
