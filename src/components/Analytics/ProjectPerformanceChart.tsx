
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AlertCircle, BarChart3, ArrowUpDown, TrendingUp, Clock, Target } from 'lucide-react';

interface ProjectPerformanceChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const sanitizeNumber = (value: any): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return 0;
  }
  return Number(value);
};

const ProjectPerformanceChart = ({ period }: ProjectPerformanceChartProps) => {
  const { getProjectPerformance } = useAnalytics();
  const { data: projectData, isLoading, error } = getProjectPerformance(period);
  const [sortBy, setSortBy] = React.useState<'tasks' | 'time' | 'efficiency'>('tasks');
  const [viewType, setViewType] = React.useState<'charts' | 'table'>('charts');

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

  // Sanitizar y preparar datos
  const chartData = projectData.map(project => ({
    ...project,
    project_name: project.project_name.length > 20 
      ? project.project_name.substring(0, 20) + '...' 
      : project.project_name,
    total_hours: sanitizeNumber((project.total_time || 0) / 60),
    tasks_completed: sanitizeNumber(project.tasks_completed),
    completion_rate: sanitizeNumber(project.completion_rate),
    efficiency: sanitizeNumber(project.efficiency),
  }));

  // Ordenar datos
  const sortedData = [...chartData].sort((a, b) => {
    switch (sortBy) {
      case 'tasks':
        return b.tasks_completed - a.tasks_completed;
      case 'time':
        return b.total_hours - a.total_hours;
      case 'efficiency':
        return b.efficiency - a.efficiency;
      default:
        return 0;
    }
  });

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
    efficiency: {
      label: 'Eficiencia (%)',
      color: 'hsl(var(--chart-4))',
    },
  };

  // Datos para gráfico de pastel
  const pieData = sortedData.map((project, index) => ({
    name: project.project_name,
    value: project.tasks_completed,
    color: `hsl(${(index * 60) % 360}, 70%, 50%)`
  }));

  const totalTasks = sortedData.reduce((sum, p) => sum + p.tasks_completed, 0);
  const totalHours = sortedData.reduce((sum, p) => sum + p.total_hours, 0);
  const avgEfficiency = sortedData.length > 0 
    ? sortedData.reduce((sum, p) => sum + p.efficiency, 0) / sortedData.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Tareas</span>
            </div>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Total Horas</span>
            </div>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Eficiencia Promedio</span>
            </div>
            <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            <span className="text-sm font-medium">Ordenar por:</span>
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tasks">Tareas</SelectItem>
              <SelectItem value="time">Tiempo</SelectItem>
              <SelectItem value="efficiency">Eficiencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewType === 'charts' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('charts')}
          >
            Gráficos
          </Button>
          <Button
            variant={viewType === 'table' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('table')}
          >
            Tabla
          </Button>
        </div>
      </div>

      {viewType === 'charts' ? (
        <>
          {/* Gráfico de distribución */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribución de Tareas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Proporción de tareas por proyecto
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparación de Métricas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Eficiencia vs Tareas completadas
                </p>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sortedData.slice(0, 5)} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis 
                        type="category" 
                        dataKey="project_name" 
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="efficiency"
                        fill="var(--color-efficiency)"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos detallados */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas Completadas por Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedData} layout="horizontal">
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
        </>
      ) : (
        // Vista de tabla
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Proyectos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Proyecto</th>
                    <th className="text-right p-2">Tareas</th>
                    <th className="text-right p-2">Horas</th>
                    <th className="text-right p-2">Eficiencia</th>
                    <th className="text-right p-2">Completado</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((project, index) => (
                    <tr key={project.project_id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{project.project_name}</td>
                      <td className="p-2 text-right">
                        <Badge variant="outline">{project.tasks_completed}</Badge>
                      </td>
                      <td className="p-2 text-right">{project.total_hours.toFixed(1)}h</td>
                      <td className="p-2 text-right">
                        <Badge variant={project.efficiency > 80 ? 'default' : 'secondary'}>
                          {project.efficiency.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="p-2 text-right">
                        <Badge variant={project.completion_rate > 70 ? 'default' : 'secondary'}>
                          {project.completion_rate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectPerformanceChart;
