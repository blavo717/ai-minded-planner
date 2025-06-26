
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, TrendingUp, Target } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface WorkPatternsAnalysisProps {
  period: 'week' | 'month' | 'quarter' | 'year';
}

const WorkPatternsAnalysis = ({ period }: WorkPatternsAnalysisProps) => {
  const { getWorkPatterns } = useAnalytics();
  const { data: patterns, isLoading } = getWorkPatterns(period);

  if (isLoading || !patterns) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-32 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Analizar patrones
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  // Mejor día de la semana
  const dayProductivity = Array.from({ length: 7 }, (_, day) => {
    const dayPatterns = patterns.filter(p => p.day_of_week === day);
    const avgProductivity = dayPatterns.length > 0 
      ? dayPatterns.reduce((sum, p) => sum + p.productivity_score, 0) / dayPatterns.length
      : 0;
    const totalTasks = dayPatterns.reduce((sum, p) => sum + p.tasks_completed, 0);
    
    return {
      day,
      name: dayNames[day],
      productivity: avgProductivity,
      tasks: totalTasks,
      sessions: dayPatterns.reduce((sum, p) => sum + p.total_sessions, 0)
    };
  });

  const bestDay = dayProductivity.reduce((best, current) => 
    current.productivity > best.productivity ? current : best
  );

  // Mejor hora del día
  const hourProductivity = Array.from({ length: 24 }, (_, hour) => {
    const hourPatterns = patterns.filter(p => p.hour === hour);
    const avgProductivity = hourPatterns.length > 0 
      ? hourPatterns.reduce((sum, p) => sum + p.productivity_score, 0) / hourPatterns.length
      : 0;
    const totalTasks = hourPatterns.reduce((sum, p) => sum + p.tasks_completed, 0);
    
    return {
      hour,
      productivity: avgProductivity,
      tasks: totalTasks,
      sessions: hourPatterns.reduce((sum, p) => sum + p.total_sessions, 0)
    };
  });

  const bestHour = hourProductivity.reduce((best, current) => 
    current.productivity > best.productivity ? current : best
  );

  // Identificar patrones de bloques de tiempo
  const morningHours = hourProductivity.filter(h => h.hour >= 6 && h.hour < 12);
  const afternoonHours = hourProductivity.filter(h => h.hour >= 12 && h.hour < 18);
  const eveningHours = hourProductivity.filter(h => h.hour >= 18 && h.hour < 24);

  const timeBlocks = [
    {
      name: 'Mañana',
      hours: '6:00 - 12:00',
      productivity: morningHours.length > 0 
        ? morningHours.reduce((sum, h) => sum + h.productivity, 0) / morningHours.length
        : 0,
      tasks: morningHours.reduce((sum, h) => sum + h.tasks, 0),
      sessions: morningHours.reduce((sum, h) => sum + h.sessions, 0)
    },
    {
      name: 'Tarde',
      hours: '12:00 - 18:00',
      productivity: afternoonHours.length > 0 
        ? afternoonHours.reduce((sum, h) => sum + h.productivity, 0) / afternoonHours.length
        : 0,
      tasks: afternoonHours.reduce((sum, h) => sum + h.tasks, 0),
      sessions: afternoonHours.reduce((sum, h) => sum + h.sessions, 0)
    },
    {
      name: 'Noche',
      hours: '18:00 - 24:00',
      productivity: eveningHours.length > 0 
        ? eveningHours.reduce((sum, h) => sum + h.productivity, 0) / eveningHours.length
        : 0,
      tasks: eveningHours.reduce((sum, h) => sum + h.tasks, 0),
      sessions: eveningHours.reduce((sum, h) => sum + h.sessions, 0)
    }
  ];

  const bestTimeBlock = timeBlocks.reduce((best, current) => 
    current.productivity > best.productivity ? current : best
  );

  // Días laborables vs fines de semana
  const weekdays = dayProductivity.filter(d => d.day >= 1 && d.day <= 5);
  const weekend = dayProductivity.filter(d => d.day === 0 || d.day === 6);

  const weekdayAvg = weekdays.length > 0 
    ? weekdays.reduce((sum, d) => sum + d.productivity, 0) / weekdays.length
    : 0;
  const weekendAvg = weekend.length > 0 
    ? weekend.reduce((sum, d) => sum + d.productivity, 0) / weekend.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Resumen de patrones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Día</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{bestDay.name}</div>
            <p className="text-xs text-muted-foreground">
              {bestDay.productivity.toFixed(1)}/5 productividad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Hora</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {bestHour.hour}:00
            </div>
            <p className="text-xs text-muted-foreground">
              {bestHour.productivity.toFixed(1)}/5 productividad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Bloque</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{bestTimeBlock.name}</div>
            <p className="text-xs text-muted-foreground">
              {bestTimeBlock.productivity.toFixed(1)}/5 productividad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semana vs Fin</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {weekdayAvg > weekendAvg ? 'Semana' : 'Fin de Semana'}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.max(weekdayAvg, weekendAvg).toFixed(1)}/5 productividad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Productividad por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dayProductivity
                .sort((a, b) => b.productivity - a.productivity)
                .map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20">{day.name}</span>
                      <Badge variant={day.productivity > 3 ? "default" : "secondary"}>
                        {day.productivity.toFixed(1)}/5
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {day.tasks} tareas • {day.sessions} sesiones
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productividad por Bloque de Tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeBlocks
                .sort((a, b) => b.productivity - a.productivity)
                .map((block) => (
                  <div key={block.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-sm font-medium">{block.name}</span>
                        <div className="text-xs text-muted-foreground">{block.hours}</div>
                      </div>
                      <Badge variant={block.productivity > 3 ? "default" : "secondary"}>
                        {block.productivity.toFixed(1)}/5
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {block.tasks} tareas • {block.sessions} sesiones
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recomendaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones de Optimización</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                🚀 Horario Óptimo Detectado
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Tu mejor rendimiento es los <strong>{bestDay.name}</strong> a las <strong>{bestHour.hour}:00</strong>. 
                Programa tus tareas más importantes en este horario.
              </p>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                ⏰ Bloque de Tiempo Sugerido
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Tu bloque más productivo es la <strong>{bestTimeBlock.name}</strong> ({bestTimeBlock.hours}). 
                Considera dedicar este tiempo a trabajo que requiere más concentración.
              </p>
            </div>

            {weekdayAvg > weekendAvg + 0.5 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  📅 Patrón de Trabajo
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Eres más productivo durante la semana laboral. Considera reservar los fines de semana 
                  para descanso y tareas menos demandantes.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkPatternsAnalysis;
