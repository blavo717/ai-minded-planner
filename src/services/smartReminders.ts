import { supabase } from '@/integrations/supabase/client';

export interface SmartReminder {
  id?: string;
  user_id: string;
  task_id?: string;
  reminder_type: string;
  title: string;
  message?: string;
  scheduled_for: Date;
  is_sent?: boolean;
  created_at?: Date;
}

export interface PendingReminder extends SmartReminder {
  task_title?: string;
  task_priority?: string;
}

/**
 * ✅ CHECKPOINT 4.1: Servicio de Recordatorios Inteligentes
 * Sistema que permite programar y gestionar recordatorios reales
 */
export class SmartReminders {
  private userId: string;
  private reminderInterval: NodeJS.Timeout | null = null;
  private onReminderCallback?: (reminder: PendingReminder) => void;
  private isCheckingReminders: boolean = false;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Programa un recordatorio para una tarea específica
   */
  async scheduleReminder(
    taskId: string,
    minutes: number,
    customMessage?: string
  ): Promise<{ success: boolean; reminderId?: string; message: string }> {
    try {
      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + minutes);

      const title = `Recordatorio de tarea en ${minutes} minutos`;
      const message = customMessage || `Es hora de trabajar en tu tarea programada`;

      const { data, error } = await supabase
        .from('smart_reminders')
        .insert({
          user_id: this.userId,
          task_id: taskId,
          reminder_type: 'task_reminder',
          title,
          message,
          scheduled_for: scheduledTime.toISOString(),
          is_sent: false
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error scheduling reminder:', error);
        return {
          success: false,
          message: 'No pude programar el recordatorio. Intenta de nuevo.'
        };
      }

      // Iniciar verificación periódica si no está activa
      this.startReminderCheck();

      return {
        success: true,
        reminderId: data.id,
        message: `✅ Recordatorio programado para ${minutes} minutos (${scheduledTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`
      };
    } catch (error) {
      console.error('Error in scheduleReminder:', error);
      return {
        success: false,
        message: 'Error al programar recordatorio'
      };
    }
  }

  /**
   * Programa un recordatorio personalizado
   */
  async scheduleCustomReminder(
    message: string,
    minutes: number,
    type: string = 'custom'
  ): Promise<{ success: boolean; reminderId?: string; message: string }> {
    try {
      const scheduledTime = new Date();
      scheduledTime.setMinutes(scheduledTime.getMinutes() + minutes);

      const title = `Recordatorio personalizado en ${minutes} minutos`;

      const { data, error } = await supabase
        .from('smart_reminders')
        .insert({
          user_id: this.userId,
          reminder_type: type,
          title,
          message,
          scheduled_for: scheduledTime.toISOString(),
          is_sent: false
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error scheduling custom reminder:', error);
        return {
          success: false,
          message: 'No pude programar el recordatorio personalizado.'
        };
      }

      this.startReminderCheck();

      return {
        success: true,
        reminderId: data.id,
        message: `✅ Recordatorio personalizado programado para ${minutes} minutos`
      };
    } catch (error) {
      console.error('Error in scheduleCustomReminder:', error);
      return {
        success: false,
        message: 'Error al programar recordatorio personalizado'
      };
    }
  }

  /**
   * Obtiene recordatorios pendientes del usuario
   */
  async getPendingReminders(): Promise<PendingReminder[]> {
    try {
      const now = new Date();
      
      const { data, error } = await supabase
        .from('smart_reminders')
        .select(`
          id,
          task_id,
          reminder_type,
          title,
          message,
          scheduled_for,
          is_sent,
          created_at,
          tasks:task_id (
            title,
            priority
          )
        `)
        .eq('user_id', this.userId)
        .eq('is_sent', false)
        .lte('scheduled_for', now.toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error getting pending reminders:', error);
        return [];
      }

      return (data || []).map(reminder => ({
        ...reminder,
        user_id: this.userId,
        scheduled_for: new Date(reminder.scheduled_for),
        created_at: reminder.created_at ? new Date(reminder.created_at) : undefined,
        task_title: reminder.tasks?.title,
        task_priority: reminder.tasks?.priority
      }));
    } catch (error) {
      console.error('Error in getPendingReminders:', error);
      return [];
    }
  }

  /**
   * Marca un recordatorio como entregado
   */
  async markAsDelivered(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .update({ is_sent: true })
        .eq('id', reminderId)
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error marking reminder as delivered:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsDelivered:', error);
      return false;
    }
  }

