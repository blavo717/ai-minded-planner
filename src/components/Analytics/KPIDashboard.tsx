
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, Clock, CheckCircle, Zap, DollarSign, Calendar } from 'lucide-react';
import { useAdvancedMetrics } from '@/hooks/analytics/useAdvancedMetrics';
import { useAnalytics } from '@/hooks/useAnalytics';

interface KPIDashboardProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const KPIDashboard = ({ period }: KPIDashboardProps) => {
  const { data: advancedMetrics, isLoading: advancedLoading } = useAdvancedMetrics(period);
  const { getProductivityMetrics } = useAnalytics();
  const { data: basicMetrics, isLoading: basicLoading } = getProductivityMetrics(period);

  if (advancedLoading || basicLoading || !advancedMetrics || !basicMetrics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : value < 0 ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <div className="h-4 w-4" />
    );
  };

  const getTrendColor = (value: number) => {
    return value > 0 ? 'text-green-500' : value < 0 ? 'text-red-500' : 'text-gray-500';
  };

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { status: 'excellent', color: 'bg-green-500' };
    if (value >= thresholds.warning) return { status: 'good', color: 'bg-yellow-500' };
    return { status: 'needs-attention', color: 'bg-red-500' };
  };

  const kpis = [
    {
      title: 'Velocidad de Trabajo',
      value: `${advancedMetrics.velocity.tasksPerWeek}/sem`,
      icon: Zap,
      description: `${Math.round(advancedMetrics.velocity.averageTaskTime)}min por tarea`,
      trend: advancedMetrics.velocity.weeklyTrend,
      health: getHealthStatus(advancedMetrics.velocity.tasksPerWeek, { good: 10, warning: 5 }),
      color: 'text-blue-500'
    },
    {
      title: 'Calidad de Ejecución',
      value: `${advancedMetrics.quality.onTimeCompletion.toFixed(1)}%`,
      icon: Target,
      description: `${advancedMetrics.quality.reworkRate.toFixed(1)}% retrabajo`,
      trend: 0,
      health: getHealthStatus(advancedMetrics.quality.onTimeCompletion, { good: 80, warning: 60 }),
      color: 'text-green-500'
    },
    {
      title: 'Consistencia de Trabajo',
      value: `${advancedMetrics.engagement.activeDays} días`,
      icon: Calendar,
      description: `Racha: ${advancedMetrics.engagement.longestStreak} días`,
      trend: 0,
      health: getHealthStatus(advancedMetrics.engagement.workConsistency, { good: 70, warning: 40 }),
      color: 'text-purple-500'
    },
    {
      title: 'Eficiencia General',
      value: `${Math.min(basicMetrics.efficiency, 200).toFixed(1)}%`,
      icon: CheckCircle,
      description: `${basicMetrics.completionRate.toFixed(1)}% completado`,
      trend: basicMetrics.previousPeriodComparison,
      health: getHealthStatus(basicMetrics.efficiency, { good: 90, warning: 70 }),
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">
                {kpi.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${kpi.health.color}`} />
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-card-foreground">
                    {kpi.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>
                {kpi.trend !== 0 && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(kpi.trend)}
                    <span className={`text-xs font-medium ${getTrendColor(kpi.trend)}`}>
                      {kpi.trend > 0 ? '+' : ''}{kpi.trend.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estado General del Sistema</CardTitle>
          <p className="text-sm text-muted-foreground">
            Indicadores clave de salud de tu productividad
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productividad General</span>
                <Badge variant={basicMetrics.productivity > 3.5 ? 'default' : 'secondary'}>
                  {basicMetrics.productivity.toFixed(1)}/5
                </Badge>
              </div>
              <Progress value={(basicMetrics.productivity / 5) * 100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Eficiencia de Tiempo</span>
                <Badge variant={basicMetrics.efficiency > 80 ? 'default' : 'secondary'}>
                  {Math.min(basicMetrics.efficiency, 200).toFixed(1)}%
                </Badge>
              </div>
              <Progress value={Math.min(basicMetrics.efficiency, 100)} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tasa de Completado</span>
                <Badge variant={basicMetrics.completionRate > 70 ? 'default' : 'secondary'}>
                  {basicMetrics.completionRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={basicMetrics.completionRate} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Consistencia de Trabajo</span>
                <Badge variant={advancedMetrics.engagement.workConsistency > 60 ? 'default' : 'secondary'}>
                  {advancedMetrics.engagement.workConsistency.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={advancedMetrics.engagement.workConsistency} className="h-2" />
            </div>
          </div>

          {/* Insights Rápidos */}
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Insights Clave</h4>
            <div className="grid gap-2 md:grid-cols-2">
              {basicMetrics.efficiency > 100 && (
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span>Excelente gestión del tiempo</span>
                </div>
              )}
              {advancedMetrics.engagement.longestStreak > 7 && (
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Calendar className="h-4 w-4" />
                  <span>Gran consistencia de trabajo</span>
                </div>
              )}
              {advancedMetrics.velocity.tasksPerWeek > 10 && (
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                  <Zap className="h-4 w-4" />
                  <span>Alta velocidad de ejecución</span>
                </div>
              )}
              {advancedMetrics.quality.onTimeCompletion > 80 && (
                <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                  <Target className="h-4 w-4" />
                  <span>Excelente cumplimiento de plazos</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPIDashboard;
