
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, AlertCircle, PlayCircle } from 'lucide-react';

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

  // Solo mostrar datos reales - sin generar datos ficticios
  if (!timeData || timeData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Tiempo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Horas trabajadas por día
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay sesiones de trabajo registradas</h3>
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

  const chartData = timeData.map(item => {
    const workHours = Number((item.work_time / 60).toFixed(1));
    return {
      ...item,
      date_formatted: format(parseISO(item.date), 'dd MMM', { locale: es }),
      work_hours: isNaN(workHours) ? 0 : workHours,
    };
  }).filter(item => item.work_hours > 0); // Filtrar días sin trabajo real

  const chartConfig = {
    work_hours: {
      label: 'Horas Trabajadas',
      color: 'hsl(var(--chart-2))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución del Tiempo</CardTitle>
        <p className="text-sm text-muted-foreground">
          Horas trabajadas por día (solo días con sesiones registradas)
        </p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay sesiones de trabajo registradas en este período
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
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
        )}
      </CardContent>
    </Card>
  );
};

export default TimeDistributionChart;
