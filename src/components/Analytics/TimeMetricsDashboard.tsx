
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Target, Zap, TrendingUp } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface TimeMetricsDashboardProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const TimeMetricsDashboard = ({ period }: TimeMetricsDashboardProps) => {
  const { getProductivityMetrics, getTimeDistribution } = useAnalytics();
  const { data: metrics, isLoading: metricsLoading } = getProductivityMetrics(period);
  const { data: timeData, isLoading: timeLoading } = getTimeDistribution(period);

  if (metricsLoading || timeLoading || !metrics || !timeData) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calcular métricas adicionales
  const totalDays = timeData.length;
  const activeDays = timeData.filter(d => d.work_time > 0).length;
  const averageDailyTime = totalDays > 0 ? metrics.totalWorkTime / totalDays : 0;
  const longestSession = Math.max(...timeData.map(d => d.work_time), 0);
  const mostProductiveDay = timeData.reduce((max, current) => 
    current.productivity_score > max.productivity_score ? current : max, 
    timeData[0] || { productivity_score: 0, date: '' }
  );

  const consistencyScore = activeDays > 0 ? (activeDays / totalDays) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Tiempo Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total Trabajado</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {Math.round(metrics.totalWorkTime / 60)}h {Math.round(metrics.totalWorkTime % 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Promedio diario: {Math.round(averageDailyTime / 60)}h {Math.round(averageDailyTime % 60)}m
            </p>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Meta sugerida: 8h/día</span>
                <span className="text-xs">{((averageDailyTime / 480) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min((averageDailyTime / 480) * 100, 100)} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Consistencia */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consistencia</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {consistencyScore.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {activeDays} de {totalDays} días activos
            </p>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">Días trabajados</span>
                <span className="text-xs">{activeDays}/{totalDays}</span>
              </div>
              <Progress value={consistencyScore} className="h-1" />
            </div>
          </CardContent>
        </Card>

        {/* Sesión más larga */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesión más Larga</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {Math.round(longestSession / 60)}h {Math.round(longestSession % 60)}m
            </div>
            <p className="text-xs text-muted-foreground">
              Máximo en una sesión
            </p>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs">vs promedio</span>
                <span className="text-xs">
                  {longestSession > averageDailyTime ? '+' : ''}
                  {Math.round(((longestSession - averageDailyTime) / averageDailyTime) * 100)}%
                </span>
              </div>
              <Progress 
                value={Math.min((longestSession / (averageDailyTime * 2)) * 100, 100)} 
                className="h-1" 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas detalladas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Análisis de Eficiencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tiempo por Tarea</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(metrics.averageTaskTime)}min
                </span>
              </div>
              <Progress value={Math.min((metrics.averageTaskTime / 120) * 100, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Tiempo promedio por tarea completada
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Eficiencia</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.efficiency.toFixed(1)}%
                </span>
              </div>
              <Progress value={Math.min(metrics.efficiency, 100)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Tiempo estimado vs tiempo real
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Productividad</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.productivity.toFixed(1)}/5
                </span>
              </div>
              <Progress value={(metrics.productivity / 5) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Puntuación promedio de sesiones
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Insights de Tiempo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Día más productivo
                </span>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {mostProductiveDay?.date ? 
                  new Date(mostProductiveDay.date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  }) : 'No hay datos'
                }
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Productividad: {mostProductiveDay?.productivity_score?.toFixed(1) || '0'}/5
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recomendaciones</h4>
              <div className="space-y-1">
                {consistencyScore < 70 && (
                  <p className="text-xs text-muted-foreground">
                    • Intenta mantener una rutina más consistente
                  </p>
                )}
                {metrics.averageTaskTime > 120 && (
                  <p className="text-xs text-muted-foreground">
                    • Considera dividir tareas grandes en subtareas
                  </p>
                )}
                {metrics.efficiency < 80 && (
                  <p className="text-xs text-muted-foreground">
                    • Mejora tus estimaciones de tiempo
                  </p>
                )}
                {metrics.productivity < 3 && (
                  <p className="text-xs text-muted-foreground">
                    • Identifica y elimina distracciones
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TimeMetricsDashboard;
