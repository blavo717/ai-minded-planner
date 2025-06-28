
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FolderOpen, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Timer, 
  Target,
  AlertCircle,
  Database
} from 'lucide-react';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

const GeneralStatsOverview = () => {
  const { data: stats, isLoading, error } = useGeneralStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Error al cargar estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No se pudieron cargar las estadísticas generales. Por favor, intenta de nuevo.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!stats?.hasAnyData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Sin Datos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No hay datos suficientes para mostrar estadísticas. 
            </p>
            <p className="text-sm text-muted-foreground">
              Crea algunos proyectos y tareas para comenzar a ver tus analytics.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const taskCompletionRate = stats.totalTasks > 0 
    ? (stats.completedTasks / stats.totalTasks) * 100 
    : 0;

  const projectCompletionRate = stats.totalProjects > 0 
    ? (stats.completedProjects / stats.totalProjects) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Tarjetas principales de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {stats.activeProjects} activos
              </span>
              <Badge variant={stats.activeProjects > 0 ? 'default' : 'secondary'}>
                {stats.completedProjects} completados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tareas</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {stats.pendingTasks} pendientes
              </span>
              <Badge variant={stats.completedTasks > 0 ? 'default' : 'secondary'}>
                {stats.completedTasks} completadas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones de Trabajo</CardTitle>
            <Timer className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground mt-2">
              {stats.totalWorkHours}h trabajadas
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia General</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskCompletionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Tasa de completado
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de progreso detallado */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Proyectos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso General</span>
              <Badge variant={projectCompletionRate > 50 ? 'default' : 'secondary'}>
                {projectCompletionRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={projectCompletionRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">{stats.activeProjects}</div>
                <div className="text-xs text-muted-foreground">Activos</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">{stats.completedProjects}</div>
                <div className="text-xs text-muted-foreground">Completados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Tareas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progreso General</span>
              <Badge variant={taskCompletionRate > 50 ? 'default' : 'secondary'}>
                {taskCompletionRate.toFixed(1)}%
              </Badge>
            </div>
            <Progress value={taskCompletionRate} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center">
                <div className="text-sm font-semibold text-yellow-600">{stats.pendingTasks}</div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">{stats.inProgressTasks}</div>
                <div className="text-xs text-muted-foreground">En Progreso</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-green-600">{stats.completedTasks}</div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GeneralStatsOverview;
