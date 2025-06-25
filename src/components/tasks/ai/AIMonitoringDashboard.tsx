
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

const AIMonitoringDashboard = () => {
  const { 
    getCriticalTasks, 
    getGeneralInsights, 
    runAnalysis, 
    isAnalyzing 
  } = useAITaskMonitor();

  const criticalTasks = getCriticalTasks();
  const insights = getGeneralInsights();

  const handleRunAnalysis = () => {
    runAnalysis({});
  };

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoreo IA
          </CardTitle>
          <CardDescription>
            Análisis inteligente del estado de tus tareas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de monitoreo disponibles</p>
            <Button 
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="mt-4"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Ejecutar Análisis
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitoreo IA
            </CardTitle>
            <CardDescription>
              Estado general de {insights.total_tasks} tareas monitoreadas
            </CardDescription>
          </div>
          <Button 
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            variant="outline"
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {insights.healthy_tasks}
              </div>
              <div className="text-sm text-muted-foreground">Saludables</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {insights.critical_tasks}
              </div>
              <div className="text-sm text-muted-foreground">Críticas</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {insights.bottlenecked_tasks}
              </div>
              <div className="text-sm text-muted-foreground">Con cuellos de botella</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {insights.average_priority_score}
              </div>
              <div className="text-sm text-muted-foreground">Prioridad promedio</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Salud general</span>
              <span className="text-sm text-muted-foreground">
                {insights.health_percentage}%
              </span>
            </div>
            <Progress value={insights.health_percentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Tareas críticas */}
      {criticalTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Tareas que Requieren Atención
            </CardTitle>
            <CardDescription>
              {criticalTasks.length} tareas con problemas detectados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalTasks.slice(0, 5).map((task) => (
                <div 
                  key={task.task_id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline" 
                        className="bg-red-100 text-red-700 text-xs"
                      >
                        Salud: {task.health_score}%
                      </Badge>
                      {task.bottleneck_detected && (
                        <Badge 
                          variant="outline" 
                          className="bg-orange-100 text-orange-700 text-xs"
                        >
                          Cuello de botella
                        </Badge>
                      )}
                    </div>
                    
                    {task.issues.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Problemas: {task.issues.slice(0, 2).join(', ')}
                        {task.issues.length > 2 && '...'}
                      </div>
                    )}
                    
                    {task.recommendations.length > 0 && (
                      <div className="text-sm text-blue-600 mt-1">
                        💡 {task.recommendations[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {criticalTasks.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  Y {criticalTasks.length - 5} tareas más requieren atención...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIMonitoringDashboard;