  /**
   * Cancela un recordatorio pendiente
   */
  async cancelReminder(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('smart_reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', this.userId)
        .eq('is_sent', false);

      if (error) {
        console.error('Error canceling reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelReminder:', error);
      return false;
    }
  }

  /**
   * Obtiene recordatorios activos del usuario
   */
  async getActiveReminders(): Promise<SmartReminder[]> {
    try {
      const { data, error } = await supabase
        .from('smart_reminders')
        .select('*')
        .eq('user_id', this.userId)
        .eq('is_sent', false)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error getting active reminders:', error);
        return [];
      }

      return (data || []).map(reminder => ({
        ...reminder,
        scheduled_for: new Date(reminder.scheduled_for),
        created_at: reminder.created_at ? new Date(reminder.created_at) : undefined
      }));
    } catch (error) {
      console.error('Error in getActiveReminders:', error);
      return [];
    }
  }

  /**
   * Inicia verificación periódica de recordatorios pendientes
   */
  startReminderCheck(): void {
    // Prevenir múltiples intervalos activos
    if (this.reminderInterval) {
      console.log('⚠️ Sistema de recordatorios ya activo, saltando inicialización');
      return;
    }

    this.reminderInterval = setInterval(async () => {
      // Prevenir ejecuciones concurrentes
      if (this.isCheckingReminders) {
        console.log('⚠️ Verificación ya en progreso, saltando ciclo');
        return;
      }

      this.isCheckingReminders = true;
      
      try {
        const pendingReminders = await this.getPendingReminders();
        
        for (const reminder of pendingReminders) {
          if (this.onReminderCallback && reminder.id) {
            // Triggear callback
            this.onReminderCallback(reminder);
            
            // Marcar como entregado
            await this.markAsDelivered(reminder.id);
          }
        }
      } catch (error) {
        console.error('Error en verificación de recordatorios:', error);
      } finally {
        this.isCheckingReminders = false;
      }
    }, 30000); // Verificar cada 30 segundos

    console.log('✅ Sistema de recordatorios iniciado (verificación cada 30s)');
  }

  /**
   * Detiene verificación periódica
   */
  stopReminderCheck(): void {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
      console.log('⏹️ Sistema de recordatorios detenido');
    }
  }

  /**
   * Configura callback para cuando se active un recordatorio
   */
  setReminderCallback(callback: (reminder: PendingReminder) => void): void {
    this.onReminderCallback = callback;
  }

  /**
   * Limpia recordatorios expirados (más de 24 horas)
   */
  async cleanExpiredReminders(): Promise<number> {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setHours(oneDayAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('smart_reminders')
        .update({ is_sent: true })
        .eq('user_id', this.userId)
        .eq('is_sent', false)
        .lt('scheduled_for', oneDayAgo.toISOString())
        .select('id');

      if (error) {
        console.error('Error cleaning expired reminders:', error);
        return 0;
      }

      const count = data?.length || 0;
      if (count > 0) {
        console.log(`🧹 ${count} recordatorios expirados limpiados`);
      }

      return count;
    } catch (error) {
      console.error('Error in cleanExpiredReminders:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de recordatorios del usuario
   */
  async getReminderStats(): Promise<{
    total: number;
    pending: number;
    delivered: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('smart_reminders')
        .select('is_sent')
        .eq('user_id', this.userId);

      if (error) {
        console.error('Error getting reminder stats:', error);
        return { total: 0, pending: 0, delivered: 0 };
      }

      const stats = {
        total: data.length,
        pending: data.filter(r => !r.is_sent).length,
        delivered: data.filter(r => r.is_sent).length,
      };

      return stats;
    } catch (error) {
      console.error('Error in getReminderStats:', error);
      return { total: 0, pending: 0, delivered: 0 };
    }
  }

  /**
   * Resetea sesión limpiando interval
   */
  resetSession(): void {
    this.stopReminderCheck();
    this.onReminderCallback = undefined;
    this.isCheckingReminders = false;
  }
}