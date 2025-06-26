
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, CheckCircle, Zap, AlertCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProductivityOverviewProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const ProductivityOverview = ({ period }: ProductivityOverviewProps) => {
  const { getProductivityMetrics } = useAnalytics();
  const { data: metrics, isLoading, error } = getProductivityMetrics(period);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-center">
            <div>
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Error al cargar métricas de productividad</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validar que las métricas no sean NaN
  const safeMetrics = {
    ...metrics,
    completionRate: isNaN(metrics.completionRate) ? 0 : metrics.completionRate,
    totalWorkTime: isNaN(metrics.totalWorkTime) ? 0 : metrics.totalWorkTime,
    averageTaskTime: isNaN(metrics.averageTaskTime) ? 0 : metrics.averageTaskTime,
    efficiency: isNaN(metrics.efficiency) ? 100 : metrics.efficiency,
    productivity: isNaN(metrics.productivity) ? 0 : metrics.productivity,
    previousPeriodComparison: isNaN(metrics.previousPeriodComparison) ? 0 : metrics.previousPeriodComparison,
  };

  const getTrendIcon = () => {
    switch (safeMetrics.trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (safeMetrics.trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const statsData = [
    {
      title: "Tareas Completadas",
      value: safeMetrics.completedTasks.toString(),
      icon: CheckCircle,
      description: `${safeMetrics.completionRate.toFixed(1)}% completado`,
      color: "text-blue-500"
    },
    {
      title: "Tiempo Trabajado",
      value: `${Math.round(safeMetrics.totalWorkTime / 60)}h`,
      icon: Clock,
      description: `${Math.round(safeMetrics.averageTaskTime)}min promedio`,
      color: "text-green-500"
    },
    {
      title: "Eficiencia",
      value: `${Math.min(safeMetrics.efficiency, 200).toFixed(1)}%`,
      icon: Target,
      description: "Tiempo estimado vs real",
      color: "text-purple-500"
    },
    {
      title: "Productividad",
      value: `${safeMetrics.productivity.toFixed(1)}/5`,
      icon: Zap,
      description: "Puntuación promedio",
      color: "text-orange-500"
    }
  ];

  // Mostrar mensaje informativo si no hay datos
  if (safeMetrics.totalTasks === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground">
              Comienza creando tareas y registrando sesiones de trabajo para ver tus métricas de productividad.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progreso y tendencia */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progreso General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Tasa de Completado</span>
                <span className="text-sm text-muted-foreground">
                  {safeMetrics.completedTasks} de {safeMetrics.totalTasks}
                </span>
              </div>
              <Progress value={Math.min(safeMetrics.completionRate, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Eficiencia</span>
                <span className="text-sm text-muted-foreground">
                  {Math.min(safeMetrics.efficiency, 200).toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(safeMetrics.efficiency, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Productividad</span>
                <span className="text-sm text-muted-foreground">
                  {safeMetrics.productivity.toFixed(1)}/5
                </span>
              </div>
              <Progress value={Math.min((safeMetrics.productivity / 5) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                Tendencia {safeMetrics.trend === 'up' ? 'Positiva' : 
                          safeMetrics.trend === 'down' ? 'Negativa' : 'Estable'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Comparación período anterior</span>
                <Badge variant={safeMetrics.previousPeriodComparison > 0 ? "default" : 
                               safeMetrics.previousPeriodComparison < 0 ? "destructive" : "secondary"}>
                  {safeMetrics.previousPeriodComparison > 0 ? '+' : ''}
                  {safeMetrics.previousPeriodComparison.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {safeMetrics.previousPeriodComparison > 0 
                  ? '¡Excelente! Tu productividad ha mejorado'
                  : safeMetrics.previousPeriodComparison < 0
                  ? 'Hay margen de mejora. Revisa tus patrones de trabajo'
                  : 'Mantienes un rendimiento estable'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductivityOverview;
