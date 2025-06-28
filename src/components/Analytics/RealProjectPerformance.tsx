
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useRealProjectPerformance } from '@/hooks/analytics/useRealProjectPerformance';
import { FolderOpen, CheckCircle, Clock, DollarSign, AlertCircle } from 'lucide-react';

const RealProjectPerformance = () => {
  const { data: projects, isLoading, error } = useRealProjectPerformance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error al cargar proyectos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se pudieron cargar los datos de rendimiento de proyectos.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            Sin Proyectos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay proyectos disponibles para mostrar.
            </p>
            <p className="text-sm text-muted-foreground">
              Crea tu primer proyecto para comenzar a ver su rendimiento aquí.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    completionRate: {
      label: 'Tasa de Completado (%)',
      color: 'hsl(var(--chart-1))',
    },
    efficiency: {
      label: 'Eficiencia (%)',
      color: 'hsl(var(--chart-2))',
    },
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'on_hold': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'active': return 'Activo';
      case 'on_hold': return 'En Pausa';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Gráfico de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Proyecto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comparación de tasa de completado y eficiencia
          </p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="completionRate" fill="var(--color-completionRate)" name="Completado %" />
                <Bar dataKey="efficiency" fill="var(--color-efficiency)" name="Eficiencia %" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Tarjetas detalladas de proyectos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate" title={project.name}>
                  {project.name}
                </CardTitle>
                <Badge variant={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progreso */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progreso</span>
                  <span className="text-sm font-bold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">{project.tasksCompleted}/{project.tasksTotal}</div>
                    <div className="text-xs text-muted-foreground">Tareas</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">{project.totalHours}h</div>
                    <div className="text-xs text-muted-foreground">Trabajadas</div>
                  </div>
                </div>
              </div>

              {/* Eficiencia y completado */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completado:</span>
                  <Badge variant="outline">{project.completionRate}%</Badge>
                </div>
                {project.efficiency > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Eficiencia:</span>
                    <Badge variant={project.efficiency > 100 ? 'default' : 'secondary'}>
                      {project.efficiency}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Presupuesto si existe */}
              {project.budget > 0 && (
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Presupuesto</span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      ${project.budgetUsed.toFixed(0)} / ${project.budget.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((project.budgetUsed / project.budget) * 100).toFixed(1)}% usado
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RealProjectPerformance;
