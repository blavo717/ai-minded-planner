
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  Target,
  AlertTriangle
} from 'lucide-react';
import { useAITaskMonitor } from '@/hooks/useAITaskMonitor';

const AIInsightsPanel = () => {
  const { getCriticalTasks, getGeneralInsights } = useAITaskMonitor();
  
  const criticalTasks = getCriticalTasks();
  const insights = getGeneralInsights();

  const generateInsights = () => {
    const insightsList = [];

    if (!insights) return insightsList;

    // Insight sobre salud general
    if (insights.health_percentage < 50) {
      insightsList.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Salud de tareas baja',
        description: `Solo ${insights.health_percentage}% de tus tareas están en buen estado. Considera revisar las tareas críticas.`,
        priority: 'high'
      });
    } else if (insights.health_percentage > 80) {
      insightsList.push({
        type: 'success',
        icon: Target,
        title: 'Excelente gestión',
        description: `${insights.health_percentage}% de tus tareas están saludables. ¡Sigue así!`,
        priority: 'low'
      });
    }

    // Insight sobre cuellos de botella
    if (insights.bottlenecked_tasks > 0) {
      insightsList.push({
        type: 'warning',
        icon: Clock,
        title: 'Cuellos de botella detectados',
        description: `${insights.bottlenecked_tasks} tareas tienen cuellos de botella. Considera redistribuir la carga de trabajo.`,
        priority: 'high'
      });
    }

    // Insight sobre prioridades
    if (insights.average_priority_score > 70) {
      insightsList.push({
        type: 'info',
        icon: TrendingUp,
        title: 'Alta carga de prioridades',
        description: `Prioridad promedio de ${insights.average_priority_score}. Considera revisar qué es realmente urgente.`,
        priority: 'medium'
      });
    }

    // Insight sobre tareas críticas
    if (criticalTasks.length > 0) {
      const taskWithMostIssues = criticalTasks.reduce((prev, current) => 
        prev.issues.length > current.issues.length ? prev : current
      );
      
      insightsList.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Tarea requiere atención inmediata',
        description: `Una tarea tiene ${taskWithMostIssues.issues.length} problemas detectados. Prioriza su resolución.`,
        priority: 'high'
      });
    }

    // Ordenar por prioridad
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return insightsList.sort((a, b) => 
      priorityOrder[b.priority as keyof typeof priorityOrder] - 
      priorityOrder[a.priority as keyof typeof priorityOrder]
    );
  };

  const insights_list = generateInsights();

  if (insights_list.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Insights IA
          </CardTitle>
          <CardDescription>
            Recomendaciones inteligentes para optimizar tu productividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Todo se ve bien por ahora</p>
            <p className="text-sm mt-2">Los insights aparecerán cuando haya patrones que analizar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Insights IA
        </CardTitle>
        <CardDescription>
          Recomendaciones basadas en el análisis de tus tareas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights_list.map((insight, index) => {
            const IconComponent = insight.icon;
            
            return (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className={`
                  p-2 rounded-full
                  ${insight.type === 'warning' ? 'bg-red-100 text-red-600' : ''}
                  ${insight.type === 'success' ? 'bg-green-100 text-green-600' : ''}
                  ${insight.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                `}>
                  <IconComponent className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        insight.priority === 'high' ? 'bg-red-50 text-red-700' :
                        insight.priority === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                        'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {insight.priority === 'high' ? 'Alta' : 
                       insight.priority === 'medium' ? 'Media' : 'Baja'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsPanel;
