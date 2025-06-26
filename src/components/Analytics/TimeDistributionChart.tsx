
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, AlertCircle, PlayCircle, CheckCircle, Target } from 'lucide-react';

interface TimeDistributionChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const TimeDistributionChart = ({ period }: TimeDistributionChartProps) => {
  const { getTimeDistribution } = useAnalytics();
  const { data: timeData, isLoading, error } = getTimeDistribution(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Error al cargar datos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!timeData || timeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Tiempo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualiza cómo distribuyes tu tiempo de trabajo
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay datos de tiempo registrados</h3>
              <p className="text-muted-foreground mb-4">
                Para ver la distribución de tu tiempo, necesitas registrar sesiones de trabajo.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  <span>Inicia un cronómetro al trabajar en una tarea</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Registra el tiempo dedicado cada día</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar datos del gráfico
  const chartData = timeData.map(item => {
    const workHours = Number((item.work_time / 60).toFixed(1));
    return {
      ...item,
      date_formatted: format(parseISO(item.date), 'dd MMM', { locale: es }),
      work_hours: isNaN(workHours) ? 0 : workHours,
      tasks_completed: item.tasks_completed || 0,
    };
  });

  // Separar datos con tiempo de trabajo vs solo tareas completadas
  const daysWithWorkTime = chartData.filter(item => item.work_hours > 0);
  const daysWithOnlyTasks = chartData.filter(item => item.work_hours === 0 && item.tasks_completed > 0);

  const chartConfig = {
    work_hours: {
      label: 'Horas Trabajadas',
      color: 'hsl(var(--chart-2))',
    },
    tasks_completed: {
      label: 'Tareas Completadas',
      color: 'hsl(var(--chart-1))',
    },
  };

  // Si solo hay tareas sin tiempo registrado
  if (daysWithWorkTime.length === 0 && daysWithOnlyTasks.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Tareas Completadas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tareas completadas por día (registra sesiones de trabajo para ver tiempo)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daysWithOnlyTasks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date_formatted" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    label={{ value: 'Tareas', angle: -90, position: 'insideLeft' }}
                  />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm">
                              <span className="inline-block w-3 h-3 rounded bg-chart-1 mr-2"></span>
                              {payload[0].value} tareas completadas
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="tasks_completed"
                    fill="var(--color-tasks_completed)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Mejora tus métricas</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Registra sesiones de trabajo para ver distribución de tiempo, 
                    calcular eficiencia y obtener insights más profundos sobre tu productividad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución del Tiempo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Horas trabajadas por día
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daysWithWorkTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date_formatted" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="work_hours"
                fill="var(--color-work_hours)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TimeDistributionChart;
