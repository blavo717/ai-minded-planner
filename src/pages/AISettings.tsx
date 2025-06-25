
import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, BarChart3, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LLMUsageDashboard from '@/components/AI/LLMUsageDashboard';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';

const AISettings = () => {
  const { activeConfiguration, configurations } = useLLMConfigurations();

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link to="/settings" className="hover:text-foreground">
            Configuración
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Inteligencia Artificial</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Brain className="h-8 w-8 text-blue-600" />
              Configuración de IA
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona las configuraciones de IA y monitorea el uso de modelos
            </p>
          </div>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Configuración Activa</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeConfiguration ? activeConfiguration.model_name : 'Ninguna'}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeConfiguration ? 'Configurada y lista' : 'Requiere configuración'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Configuraciones</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{configurations.length}</div>
              <p className="text-xs text-muted-foreground">
                Configuraciones disponibles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Activo</div>
              <p className="text-xs text-muted-foreground">
                Funciones de IA operativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage">Dashboard de Uso</TabsTrigger>
            <TabsTrigger value="config">Configuraciones</TabsTrigger>
          </TabsList>

          <TabsContent value="usage">
            <LLMUsageDashboard />
          </TabsContent>

          <TabsContent value="config">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Configuraciones LLM</h2>
                <Button asChild>
                  <Link to="/settings/llm">
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar Configuraciones
                  </Link>
                </Button>
              </div>

              {activeConfiguration ? (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800 flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Configuración Activa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Modelo</p>
                        <p className="font-medium">{activeConfiguration.model_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Temperatura</p>
                        <p className="font-medium">{activeConfiguration.temperature}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Max Tokens</p>
                        <p className="font-medium">{activeConfiguration.max_tokens}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Top P</p>
                        <p className="font-medium">{activeConfiguration.top_p}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
                    <p className="text-muted-foreground">No hay configuración activa</p>
                    <Button asChild>
                      <Link to="/settings/llm">
                        Crear Configuración
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Available Configurations */}
              {configurations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Todas las Configuraciones</h3>
                  <div className="grid gap-2">
                    {configurations.map((config) => (
                      <Card key={config.id} className={config.is_active ? 'border-green-200' : ''}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <p className="font-medium">{config.model_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Temp: {config.temperature} • Tokens: {config.max_tokens}
                              {config.is_active && ' • Activa'}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link to="/settings/llm">
                              Editar
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AISettings;
