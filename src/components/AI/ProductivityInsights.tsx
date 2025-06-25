
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Clock, Target, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProductivityMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgSessionDuration: number;
  totalFocusTime: number;
  productivityTrend: 'up' | 'down' | 'stable';
  bestPerformanceDay: string;
  suggestions: string[];
}

const ProductivityInsights = () => {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['productivity-insights', user?.id],
    queryFn: async (): Promise<ProductivityMetrics | null> => {
      if (!user) return null;

      const thirtyDaysAgo = subDays(new Date(), 30);
      const sevenDaysAgo = subDays(new Date(), 7);

      // Obtener tareas
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Obtener sesiones de trabajo
      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', thirtyDaysAgo.toISOString());

      // Obtener tareas de la última semana para comparar tendencias
      const { data: recentTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (!tasks || !sessions) return null;

      // Calcular métricas
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      
      const avgSessionDuration = sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / sessions.length 
        : 0;

      const totalFocusTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      // Calcular tendencia
      const recentCompletedTasks = recentTasks?.filter(t => t.status === 'completed').length || 0;
      const recentCompletionRate = recentTasks && recentTasks.length > 0 
        ? (recentCompletedTasks / recentTasks.length) * 100 
        : 0;

      let productivityTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentCompletionRate > completionRate + 5) {
        productivityTrend = 'up';
      } else if (recentCompletionRate < completionRate - 5) {
        productivityTrend = 'down';
      }

      // Encontrar mejor día de la semana
      const tasksByDay: Record<string, number> = {};
      tasks.forEach(task => {
        if (task.completed_at) {
          const day = format(new Date(task.completed_at), 'EEEE', { locale: es });
          tasksByDay[day] = (tasksByDay[day] || 0) + 1;
        }
      });

      const bestPerformanceDay = Object.entries(tasksByDay)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

      // Generar sugerencias básicas
      const suggestions: string[] = [];
      
      if (completionRate < 60) {
        suggestions.push('Considera dividir tareas grandes en subtareas más pequeñas');
      }
      
      if (avgSessionDuration < 25) {
        suggestions.push('Intenta sesiones de trabajo más largas para mejor concentración');
      }
      
      if (totalFocusTime < 300) { // menos de 5 horas al mes
        suggestions.push('Dedica más tiempo a sesiones de trabajo enfocado');
      }
      
      if (productivityTrend === 'down') {
        suggestions.push('Tu productividad ha disminuido. Revisa tu planificación semanal');
      }

      return {
        totalTasks: tasks.length,
        completedTasks,
        completionRate,
        avgSessionDuration,
        totalFocusTime,
        productivityTrend,
        bestPerformanceDay,
        suggestions,
      };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Inicia sesión para ver insights de productividad</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights de Productividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (metrics.productivityTrend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (metrics.productivityTrend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Insights de Productividad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Tareas Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.completionRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Tasa de Completado</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{Math.round(metrics.avgSessionDuration)}m</div>
              <div className="text-sm text-muted-foreground">Duración Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(metrics.totalFocusTime / 60)}h</div>
              <div className="text-sm text-muted-foreground">Tiempo Total</div>
            </div>
          </div>

          {/* Progreso de completado */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progreso de Tareas</span>
              <span className="text-sm text-muted-foreground">
                {metrics.completedTasks} de {metrics.totalTasks}
              </span>
            </div>
            <Progress value={metrics.completionRate} className="h-2" />
          </div>

          {/* Tendencia y mejor día */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                Tendencia {metrics.productivityTrend === 'up' ? 'Positiva' : 
                          metrics.productivityTrend === 'down' ? 'Negativa' : 'Estable'}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Mejor día: {metrics.bestPerformanceDay}</div>
              <div className="text-xs text-muted-foreground">Más tareas completadas</div>
            </div>
          </div>

          {/* Sugerencias */}
          {metrics.suggestions.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Sugerencias de Mejora
              </h4>
              <div className="space-y-2">
                {metrics.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityInsights;
