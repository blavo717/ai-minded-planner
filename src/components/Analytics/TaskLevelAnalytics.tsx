
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { Target, CheckCircle, Clock, BarChart3 } from 'lucide-react';

interface TaskLevelAnalyticsProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const TaskLevelAnalytics = ({ period }: TaskLevelAnalyticsProps) => {
  const { tasks } = useTasks();
  const { user } = useAuth();

  // Filtrar tareas por período
  const getFilteredTasks = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    return tasks.filter(task => {
      const taskDate = task.completed_at ? new Date(task.completed_at) : new Date(task.created_at);
      return taskDate >= startDate;
    });
  };

  const filteredTasks = getFilteredTasks();

  // Analizar por niveles de tarea
  const analyzeByTaskLevel = () => {
    const levels = {
      1: { name: 'Tareas Principales', tasks: [], completed: 0, total: 0 },
      2: { name: 'Subtareas', tasks: [], completed: 0, total: 0 },
      3: { name: 'Minitareas', tasks: [], completed: 0, total: 0 },
    };

    filteredTasks.forEach(task => {
      const level = Math.min(task.task_level || 1, 3) as 1 | 2 | 3;
      levels[level].tasks.push(task);
      levels[level].total++;
      if (task.status === 'completed') {
        levels[level].completed++;
      }
    });

    return Object.entries(levels).map(([level, data]) => ({
      level: parseInt(level),
      name: data.name,
      total: data.total,
      completed: data.completed,
      completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
      pending: data.total - data.completed,
    }));
  };

  // Analizar por estado
  const analyzeByStatus = () => {
    const statusCount = filteredTasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusLabels = {
      pending: 'Pendientes',
      in_progress: 'En Progreso', 
      completed: 'Completadas',
      cancelled: 'Canceladas'
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      name: statusLabels[status as keyof typeof statusLabels] || status,
      count,
      percentage: (count / filteredTasks.length) * 100
    }));
  };

  // Analizar por prioridad
  const analyzeByPriority = () => {
    const priorityCount = filteredTasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityLabels = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      urgent: 'Urgente'
    };

    return Object.entries(priorityCount).map(([priority, count]) => ({
      priority,
      name: priorityLabels[priority as keyof typeof priorityLabels] || priority,
      count,
      percentage: (count / filteredTasks.length) * 100
    }));
  };

  const levelData = analyzeByTaskLevel();
  const statusData = analyzeByStatus();
  const priorityData = analyzeByPriority();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const chartConfig = {
    total: {
      label: 'Total',
      color: 'hsl(var(--chart-1))',
    },
    completed: {
      label: 'Completadas',
      color: 'hsl(var(--chart-2))',
    },
    pending: {
      label: 'Pendientes',
      color: 'hsl(var(--chart-3))',
    },
  };

  if (filteredTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Niveles de Tarea</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay datos para el período seleccionado</h3>
              <p className="text-muted-foreground">
                Crea y completa tareas para ver el análisis por niveles.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen por niveles */}
      <div className="grid gap-4 md:grid-cols-3">
        {levelData.map((level) => (
          <Card key={level.level}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{level.name}</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{level.total}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {level.completed} completadas
                </span>
                <Badge variant={level.completionRate > 70 ? 'default' : 'secondary'}>
                  {level.completionRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={level.completionRate} className="h-2 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de barras por nivel */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Nivel de Tarea</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" name="Completadas" />
                  <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" name="Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de estado */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Por Prioridad</h4>
              <div className="space-y-2">
                {priorityData.map((item) => (
                  <div key={item.priority} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.count}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Métricas Clave</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Tasa de Completado General</span>
                  </div>
                  <Badge>
                    {((filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100).toFixed(1)}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Tareas Activas</span>
                  </div>
                  <Badge variant="secondary">
                    {filteredTasks.filter(t => t.status === 'in_progress').length}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Tareas de Alta Prioridad</span>
                  </div>
                  <Badge variant="destructive">
                    {filteredTasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskLevelAnalytics;
