import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

export interface PendingReminderCount {
  count: number;
  urgentCount: number;
  lastReminder?: {
    id: string;
    title: string;
    scheduled_for: string;
  };
}

/**
 * Hook que maneja el estado del badge de recordatorios de IA
 * Consulta recordatorios pendientes cada 30 segundos y gestiona notificaciones
 */
export const useReminderBadge = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const notificationPermissionRef = useRef<string | null>(null);

  // Query para obtener recordatorios pendientes
  const { data: reminderCount, isLoading } = useQuery({
    queryKey: ['reminder-badge', user?.id],
    queryFn: async (): Promise<PendingReminderCount> => {
      if (!user?.id) return { count: 0, urgentCount: 0 };

      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('smart_reminders')
        .select('id, title, scheduled_for, reminder_type')
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Error fetching reminder count:', error);
        return { count: 0, urgentCount: 0 };
      }

      const reminders = data || [];
      const urgentReminders = reminders.filter(r => 
        r.reminder_type === 'task_reminder' || 
        r.reminder_type === 'urgent_deadline'
      );

      const result: PendingReminderCount = {
        count: reminders.length,
        urgentCount: urgentReminders.length,
        lastReminder: reminders.length > 0 ? {
          id: reminders[0].id,
          title: reminders[0].title,
          scheduled_for: reminders[0].scheduled_for
        } : undefined
      };

      return result;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Consultar cada 30 segundos
    staleTime: 20000, // Datos válidos por 20 segundos
  });

  // Solicitar permisos de notificación al montar
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          notificationPermissionRef.current = permission;
          console.log('✅ Permisos de notificación:', permission);
        } catch (error) {
          console.warn('Error solicitando permisos de notificación:', error);
        }
      } else {
        notificationPermissionRef.current = Notification.permission;
      }
    };

    requestNotificationPermission();
  }, []);

  // Detectar nuevos recordatorios y mostrar notificaciones
  useEffect(() => {
    if (!reminderCount?.lastReminder || !reminderCount.count) return;

    const lastNotifiedId = localStorage.getItem('lastNotifiedReminder');
    const currentReminderId = reminderCount.lastReminder.id;

    // Solo notificar si es un recordatorio nuevo
    if (lastNotifiedId !== currentReminderId && Notification.permission === 'granted') {
      const notification = new Notification('⏰ Recordatorio de AI Planner', {
        body: reminderCount.lastReminder.title,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'ai-reminder',
        requireInteraction: true,
        data: {
          reminderId: currentReminderId,
          action: 'open_ai_assistant'
        }
      });

      notification.onclick = () => {
        // Disparar evento custom para abrir el asistente
        window.dispatchEvent(new CustomEvent('openAIAssistant', {
          detail: { reminderId: currentReminderId }
        }));
        notification.close();
      };

      // Guardar ID del último recordatorio notificado
      localStorage.setItem('lastNotifiedReminder', currentReminderId);
      
      console.log('🔔 Notificación enviada:', reminderCount.lastReminder.title);
    }
  }, [reminderCount?.lastReminder?.id, reminderCount?.count]);

  // Función para marcar recordatorios como leídos
  const markRemindersAsRead = async () => {
    if (!user?.id || !reminderCount?.count) return;

    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('smart_reminders')
        .update({ is_sent: true })
        .eq('user_id', user.id)
        .eq('is_sent', false)
        .lte('scheduled_for', now);

      if (error) {
        console.error('Error marking reminders as read:', error);
        return;
      }

      // Invalidar query para refrescar el estado
      queryClient.invalidateQueries({ queryKey: ['reminder-badge', user.id] });
      
      console.log('✅ Recordatorios marcados como leídos');
    } catch (error) {
      console.error('Error in markRemindersAsRead:', error);
    }
  };

  // Función para refrescar manualmente
  const refreshReminders = () => {
    queryClient.invalidateQueries({ queryKey: ['reminder-badge', user?.id] });
  };

  return {
    reminderCount: reminderCount?.count || 0,
    urgentCount: reminderCount?.urgentCount || 0,
    hasReminders: (reminderCount?.count || 0) > 0,
    isLoading,
    markRemindersAsRead,
    refreshReminders,
    notificationPermission: notificationPermissionRef.current || Notification.permission,
    lastReminder: reminderCount?.lastReminder
  };
};