
import { supabase } from '@/integrations/supabase/client';
import { subDays, subHours, addMinutes } from 'date-fns';

export interface TestSessionData {
  taskId: string;
  duration: number;
  productivity: number;
  date: Date;
  notes?: string;
}

export const generateTestSessions = async (userId: string, taskIds: string[]): Promise<void> => {
  const sessions: TestSessionData[] = [];
  const now = new Date();

  // Generar sesiones realistas basadas en las tareas existentes
  taskIds.forEach((taskId, index) => {
    // 2-4 sesiones por tarea en los últimos 30 días
    const sessionCount = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < sessionCount; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const sessionDate = subDays(now, daysAgo);
      
      // Horarios realistas de trabajo (8am - 6pm)
      const workHour = Math.floor(Math.random() * 10) + 8;
      const sessionStart = subHours(sessionDate, 24 - workHour);
      
      // Duración realista (15 minutos a 3 horas)
      const duration = Math.floor(Math.random() * 165) + 15;
      
      // Productividad variable pero realista
      const productivity = Math.floor(Math.random() * 3) + 3; // 3-5
      
      sessions.push({
        taskId,
        duration,
        productivity,
        date: sessionStart,
        notes: i === 0 ? `Sesión de trabajo enfocado en tarea ${index + 1}` : undefined
      });
    }
  });

  // Insertar sesiones en lotes
  const sessionData = sessions.map((session) => ({
    user_id: userId,
    task_id: session.taskId,
    started_at: session.date.toISOString(),
    ended_at: addMinutes(session.date, session.duration).toISOString(),
    duration_minutes: session.duration,
    productivity_score: session.productivity,
    notes: session.notes
  }));

  const { error } = await supabase
    .from('task_sessions')
    .insert(sessionData);

  if (error) throw error;
};

export const checkAndGenerateTestData = async (userId: string): Promise<boolean> => {
  // Verificar si ya hay sesiones
  const { data: existingSessions, error: sessionsError } = await supabase
    .from('task_sessions')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (sessionsError) throw sessionsError;

  if (existingSessions && existingSessions.length > 0) {
    console.log('Ya existen sesiones, no se generan datos de prueba');
    return false;
  }

  // Obtener tareas completadas para generar sesiones
  const { data: completedTasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (tasksError) throw tasksError;

  if (!completedTasks || completedTasks.length === 0) {
    console.log('No hay tareas completadas para generar sesiones');
    return false;
  }

  const taskIds = completedTasks.map(task => task.id);
  await generateTestSessions(userId, taskIds);
  
  console.log(`Generadas sesiones de prueba para ${taskIds.length} tareas`);
  return true;
};
