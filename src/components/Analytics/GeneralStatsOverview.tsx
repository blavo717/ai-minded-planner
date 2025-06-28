
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
  Database,
  Calendar,
  TrendingUp,
  FileText,
  Activity
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

  const averageHoursPerSession = stats.totalSessions > 0 
    ? stats.totalWorkHours / stats.totalSessions 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header con resumen ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumen Ejecutivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalProjects}</div>
              <div className="text-sm text-muted-foreground">Proyectos Total</div>
              <div className="text-xs text-green-600">
                {stats.completedProjects} completados ({projectCompletionRate.toFixed(1)}%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Tareas Total</div>
              <div className="text-xs text-blue-600">
                {stats.completedTasks} completadas ({taskCompletionRate.toFixed(1)}%)
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalWorkHours}h</div>
              <div className="text-sm text-muted-foreground">Horas Trabajadas</div>
              <div className="text-xs text-orange-600">
                {stats.totalSessions} sesiones registradas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarjetas principales de inventario actual */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventario de Proyectos</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-green-600">Activos: {stats.activeProjects}</span>
                <span className="text-blue-600">Completados: {stats.completedProjects}</span>
              </div>
              <Progress value={projectCompletionRate} className="h-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Tareas</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <div className="space-y-1 mt-2">
              <div className="grid grid-cols-3 gap-1 text-xs">
                <span className="text-yellow-600 text-center">{stats.pendingTasks}</span>
                <span className="text-blue-600 text-center">{stats.inProgressTasks}</span>
                <span className="text-green-600 text-center">{stats.completedTasks}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-xs text-muted-foreground">
                <span className="text-center">Pend.</span>
                <span className="text-center">Prog.</span>
                <span className="text-center">Comp.</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad de Trabajo</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <div className="text-xs text-muted-foreground mt-2">
              <div>Total: {stats.totalWorkHours}h trabajadas</div>
              <div className="text-orange-600 mt-1">
                Promedio: {averageHoursPerSession.toFixed(1)}h por sesión
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productividad General</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {taskCompletionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <div>Tasa de completado</div>
              <Badge variant={taskCompletionRate > 50 ? 'default' : 'secondary'} className="mt-1">
                {taskCompletionRate > 75 ? 'Excelente' : 
                 taskCompletionRate > 50 ? 'Bueno' : 
                 taskCompletionRate > 25 ? 'Regular' : 'Bajo'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de métricas detalladas por inventario */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Detalle de Proyectos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estado Actual</span>
              <Badge variant={stats.activeProjects > 0 ? 'default' : 'secondary'}>
                {stats.activeProjects} activos
              </Badge>
            </div>
            <Progress value={projectCompletionRate} className="h-2" />
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completados:</span>
                <span className="font-medium text-green-600">{stats.completedProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">En progreso:</span>
                <span className="font-medium text-blue-600">{stats.activeProjects}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-medium">{stats.totalProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Análisis de Tareas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Distribución Actual</span>
              <Badge variant={stats.pendingTasks === 0 ? 'default' : 'secondary'}>
                {stats.pendingTasks} pendientes
              </Badge>
            </div>
            <Progress value={taskCompletionRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Pendientes</div>
                <div className="font-medium text-yellow-600">{stats.pendingTasks}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">En Progreso</div>
                <div className="font-medium text-blue-600">{stats.inProgressTasks}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Completadas</div>
                <div className="font-medium text-green-600">{stats.completedTasks}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Total</div>
                <div className="font-medium">{stats.totalTasks}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Registro de Trabajo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Actividad Total</span>
              <Badge variant={stats.totalSessions > 0 ? 'default' : 'secondary'}>
                {stats.totalSessions} sesiones
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Horas totales:</span>
                <span className="font-medium text-purple-600">{stats.totalWorkHours}h</span>
              </div>
              
              {stats.totalSessions > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Promedio por sesión:</span>
                    <span className="font-medium">{averageHoursPerSession.toFixed(1)}h</span>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Productividad estimada</div>
                    <div className="text-sm font-medium">
                      {(stats.totalWorkHours / Math.max(stats.totalTasks, 1)).toFixed(1)}h por tarea
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de completitud de datos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estado de Datos del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {stats.totalProjects > 0 ? '✓' : '○'}
              </div>
              <div className="text-sm font-medium">Proyectos</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalProjects > 0 ? 'Datos disponibles' : 'Sin datos'}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {stats.totalTasks > 0 ? '✓' : '○'}
              </div>
              <div className="text-sm font-medium">Tareas</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalTasks > 0 ? 'Datos disponibles' : 'Sin datos'}
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {stats.totalSessions > 0 ? '✓' : '○'}
              </div>
              <div className="text-sm font-medium">Sesiones</div>
              <div className="text-xs text-muted-foreground">
                {stats.totalSessions > 0 ? 'Datos disponibles' : 'Sin datos'}
              </div>
            </div>
          </div>
          
          {stats.hasAnyData && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-sm text-green-800 dark:text-green-200">
                ✅ Sistema con datos suficientes para análisis detallados
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralStatsOverview;
