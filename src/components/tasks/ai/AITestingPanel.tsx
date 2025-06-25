
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Brain,
  Activity
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';
import { useTasks } from '@/hooks/useTasks';
import { toast } from '@/hooks/use-toast';

const AITestingPanel = () => {
  const { runAnalysis, isAnalyzing, monitoringData } = useAITaskMonitor();
  const { mainTasks } = useTasks();

  const handleRunFullAnalysis = () => {
    if (mainTasks.length === 0) {
      toast({
        title: "No hay tareas",
        description: "Crea algunas tareas primero para poder analizarlas.",
        variant: "destructive"
      });
      return;
    }

    runAnalysis({});
    toast({
      title: "Análisis iniciado",
      description: `Analizando ${mainTasks.length} tareas...`
    });
  };

  const handleRunSpecificAnalysis = (analysisType: string) => {
    if (mainTasks.length === 0) {
      toast({
        title: "No hay tareas",
        description: "Crea algunas tareas primero para poder analizarlas.",
        variant: "destructive"
      });
      return;
    }

    runAnalysis({ analysisType: analysisType as any });
    toast({
      title: `Análisis ${analysisType} iniciado`,
      description: `Procesando ${mainTasks.length} tareas...`
    });
  };

  const getAnalysisStats = () => {
    const stats = {
      total: monitoringData.length,
      health_checks: monitoringData.filter(m => m.monitoring_type === 'health_check').length,
      bottlenecks: monitoringData.filter(m => m.monitoring_type === 'bottleneck_detection').length,
      priorities: monitoringData.filter(m => m.monitoring_type === 'priority_analysis').length,
      predictions: monitoringData.filter(m => m.monitoring_type === 'completion_prediction').length,
    };
    return stats;
  };

  const stats = getAnalysisStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Panel de Testing AI
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Estado actual */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{mainTasks.length}</div>
              <div className="text-sm text-muted-foreground">Tareas totales</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Análisis realizados</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{stats.health_checks}</div>
              <div className="text-sm text-muted-foreground">Chequeos de salud</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">{stats.bottlenecks}</div>
              <div className="text-sm text-muted-foreground">Análisis cuellos</div>
            </div>
          </div>

          {/* Acciones de testing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Brain className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Análisis Completo</h4>
                  <p className="text-sm text-muted-foreground">
                    Ejecuta todos los tipos de análisis disponibles
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleRunFullAnalysis}
                disabled={isAnalyzing || mainTasks.length === 0}
                className="flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Ejecutar Análisis
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('health_check')}
                disabled={isAnalyzing || mainTasks.length === 0}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <Activity className="h-4 w-4 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Chequeo de Salud</div>
                  <div className="text-xs text-muted-foreground">
                    Analiza el estado de las tareas
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('bottleneck_detection')}
                disabled={isAnalyzing || mainTasks.length === 0}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <div className="text-left">
                  <div className="font-medium">Detectar Cuellos</div>
                  <div className="text-xs text-muted-foreground">
                    Identifica bloqueos en el flujo
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('priority_analysis')}
                disabled={isAnalyzing || mainTasks.length === 0}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <BarChart3 className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Análisis de Prioridad</div>
                  <div className="text-xs text-muted-foreground">
                    Calcula prioridades inteligentes
                  </div>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleRunSpecificAnalysis('completion_prediction')}
                disabled={isAnalyzing || mainTasks.length === 0}
                className="flex items-center gap-2 justify-start p-4 h-auto"
              >
                <CheckCircle className="h-4 w-4 text-purple-500" />
                <div className="text-left">
                  <div className="font-medium">Predicción</div>
                  <div className="text-xs text-muted-foreground">
                    Estima fechas de finalización
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Estado del sistema */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
            {mainTasks.length > 0 ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <div className="font-medium text-sm">Sistema listo para análisis</div>
                  <div className="text-xs text-muted-foreground">
                    {mainTasks.length} tareas disponibles para procesamiento
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <div className="font-medium text-sm">Crea tareas para comenzar</div>
                  <div className="text-xs text-muted-foreground">
                    Se necesitan tareas para poder ejecutar el análisis AI
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Instrucciones para testing */}
          <div className="border-t pt-4">
            <h5 className="font-medium text-sm mb-2">Guía de Testing Completo:</h5>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Crea varias tareas con diferentes prioridades y estados</p>
              <p>2. Añade subtareas y microtareas para probar la jerarquía</p>
              <p>3. Ejecuta el análisis completo para poblar datos AI</p>
              <p>4. Revisa los paneles de insights y monitoreo</p>
              <p>5. Verifica los indicadores de salud en las tarjetas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITestingPanel;
