
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

const AIInsightsPanel = () => {
  const { getCriticalTasks, getGeneralInsights } = useAITaskMonitor();

  const criticalTasks = getCriticalTasks();
  const insights = getGeneralInsights();

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay datos de análisis disponibles</p>
            <p className="text-sm mt-2">Los insights aparecerán cuando haya tareas analizadas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* General Health */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{insights.total_tasks}</div>
            <div className="text-sm text-muted-foreground">Total tareas</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{insights.healthy_tasks}</div>
            <div className="text-sm text-muted-foreground">Saludables</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{insights.critical_tasks}</div>
            <div className="text-sm text-muted-foreground">Críticas</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{insights.bottlenecked_tasks}</div>
            <div className="text-sm text-muted-foreground">Con cuellos</div>
          </div>
        </div>

        {/* Critical Tasks Alert */}
        {criticalTasks.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">
                {criticalTasks.length} tarea{criticalTasks.length > 1 ? 's' : ''} necesita{criticalTasks.length === 1 ? '' : 'n'} atención
              </span>
            </div>
            <div className="space-y-2">
              {criticalTasks.slice(0, 3).map((task, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-700">
                      Salud: {task.health_score}%
                    </Badge>
                    {task.bottleneck_detected && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-700">
                        Cuello de botella
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {criticalTasks.length > 3 && (
                <p className="text-sm text-red-600">
                  ... y {criticalTasks.length - 3} más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Health Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">Estado General del Proyecto</span>
          </div>
          <p className="text-blue-700 text-sm">
            {insights.health_percentage}% de tus tareas están en buen estado. 
            Puntuación promedio de prioridad: {insights.average_priority_score}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
