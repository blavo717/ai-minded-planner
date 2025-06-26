
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, BarChart3, ArrowUpDown } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { sanitizeNumber } from '@/utils/analyticsCalculations';
import ProjectSummaryCards from './ProjectPerformance/ProjectSummaryCards';
import ProjectChartsView from './ProjectPerformance/ProjectChartsView';
import ProjectTableView from './ProjectPerformance/ProjectTableView';

interface ProjectPerformanceChartProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

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

  // Sanitize and prepare data
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

  // Sort data
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

  const totalTasks = sortedData.reduce((sum, p) => sum + p.tasks_completed, 0);
  const totalHours = sortedData.reduce((sum, p) => sum + p.total_hours, 0);
  const avgEfficiency = sortedData.length > 0 
    ? sortedData.reduce((sum, p) => sum + p.efficiency, 0) / sortedData.length 
    : 0;

  return (
    <div className="space-y-6">
      <ProjectSummaryCards 
        totalTasks={totalTasks}
        totalHours={totalHours}
        avgEfficiency={avgEfficiency}
      />

      {/* Controls */}
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
        <ProjectChartsView data={sortedData} chartConfig={chartConfig} />
      ) : (
        <ProjectTableView data={sortedData} />
      )}
    </div>
  );
};

export default ProjectPerformanceChart;
