
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  DollarSign, 
  Activity,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useAdvancedMetrics } from '@/hooks/analytics/useAdvancedMetrics';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

interface SmartMetricsGridProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const SmartMetricsGrid = ({ period }: SmartMetricsGridProps) => {
  const { data: advancedMetrics, isLoading } = useAdvancedMetrics(period);
  const { data: generalStats } = useGeneralStats();

  if (isLoading) {
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

  if (!advancedMetrics || !generalStats?.hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Métricas Inteligentes No Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Se necesitan más datos para generar métricas avanzadas. 
            Continúa trabajando en tus proyectos para desbloquear insights más profundos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getVelocityStatus = (tasksPerWeek: number) => {
    if (tasksPerWeek >= 5) return { color: 'bg-green-500', label: 'Excelente' };
    if (tasksPerWeek >= 3) return { color: 'bg-blue-500', label: 'Bueno' };
    if (tasksPerWeek >= 1) return { color: 'bg-yellow-500', label: 'Regular' };
    return { color: 'bg-red-500', label: 'Bajo' };
  };

  const getEngagementStatus = (consistency: number) => {
    if (consistency >= 80) return { color: 'bg-green-500', label: 'Consistente' };
    if (consistency >= 60) return { color: 'bg-blue-500', label: 'Bueno' };
    if (consistency >= 40) return { color: 'bg-yellow-500', label: 'Irregular' };
    return { color: 'bg-red-500', label: 'Esporádico' };
  };

  const velocityStatus = getVelocityStatus(advancedMetrics.velocity.tasksPerWeek);
  const engagementStatus = getEngagementStatus(advancedMetrics.engagement.workConsistency);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Métricas Inteligentes</h3>
        <Badge variant="outline">Nivel Avanzado</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Velocidad de Trabajo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Velocidad</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advancedMetrics.velocity.tasksPerWeek}</div>
            <p className="text-xs text-muted-foreground">tareas por semana</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${velocityStatus.color}`} />
                <span className="text-xs">{velocityStatus.label}</span>
              </div>
              {advancedMetrics.velocity.weeklyTrend !== 0 && (
                <div className="flex items-center gap-1 text-xs">
                  {advancedMetrics.velocity.weeklyTrend > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>{Math.abs(advancedMetrics.velocity.weeklyTrend).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Calidad del Trabajo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calidad</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advancedMetrics.quality.onTimeCompletion}%</div>
            <p className="text-xs text-muted-foreground">completado a tiempo</p>
            <div className="mt-2 space-y-1">
              <Progress value={advancedMetrics.quality.onTimeCompletion} className="h-1" />
              {advancedMetrics.quality.reworkRate > 0 && (
                <div className="text-xs text-orange-600">
                  {advancedMetrics.quality.reworkRate}% requiere retrabajo
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Compromiso Laboral */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compromiso</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advancedMetrics.engagement.activeDays}</div>
            <p className="text-xs text-muted-foreground">días activos</p>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${engagementStatus.color}`} />
                <span className="text-xs">{engagementStatus.label}</span>
              </div>
              {advancedMetrics.engagement.longestStreak > 0 && (
                <div className="text-xs text-blue-600">
                  Racha máxima: {advancedMetrics.engagement.longestStreak} días
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Eficiencia Financiera */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {advancedMetrics.financial.budgetEfficiency > 0 
                ? `${advancedMetrics.financial.budgetEfficiency}%` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">eficiencia presupuestaria</p>
            <div className="mt-2">
              {advancedMetrics.financial.costPerTask > 0 ? (
                <div className="text-xs text-muted-foreground">
                  ${advancedMetrics.financial.costPerTask.toFixed(2)} por tarea
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Sin datos de presupuesto
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SmartMetricsGrid;
