
import { supabase } from '@/integrations/supabase/client';
import { subDays, subHours, addMinutes } from 'date-fns';

export const generateTestData = async (userId: string) => {
  console.log('Generando datos de prueba para usuario:', userId);

  try {
    // Generar sesiones de trabajo para los últimos 30 días
    const sessions = [];
    const now = new Date();

    for (let i = 0; i < 30; i++) {
      const date = subDays(now, i);
      const numSessions = Math.floor(Math.random() * 4) + 1; // 1-4 sesiones por día

      for (let j = 0; j < numSessions; j++) {
        const startHour = Math.floor(Math.random() * 10) + 8; // 8-17h
        const startTime = new Date(date);
        startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
        
        const duration = Math.floor(Math.random() * 120) + 30; // 30-150 minutos
        const endTime = addMinutes(startTime, duration);
        
        sessions.push({
          user_id: userId,
          started_at: startTime.toISOString(),
          ended_at: endTime.toISOString(),
          duration_minutes: duration,
          productivity_score: Math.floor(Math.random() * 3) + 3, // 3-5
          notes: `Sesión de trabajo ${j + 1} del día`,
        });
      }
    }

    // Insertar sesiones de trabajo
    const { error: sessionsError } = await supabase
      .from('task_sessions')
      .insert(sessions);

    if (sessionsError) {
      console.error('Error insertando sesiones:', sessionsError);
      throw sessionsError;
    }

    // Actualizar algunas tareas existentes con duración real
    const { data: existingTasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', userId)
      .limit(10);

    if (existingTasks && existingTasks.length > 0) {
      // Actualizar cada tarea individualmente
      for (const task of existingTasks) {
        const { error: updateError } = await supabase
          .from('tasks')
          .update({
            actual_duration: Math.floor(Math.random() * 180) + 30, // 30-210 minutos
            estimated_duration: Math.floor(Math.random() * 120) + 60, // 60-180 minutos
          })
          .eq('id', task.id);

        if (updateError) {
          console.error('Error actualizando tarea:', updateError);
        }
      }
    }

    console.log(`Generados datos de prueba: ${sessions.length} sesiones`);
    return { success: true, sessions: sessions.length };

  } catch (error) {
    console.error('Error generando datos de prueba:', error);
    throw error;
  }
};

// Función para limpiar datos de prueba
export const cleanTestData = async (userId: string) => {
  try {
    // Eliminar sesiones de prueba
    const { error: sessionsError } = await supabase
      .from('task_sessions')
      .delete()
      .eq('user_id', userId);

    if (sessionsError) {
      console.error('Error limpiando sesiones:', sessionsError);
      throw sessionsError;
    }

    console.log('Datos de prueba limpiados');
    return { success: true };

  } catch (error) {
    console.error('Error limpiando datos de prueba:', error);
    throw error;
  }
};
