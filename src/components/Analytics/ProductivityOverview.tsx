
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, CheckCircle, Zap } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProductivityOverviewProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const ProductivityOverview = ({ period }: ProductivityOverviewProps) => {
  const { getProductivityMetrics } = useAnalytics();
  const { data: metrics, isLoading } = getProductivityMetrics(period);

  if (isLoading || !metrics) {
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

  const getTrendIcon = () => {
    switch (metrics.trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    switch (metrics.trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const statsData = [
    {
      title: "Tareas Completadas",
      value: metrics.completedTasks.toString(),
      icon: CheckCircle,
      description: `${metrics.completionRate.toFixed(1)}% completado`,
      color: "text-blue-500"
    },
    {
      title: "Tiempo Trabajado",
      value: `${Math.round(metrics.totalWorkTime / 60)}h`,
      icon: Clock,
      description: `${Math.round(metrics.averageTaskTime)}min promedio`,
      color: "text-green-500"
    },
    {
      title: "Eficiencia",
      value: `${metrics.efficiency.toFixed(1)}%`,
      icon: Target,
      description: "Tiempo estimado vs real",
      color: "text-purple-500"
    },
    {
      title: "Productividad",
      value: `${metrics.productivity.toFixed(1)}/5`,
      icon: Zap,
      description: "Puntuación promedio",
      color: "text-orange-500"
    }
  ];

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
                  {metrics.completedTasks} de {metrics.totalTasks}
                </span>
              </div>
              <Progress value={metrics.completionRate} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Eficiencia</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.efficiency.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(metrics.efficiency, 100)} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Productividad</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.productivity.toFixed(1)}/5
                </span>
              </div>
              <Progress value={(metrics.productivity / 5) * 100} className="h-2" />
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
                Tendencia {metrics.trend === 'up' ? 'Positiva' : 
                          metrics.trend === 'down' ? 'Negativa' : 'Estable'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Comparación período anterior</span>
                <Badge variant={metrics.previousPeriodComparison > 0 ? "default" : 
                               metrics.previousPeriodComparison < 0 ? "destructive" : "secondary"}>
                  {metrics.previousPeriodComparison > 0 ? '+' : ''}
                  {metrics.previousPeriodComparison.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {metrics.previousPeriodComparison > 0 
                  ? '¡Excelente! Tu productividad ha mejorado'
                  : metrics.previousPeriodComparison < 0
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
