
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProjectPerformanceChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const ProjectPerformanceChart = ({ period }: ProjectPerformanceChartProps) => {
  const { getProjectPerformance } = useAnalytics();
  const { data: projectData, isLoading } = getProjectPerformance(period);

  if (isLoading || !projectData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const chartData = projectData.map(project => ({
    ...project,
    project_name: project.project_name.length > 15 
      ? project.project_name.substring(0, 15) + '...' 
      : project.project_name,
    total_hours: Number((project.total_time / 60).toFixed(1)),
  }));

  const chartConfig = {
    tasks_completed: {
      label: 'Tareas Completadas',
      color: 'hsl(var(--chart-1))',
    },
    total_hours: {
      label: 'Horas Trabajadas',
      color: 'hsl(var(--chart-2))',
    },
    completion_rate: {
      label: 'Tasa de Completado (%)',
      color: 'hsl(var(--chart-3))',
    },
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tareas Completadas por Proyecto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Número de tareas completadas en cada proyecto
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="project_name" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="tasks_completed"
                  fill="var(--color-tasks_completed)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tiempo por Proyecto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Horas dedicadas a cada proyecto
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="project_name" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total_hours"
                  fill="var(--color-total_hours)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasa de Completado por Proyecto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Porcentaje de tareas completadas en cada proyecto
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="project_name" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="completion_rate"
                  fill="var(--color-completion_rate)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPerformanceChart;
