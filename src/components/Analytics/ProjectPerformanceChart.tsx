
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AlertCircle, BarChart3 } from 'lucide-react';

interface ProjectPerformanceChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

// Función para sanitizar datos numéricos
const sanitizeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};

const ProjectPerformanceChart = ({ period }: ProjectPerformanceChartProps) => {
  const { getProjectPerformance } = useAnalytics();
  const { data: projectData, isLoading, error } = getProjectPerformance(period);

  if (isLoading) {
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

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Error al cargar datos de proyectos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projectData || projectData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Proyecto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Análisis del rendimiento de tus proyectos
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay proyectos para analizar</h3>
              <p className="text-muted-foreground">
                Crea proyectos y completa tareas para ver el análisis de rendimiento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sanitizar todos los datos antes de pasarlos a los gráficos
  const chartData = projectData.map(project => ({
    ...project,
    project_name: project.project_name.length > 15 
      ? project.project_name.substring(0, 15) + '...' 
      : project.project_name,
    total_hours: sanitizeNumber((project.total_time || 0) / 60).toFixed(1),
    tasks_completed: sanitizeNumber(project.tasks_completed),
    completion_rate: sanitizeNumber(project.completion_rate),
    efficiency: sanitizeNumber(project.efficiency),
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
