
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProductivityHeatmapProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const ProductivityHeatmap = ({ period }: ProductivityHeatmapProps) => {
  const { getWorkPatterns } = useAnalytics();
  const { data: patterns, isLoading } = getWorkPatterns(period);

  if (isLoading || !patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getIntensity = (hour: number, day: number) => {
    const pattern = patterns.find(p => p.hour === hour && p.day_of_week === day);
    if (!pattern || pattern.total_sessions === 0) return 0;
    
    // Normalizar la productividad (0-5) a intensidad (0-1)
    return Math.min(pattern.productivity_score / 5, 1);
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (intensity < 0.2) return 'bg-blue-100 dark:bg-blue-900';
    if (intensity < 0.4) return 'bg-blue-200 dark:bg-blue-800';
    if (intensity < 0.6) return 'bg-blue-300 dark:bg-blue-700';
    if (intensity < 0.8) return 'bg-blue-400 dark:bg-blue-600';
    return 'bg-blue-500 dark:bg-blue-500';
  };

  const getTooltipText = (hour: number, day: number) => {
    const pattern = patterns.find(p => p.hour === hour && p.day_of_week === day);
    if (!pattern || pattern.total_sessions === 0) {
      return `${days[day]} ${hour}:00 - Sin datos`;
    }
    
    return `${days[day]} ${hour}:00\nProductividad: ${pattern.productivity_score.toFixed(1)}/5\nSesiones: ${pattern.total_sessions}\nTareas: ${pattern.tasks_completed}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Calor de Productividad</CardTitle>
        <p className="text-sm text-muted-foreground">
          Patrones de productividad por día y hora
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Leyenda */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Menos productivo</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 dark:bg-gray-800 rounded-sm" />
              <div className="w-3 h-3 bg-blue-100 dark:bg-blue-900 rounded-sm" />
              <div className="w-3 h-3 bg-blue-200 dark:bg-blue-800 rounded-sm" />
              <div className="w-3 h-3 bg-blue-300 dark:bg-blue-700 rounded-sm" />
              <div className="w-3 h-3 bg-blue-400 dark:bg-blue-600 rounded-sm" />
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-500 rounded-sm" />
            </div>
            <span className="text-sm text-muted-foreground">Más productivo</span>
          </div>

          {/* Heatmap */}
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-25 gap-1 text-xs">
                {/* Header con horas */}
                <div className="col-span-1"></div>
                {hours.map(hour => (
                  <div key={hour} className="text-center text-muted-foreground text-xs p-1">
                    {hour}
                  </div>
                ))}
                
                {/* Filas por día */}
                {days.map((day, dayIndex) => (
                  <React.Fragment key={day}>
                    <div className="text-muted-foreground text-xs p-1 flex items-center">
                      {day}
                    </div>
                    {hours.map(hour => {
                      const intensity = getIntensity(hour, dayIndex);
                      return (
                        <div
                          key={`${dayIndex}-${hour}`}
                          className={`w-4 h-4 rounded-sm ${getColor(intensity)} cursor-pointer transition-all hover:scale-110`}
                          title={getTooltipText(hour, dayIndex)}
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-card-foreground">
                {patterns.reduce((sum, p) => sum + p.total_sessions, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Sesiones</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-card-foreground">
                {patterns.reduce((sum, p) => sum + p.tasks_completed, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Tareas Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-card-foreground">
                {patterns.length > 0 
                  ? (patterns.reduce((sum, p) => sum + p.productivity_score, 0) / patterns.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-xs text-muted-foreground">Productividad Promedio</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityHeatmap;
