
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Database, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Panel de Testing AI
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{mainTasks.length}</div>
            <div className="text-sm text-muted-foreground">Tareas totales</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Análisis realizados</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stats.health_checks}</div>
            <div className="text-sm text-muted-foreground">Chequeos de salud</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.bottlenecks}</div>
            <div className="text-sm text-muted-foreground">Análisis cuellos de botella</div>
          </div>
        </div>

        {/* Acciones de testing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Análisis Completo</h4>
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
                  Ejecutar Análisis Completo
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRunSpecificAnalysis('health_check')}
              disabled={isAnalyzing || mainTasks.length === 0}
            >
              Chequeo de Salud
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRunSpecificAnalysis('bottleneck_detection')}
              disabled={isAnalyzing || mainTasks.length === 0}
            >
              Detectar Cuellos de Botella
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRunSpecificAnalysis('priority_analysis')}
              disabled={isAnalyzing || mainTasks.length === 0}
            >
              Análisis de Prioridad
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRunSpecificAnalysis('completion_prediction')}
              disabled={isAnalyzing || mainTasks.length === 0}
            >
              Predicción de Finalización
            </Button>
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          {mainTasks.length > 0 ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Sistema listo para análisis</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Crea algunas tareas para comenzar el testing</span>
            </>
          )}
        </div>

        {/* Instrucciones */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Para testing completo:</strong></p>
          <p>1. Crea varias tareas con diferentes prioridades y estados</p>
          <p>2. Ejecuta el análisis completo</p>
          <p>3. Revisa los paneles de insights y monitoreo</p>
          <p>4. Verifica los indicadores de salud en las tarjetas de tareas</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITestingPanel;
