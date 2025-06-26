
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCompletionChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const TaskCompletionChart = ({ period }: TaskCompletionChartProps) => {
  const { getTimeDistribution } = useAnalytics();
  const { data: timeData, isLoading } = getTimeDistribution(period);

  if (isLoading || !timeData) {
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

  const chartData = timeData.map(item => ({
    ...item,
    date_formatted: format(parseISO(item.date), 'dd MMM', { locale: es }),
  }));

  const chartConfig = {
    tasks_completed: {
      label: 'Tareas Completadas',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Completado de Tareas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolución diaria de tareas completadas
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default TaskCompletionChart;
