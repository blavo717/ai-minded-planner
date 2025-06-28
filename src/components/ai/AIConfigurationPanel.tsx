
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Settings, MessageCircle, CheckCircle } from 'lucide-react';
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
            Configuración del Asistente IA
          </CardTitle>
          <CardDescription>
            Sistema de asistente IA simplificado e inteligente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Estado de configuración activa */}
          {activeConfiguration ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>✅ Sistema IA activo:</strong> {activeConfiguration.model_name}
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
                <strong>⚙️ Configuración requerida:</strong> Configura tu LLM para habilitar el asistente IA.
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
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Estado</span>
              </div>
              <Badge variant={activeConfiguration ? "default" : "secondary"} className="mt-2">
                {activeConfiguration ? "✅ Activo" : "⚪ Inactivo"}
              </Badge>
              <p className="text-sm text-green-600 mt-1">Sistema IA</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Versión</span>
              </div>
              <p className="text-lg font-bold text-purple-700 mt-2">
                v2.0 Simple
              </p>
              <p className="text-sm text-purple-600">Limpia y estable</p>
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
                Asistente Listo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estado post-limpieza */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🧹 Fase 0: Limpieza Completada</CardTitle>
          <CardDescription>
            Sistema simplificado y preparado para mejoras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">✅ Archivos duplicados eliminados</span>
              <Badge variant="default">8 archivos</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">✅ Sistema unificado</span>
              <Badge variant="default">1 asistente</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">✅ Base limpia para mejoras</span>
              <Badge variant="default">Preparado</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">⏳ Próximo: Prompts inteligentes</span>
              <Badge variant="outline">Fase 1</Badge>
            </div>
          </div>
          
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>✅ Fase 0 completada:</strong> Sistema limpio y preparado. 
              El asistente ahora usa una arquitectura unificada y estable, 
              lista para recibir el sistema de prompts inteligente en la Fase 1.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIConfigurationPanel;
