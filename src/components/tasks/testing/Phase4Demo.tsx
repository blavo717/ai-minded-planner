
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar,
  Clock,
  Zap,
  Brain,
  Target,
  Coffee,
  Play,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useDailyPlanner } from '@/hooks/useDailyPlanner';
import { useLLMConfigurations } from '@/hooks/useLLMConfigurations';

const Phase4Demo = () => {
  const { mainTasks } = useTasks();
  const { 
    todaysPlan, 
    generatePlan, 
    isGeneratingPlan, 
    refreshPlans 
  } = useDailyPlanner();
  const { activeConfiguration } = useLLMConfigurations();

  const [showDetails, setShowDetails] = useState(false);

  const handleGenerateDemo = () => {
    const today = new Date().toISOString().split('T')[0];
    generatePlan({
      planDate: today,
      preferences: {
        workingHours: { start: '09:00', end: '18:00' },
        includeBreaks: true,
        prioritizeHighPriority: true,
        maxTasksPerBlock: 3
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'task': return <Play className="h-3 w-3" />;
      case 'break': return <Coffee className="h-3 w-3" />;
      case 'buffer': return <Clock className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  const systemReady = activeConfiguration && mainTasks.length > 0;
  const pendingTasks = mainTasks.filter(t => ['pending', 'in_progress'].includes(t.status));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Phase 4 Demo - Smart Daily Planning
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estado del sistema */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Demostración de Planificación Diaria Inteligente</div>
              <p className="text-sm">
                Esta demo muestra cómo la IA genera planes diarios optimizados 
                basados en tus tareas, prioridades y patrones de productividad.
              </p>
            </AlertDescription>
          </Alert>

          {!systemReady && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Requisitos para la demo:</div>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {!activeConfiguration && (
                    <li>Configurar LLM (ir a Configuración → LLM)</li>
                  )}
                  {mainTasks.length === 0 && (
                    <li>Crear al menos 1 tarea principal</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Métricas del sistema */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{mainTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tareas Totales</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tareas Pendientes</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {activeConfiguration ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">LLM Configurado</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {todaysPlan?.planned_tasks?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Bloques Planificados</div>
            </div>
          </div>

          {/* Distribución de prioridades */}
          {pendingTasks.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Distribución de Prioridades (Tareas Pendientes)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['urgent', 'high', 'medium', 'low'].map(priority => {
                  const count = pendingTasks.filter(t => t.priority === priority).length;
                  return (
                    <div key={priority} className="text-center p-3 bg-gray-50 rounded border">
                      <div className="text-lg font-bold">{count}</div>
                      <Badge className={`text-xs ${getPriorityColor(priority)}`}>
                        {priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Controles de demo */}
          <div className="flex gap-3 items-center">
            <Button 
              onClick={handleGenerateDemo}
              disabled={isGeneratingPlan || !systemReady}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              {isGeneratingPlan ? 'Generando Plan...' : 'Generar Plan Demo'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              disabled={!todaysPlan}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showDetails ? 'Ocultar' : 'Mostrar'} Detalles
            </Button>
            
            <Button 
              variant="ghost"
              onClick={refreshPlans}
              size="sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Refrescar
            </Button>
          </div>

          <Separator />

          {/* Plan generado */}
          {todaysPlan ? (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Plan Diario Generado - {new Date().toLocaleDateString()}
              </h4>

              {/* Métricas del plan */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-purple-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {todaysPlan.planned_tasks?.filter(t => t.type === 'task').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tareas</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round((todaysPlan.estimated_duration || 0) / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Duración</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((todaysPlan.ai_confidence || 0) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Confianza IA</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {todaysPlan.planned_tasks?.filter(t => t.type === 'break').length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Descansos</div>
                </div>
              </div>

              {/* Agenda del día */}
              <div className="space-y-3">
                <h5 className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Agenda Optimizada
                </h5>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todaysPlan.planned_tasks?.map((block, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {getBlockIcon(block.type)}
                        <span className="font-medium text-sm truncate">
                          {block.title}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {block.startTime} - {block.endTime}
                        </Badge>
                        
                        {block.type === 'task' && (
                          <Badge className={`text-xs ${getPriorityColor(block.priority)}`}>
                            {block.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estrategia de optimización */}
              {todaysPlan.optimization_strategy && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">Estrategia de Optimización:</span>
                    <span>{todaysPlan.optimization_strategy}</span>
                  </div>
                </div>
              )}

              {/* Detalles técnicos */}
              {showDetails && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h5 className="font-medium text-gray-900 mb-3">Detalles Técnicos:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID del Plan:</span>
                      <div className="font-mono text-xs">{todaysPlan.id}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fecha:</span>
                      <div>{todaysPlan.plan_date}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Creado:</span>
                      <div>{new Date(todaysPlan.created_at).toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Actualizado:</span>
                      <div>{new Date(todaysPlan.updated_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay plan generado
              </h3>
              <p className="text-gray-600 mb-4">
                Haz clic en "Generar Plan Demo" para crear un plan diario optimizado
              </p>
            </div>
          )}

          {/* Información adicional */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-sm mb-2">Características de Phase 4:</h5>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Generación automática de planes diarios optimizados</p>
              <p>• Algoritmo de priorización inteligente basado en IA</p>
              <p>• Distribución temporal considerando productividad</p>
              <p>• Inclusión automática de descansos y buffers</p>
              <p>• Persistencia en base de datos con métricas</p>
              <p>• Integración completa con sistema de tareas</p>
              <p>• Cálculo de confianza y recomendaciones contextuales</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Phase4Demo;
