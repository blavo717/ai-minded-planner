
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Archive, 
  Activity, 
  TrendingUp, 
  Calendar,
  Clock,
  Target
} from 'lucide-react';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

const InventoryVsActivity = () => {
  const { data: stats, isLoading } = useGeneralStats();

  if (isLoading || !stats?.hasAnyData) {
    return null;
  }

  const activeWorkRate = stats.totalSessions > 0 ? 
    (stats.totalWorkHours / stats.totalSessions).toFixed(1) : '0';

  const taskProductivity = stats.totalTasks > 0 ? 
    (stats.completedTasks / stats.totalTasks * 100).toFixed(1) : '0';

  const projectVelocity = stats.totalProjects > 0 ? 
    (stats.completedProjects / stats.totalProjects * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventario vs Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inventario Actual */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Inventario Actual
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Proyectos en Sistema</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.activeProjects} activos, {stats.completedProjects} completados
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {stats.totalProjects}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Tareas Registradas</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.pendingTasks} pend., {stats.inProgressTasks} en prog.
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {stats.totalTasks}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Sesiones de Trabajo</div>
                    <div className="text-sm text-muted-foreground">
                      {stats.totalWorkHours}h de trabajo registrado
                    </div>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {stats.totalSessions}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Indicadores de Actividad
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Productividad de Tareas</span>
                    <span className="text-lg font-bold text-blue-600">{taskProductivity}%</span>
                  </div>
                  <Progress value={parseFloat(taskProductivity)} className="h-2" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.completedTasks} de {stats.totalTasks} tareas completadas
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Velocidad de Proyectos</span>
                    <span className="text-lg font-bold text-green-600">{projectVelocity}%</span>
                  </div>
                  <Progress value={parseFloat(projectVelocity)} className="h-2 bg-green-200" />
                  <div className="text-xs text-muted-foreground mt-1">
                    {stats.completedProjects} de {stats.totalProjects} proyectos completados
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Intensidad de Trabajo</span>
                    <span className="text-lg font-bold text-purple-600">{activeWorkRate}h</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Promedio por sesión de trabajo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen comparativo */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Resumen Comparativo
            </h4>
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">Inventario</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalProjects + stats.totalTasks} elementos totales
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">Completados</div>
                <div className="text-xs text-muted-foreground">
                  {stats.completedProjects + stats.completedTasks} elementos finalizados
                </div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">Actividad</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalWorkHours}h invertidas en {stats.totalSessions} sesiones
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryVsActivity;
