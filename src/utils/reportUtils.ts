
import { supabase } from '@/integrations/supabase/client';
import { subWeeks, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface SimpleReport {
  id: string;
  type: 'weekly' | 'monthly';
  period: { start: Date; end: Date };
  metrics: {
    tasksCompleted: number;
    productivity: number;
    timeWorked: number;
    efficiency: number;
  };
  insights: string[];
  recommendations: string[];
  created_at: string;
}

export const generateSimpleReport = async (
  userId: string, 
  type: 'weekly' | 'monthly'
): Promise<SimpleReport> => {
  const now = new Date();
  const startDate = type === 'weekly' 
    ? startOfWeek(subWeeks(now, 1))
    : startOfMonth(subMonths(now, 1));
  const endDate = type === 'weekly'
    ? endOfWeek(subWeeks(now, 1))
    : endOfMonth(subMonths(now, 1));

  // Get tasks and sessions
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId);

  const { data: sessions } = await supabase
    .from('task_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('started_at', startDate.toISOString())
    .lte('started_at', endDate.toISOString());

  if (!tasks || !sessions) {
    throw new Error('Failed to fetch data for report');
  }

  // Calculate metrics
  const completedTasks = tasks.filter(t => 
    t.status === 'completed' && 
    t.completed_at &&
    new Date(t.completed_at) >= startDate &&
    new Date(t.completed_at) <= endDate
  ).length;

  const totalWorkTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const avgProductivity = sessions.length > 0 
    ? sessions.reduce((sum, s) => sum + (s.productivity_score || 0), 0) / sessions.length
    : 0;

  const tasksWithEstimate = tasks.filter(t => t.estimated_duration && t.actual_duration);
  const efficiency = tasksWithEstimate.length > 0 
    ? tasksWithEstimate.reduce((sum, t) => sum + (t.estimated_duration! / Math.max(t.actual_duration!, 1)), 0) / tasksWithEstimate.length * 100
    : 100;

  const report: SimpleReport = {
    id: `${type}-${Date.now()}`,
    type,
    period: { start: startDate, end: endDate },
    metrics: {
      tasksCompleted: completedTasks,
      productivity: avgProductivity,
      timeWorked: totalWorkTime,
      efficiency
    },
    insights: [
      `Completaste ${completedTasks} tareas en este período`,
      `Tu productividad promedio fue de ${avgProductivity.toFixed(1)}/5`,
      `Trabajaste un total de ${Math.round(totalWorkTime / 60)} horas`
    ],
    recommendations: [
      completedTasks < 10 ? 'Considera establecer metas más pequeñas y alcanzables' : 'Excelente ritmo de trabajo, mantén la consistencia',
      avgProductivity < 3 ? 'Identifica las distracciones principales y elimínalas' : 'Buen nivel de concentración',
      efficiency < 80 ? 'Mejora tus estimaciones de tiempo para tareas similares' : 'Excelente gestión del tiempo'
    ],
    created_at: new Date().toISOString()
  };

  return report;
};
