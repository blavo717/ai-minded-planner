
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface TaskCompletionChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const TaskCompletionChart = ({ period }: TaskCompletionChartProps) => {
  const { getTimeDistribution } = useAnalytics();
  const { data: timeData, isLoading, error } = getTimeDistribution(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completado de Tareas</CardTitle>
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
          <CardTitle>Completado de Tareas</CardTitle>
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
          <CardTitle>Completado de Tareas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Evolución diaria de tareas completadas
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay datos de tareas disponibles</h3>
              <p className="text-muted-foreground">
                Completa algunas tareas para ver tu progreso aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = timeData.map(item => ({
    ...item,
    date_formatted: format(parseISO(item.date), 'dd MMM', { locale: es }),
    tasks_completed: isNaN(item.tasks_completed) ? 0 : item.tasks_completed,
  }));

  const chartConfig = {
    tasks_completed: {
      label: 'Tareas Completadas',
      color: 'hsl(var(--chart-1))',
    },
  };

  const hasData = chartData.some(item => item.tasks_completed > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completado de Tareas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolución diaria de tareas completadas
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No hay tareas completadas en este período
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date_formatted" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tasks_completed"
                  stroke="var(--color-tasks_completed)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-tasks_completed)", strokeWidth: 2 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskCompletionChart;
