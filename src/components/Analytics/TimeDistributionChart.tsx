
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TimeDistributionChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const TimeDistributionChart = ({ period }: TimeDistributionChartProps) => {
  const { getTimeDistribution } = useAnalytics();
  const { data: timeData, isLoading } = getTimeDistribution(period);

  if (isLoading || !timeData) {
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

  const chartData = timeData.map(item => ({
    ...item,
    date_formatted: format(parseISO(item.date), 'dd MMM', { locale: es }),
    work_hours: Number((item.work_time / 60).toFixed(1)),
  }));

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
          Horas trabajadas por día
        </p>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default TimeDistributionChart;
