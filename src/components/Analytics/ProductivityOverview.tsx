
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, CheckCircle, Zap, AlertCircle, PlayCircle, Timer } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';

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
    efficiency: isNaN(metrics.efficiency) ? 0 : metrics.efficiency,
    productivity: isNaN(metrics.productivity) ? 0 : metrics.productivity,
    previousPeriodComparison: isNaN(metrics.previousPeriodComparison) ? 0 : metrics.previousPeriodComparison,
  };

  // Estado sin datos: si no hay tareas Y no hay tiempo trabajado
  const hasNoData = safeMetrics.totalTasks === 0 && safeMetrics.totalWorkTime === 0;
  
  // Estado con tareas pero sin sesiones
  const hasTasksButNoSessions = safeMetrics.totalTasks > 0 && !safeMetrics.hasSessionData;

  if (hasNoData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Empecemos a medir tu productividad!</h3>
            <p className="text-muted-foreground mb-6">
              Para ver tus métricas de productividad, necesitas crear tareas y registrar sesiones de trabajo.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>1. Crea algunas tareas en la sección "Tareas"</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <PlayCircle className="h-4 w-4" />
                <span>2. Registra sesiones de trabajo para cada tarea</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                <span>3. Vuelve aquí para ver tu análisis de productividad</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasTasksButNoSessions) {
    return (
      <div className="space-y-6">
        {/* Métricas básicas disponibles */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total de Tareas</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{safeMetrics.totalTasks}</div>
              <p className="text-xs text-muted-foreground">En tu sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Tareas Completadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{safeMetrics.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {safeMetrics.completionRate.toFixed(1)}% de completado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Sesiones de Trabajo</CardTitle>
              <Timer className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">0</div>
              <p className="text-xs text-muted-foreground">Registra tiempo para más métricas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Tendencia</CardTitle>
              {safeMetrics.previousPeriodComparison > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : safeMetrics.previousPeriodComparison < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingUp className="h-4 w-4 text-gray-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">
                {safeMetrics.previousPeriodComparison > 0 ? '+' : ''}
                {safeMetrics.previousPeriodComparison.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground">Vs período anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Información sobre las sesiones de trabajo */}
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                ¡Excelente! Tienes {safeMetrics.completedTasks} tareas completadas
              </h3>
              <p className="text-muted-foreground mb-6">
                Para ver métricas avanzadas como tiempo trabajado, eficiencia y productividad, 
                necesitas registrar sesiones de trabajo.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                  <PlayCircle className="h-8 w-8 text-blue-500" />
                  <span className="font-medium">Inicia un cronómetro</span>
                  <span className="text-center">Cuando trabajes en una tarea activa</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                  <Clock className="h-8 w-8 text-green-500" />
                  <span className="font-medium">Registra tiempo</span>
                  <span className="text-center">Incluso retroactivo para tareas completadas</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 border rounded-lg">
                  <Target className="h-8 w-8 text-purple-500" />
                  <span className="font-medium">Ve métricas avanzadas</span>
                  <span className="text-center">Eficiencia, productividad y patrones</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progreso actual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tu Progreso Actual</CardTitle>
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
            
            <div className="text-xs text-muted-foreground">
              {safeMetrics.completionRate > 75 
                ? '¡Excelente ritmo de completado! Considera registrar sesiones para análisis más profundos.'
                : safeMetrics.completionRate > 50
                ? 'Buen progreso. Registra sesiones de trabajo para optimizar tu productividad.'
                : 'Enfócate en completar tareas y registrar el tiempo que dedicas a cada una.'
              }
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado completo con sesiones
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
      value: safeMetrics.efficiency > 0 ? `${Math.min(safeMetrics.efficiency, 200).toFixed(1)}%` : "Sin datos",
      icon: Target,
      description: safeMetrics.efficiency > 0 ? "Tiempo estimado vs real" : "Necesita estimaciones",
      color: "text-purple-500"
    },
    {
      title: "Productividad",
      value: safeMetrics.productivity > 0 ? `${safeMetrics.productivity.toFixed(1)}/5` : "Sin datos",
      icon: Zap,
      description: safeMetrics.productivity > 0 ? "Puntuación promedio" : "Necesita calificaciones",
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
                  {safeMetrics.completedTasks} de {safeMetrics.totalTasks}
                </span>
              </div>
              <Progress value={Math.min(safeMetrics.completionRate, 100)} className="h-2" />
            </div>
            
            {safeMetrics.efficiency > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Eficiencia</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.min(safeMetrics.efficiency, 200).toFixed(1)}%
                  </span>
                </div>
                <Progress value={Math.min(safeMetrics.efficiency, 100)} className="h-2" />
              </div>
            )}
            
            {safeMetrics.productivity > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Productividad</span>
                  <span className="text-sm text-muted-foreground">
                    {safeMetrics.productivity.toFixed(1)}/5
                  </span>
                </div>
                <Progress value={Math.min((safeMetrics.productivity / 5) * 100, 100)} className="h-2" />
              </div>
            )}
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
