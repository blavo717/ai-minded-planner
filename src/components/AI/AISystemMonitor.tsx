
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Brain, 
  Database, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useLLMService } from '@/hooks/useLLMService';
import { useAIAssistantSimple } from '@/hooks/useAIAssistantSimple';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    context: 'healthy' | 'warning' | 'critical';
    prompts: 'healthy' | 'warning' | 'critical';
    llm: 'healthy' | 'warning' | 'critical';
    assistant: 'healthy' | 'warning' | 'critical';
  };
}

export const AISystemMonitor: React.FC = () => {
  const { currentContext, isUpdating, lastUpdateTime, config } = useAIContext();
  const { isLoading: isLLMLoading, hasActiveConfiguration, activeModel } = useLLMService();
  const { messages, isLoading: isAssistantLoading, connectionStatus } = useAIAssistantSimple();
  
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 'healthy',
    components: {
      context: 'healthy',
      prompts: 'healthy',
      llm: 'healthy',
      assistant: 'healthy'
    }
  });
  const [refreshCount, setRefreshCount] = useState(0);

  // Calcular métricas de rendimiento
  useEffect(() => {
    const calculateMetrics = () => {
      const now = new Date();
      const timeSinceUpdate = lastUpdateTime ? now.getTime() - lastUpdateTime.getTime() : 0;
      
      const newMetrics: PerformanceMetric[] = [
        {
          name: 'Tiempo desde última actualización',
          value: Math.round(timeSinceUpdate / 1000),
          unit: 'segundos',
          status: timeSinceUpdate < 300000 ? 'good' : timeSinceUpdate < 600000 ? 'warning' : 'critical'
        },
        {
          name: 'Tareas en contexto',
          value: currentContext?.recentTasks?.length || 0,
          unit: 'items',
          status: (currentContext?.recentTasks?.length || 0) > 0 ? 'good' : 'warning'
        },
        {
          name: 'Proyectos en contexto',
          value: currentContext?.recentProjects?.length || 0,
          unit: 'items',
          status: (currentContext?.recentProjects?.length || 0) > 0 ? 'good' : 'warning'
        },
        {
          name: 'Mensajes del asistente',
          value: messages.length,
          unit: 'mensajes',
          status: messages.length > 0 ? 'good' : 'warning'
        },
        {
          name: 'Configuración LLM',
          value: hasActiveConfiguration ? 1 : 0,
          unit: 'activa',
          status: hasActiveConfiguration ? 'good' : 'critical'
        }
      ];
      
      setMetrics(newMetrics);
    };

    calculateMetrics();
    const interval = setInterval(calculateMetrics, 5000); // Actualizar cada 5 segundos
    
    return () => clearInterval(interval);
  }, [currentContext, lastUpdateTime, messages.length, hasActiveConfiguration]);

  // Evaluar salud del sistema
  useEffect(() => {
    const evaluateSystemHealth = () => {
      const contextHealth = currentContext && 
        currentContext.userInfo && 
        currentContext.currentSession ? 'healthy' : 'warning';
      
      const promptsHealth = currentContext?.userInfo?.id ? 'healthy' : 'warning';
      
      const llmHealth = hasActiveConfiguration ? 'healthy' : 'critical';
      
      const assistantHealth = connectionStatus === 'connected' ? 'healthy' : 
        connectionStatus === 'error' ? 'critical' : 'warning';

      const components = {
        context: contextHealth,
        prompts: promptsHealth,
        llm: llmHealth,
        assistant: assistantHealth
      };

      const criticalCount = Object.values(components).filter(status => status === 'critical').length;
      const warningCount = Object.values(components).filter(status => status === 'warning').length;

      const overall = criticalCount > 0 ? 'critical' : 
        warningCount > 0 ? 'warning' : 'healthy';

      setSystemHealth({ overall, components });
    };

    evaluateSystemHealth();
  }, [currentContext, hasActiveConfiguration, connectionStatus]);

  const getHealthIcon = (health: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getHealthColor = (health: 'healthy' | 'warning' | 'critical') => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getMetricColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
    }
  };

  const forceRefresh = () => {
    setRefreshCount(prev => prev + 1);
    // Aquí podrías llamar a métodos de refresh de los hooks si estuvieran disponibles
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitor del Sistema de IA
          </CardTitle>
          <CardDescription>
            Estado en tiempo real del sistema de asistente inteligente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {getHealthIcon(systemHealth.overall)}
                <Badge className={getHealthColor(systemHealth.overall)}>
                  Sistema {systemHealth.overall === 'healthy' ? 'Saludable' : 
                    systemHealth.overall === 'warning' ? 'Con Advertencias' : 'Crítico'}
                </Badge>
              </div>
              
              {(isUpdating || isLLMLoading || isAssistantLoading) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Actualizando...
                </Badge>
              )}
            </div>
            
            <Button variant="outline" size="sm" onClick={forceRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="components">Componentes</TabsTrigger>
              <TabsTrigger value="metrics">Métricas</TabsTrigger>
              <TabsTrigger value="config">Configuración</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <div className="text-sm font-medium">Contexto</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getHealthIcon(systemHealth.components.context)}
                      <div className="text-xs text-muted-foreground">
                        {systemHealth.components.context}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <div className="text-sm font-medium">Prompts</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getHealthIcon(systemHealth.components.prompts)}
                      <div className="text-xs text-muted-foreground">
                        {systemHealth.components.prompts}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <div className="text-sm font-medium">LLM</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getHealthIcon(systemHealth.components.llm)}
                      <div className="text-xs text-muted-foreground">
                        {systemHealth.components.llm}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <div className="text-sm font-medium">Asistente</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getHealthIcon(systemHealth.components.assistant)}
                      <div className="text-xs text-muted-foreground">
                        {systemHealth.components.assistant}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Estado del Contexto</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Información del Usuario</div>
                      <div className="text-muted-foreground">
                        {currentContext?.userInfo ? 'Disponible' : 'No disponible'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Sesión Actual</div>
                      <div className="text-muted-foreground">
                        {currentContext?.currentSession?.timeOfDay || 'No disponible'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Actividad Reciente</div>
                      <div className="text-muted-foreground">
                        {currentContext?.recentActivity?.workPattern || 'No disponible'}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Última Actualización</div>
                      <div className="text-muted-foreground">
                        {lastUpdateTime ? lastUpdateTime.toLocaleTimeString() : 'Nunca'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="components" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Sistema de Contexto
                      {getHealthIcon(systemHealth.components.context)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-2">
                      <div>Estado: {isUpdating ? 'Actualizando...' : 'Idle'}</div>
                      <div>Configuración: {JSON.stringify(config)}</div>
                      <div>Datos disponibles: {currentContext ? 'Sí' : 'No'}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Servicio LLM
                      {getHealthIcon(systemHealth.components.llm)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-2">
                      <div>Estado: {isLLMLoading ? 'Cargando...' : 'Disponible'}</div>
                      <div>Configuración activa: {hasActiveConfiguration ? 'Sí' : 'No'}</div>
                      <div>Modelo activo: {activeModel || 'N/A'}</div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Asistente IA
                      {getHealthIcon(systemHealth.components.assistant)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="space-y-2">
                      <div>Estado de conexión: {connectionStatus}</div>
                      <div>Mensajes: {messages.length}</div>
                      <div>Cargando: {isAssistantLoading ? 'Sí' : 'No'}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {metrics.map((metric, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{metric.name}</div>
                            <div className={`text-lg font-bold ${getMetricColor(metric.status)}`}>
                              {metric.value} {metric.unit}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {metric.trend && (
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Badge className={getHealthColor(
                              metric.status === 'good' ? 'healthy' : 
                              metric.status === 'warning' ? 'warning' : 'critical'
                            )}>
                              {metric.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="config" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Configuración del Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                    {JSON.stringify({
                      aiContext: config,
                      llm: {
                        hasActiveConfiguration,
                        activeModel
                      },
                      assistant: {
                        connectionStatus,
                        messagesCount: messages.length
                      }
                    }, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
