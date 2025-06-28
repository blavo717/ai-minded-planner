
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProactiveNotification, NotificationConfig, NotificationDeliveryResult } from '@/types/proactive-notifications';
import { ProactiveNotificationManager } from '@/utils/ai/ProactiveNotifications';
import { useInsightGeneration } from './useInsightGeneration';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useToast } from '@/hooks/use-toast';

interface UseProactiveNotificationsOptions {
  config?: Partial<NotificationConfig>;
  autoProcess?: boolean;
  deliveryInterval?: number; // ms
}

export const useProactiveNotifications = (options: UseProactiveNotificationsOptions = {}) => {
  const {
    config = {},
    autoProcess = true,
    deliveryInterval = 30000, // 30 segundos por defecto
  } = options;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { tasks } = useTasks();
  const { sessions } = useTaskSessions();
  const { insights, patternAnalysis, isGenerating } = useInsightGeneration();

  const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
  const [notificationManager] = useState(() => new ProactiveNotificationManager(config));
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessed, setLastProcessed] = useState<Date | null>(null);

  // Mutation para procesar insights y generar notificaciones
  const processInsightsMutation = useMutation({
    mutationFn: async () => {
      if (!patternAnalysis) {
        throw new Error('No pattern analysis available');
      }

      console.log('Processing insights for proactive notifications...');
      setIsProcessing(true);
      
      return await notificationManager.processInsights(
        insights,
        patternAnalysis,
        tasks,
        sessions
      );
    },
    onSuccess: (newNotifications) => {
      setNotifications(prev => {
        // Combinar con notificaciones existentes, evitando duplicados
        const existingIds = prev.map(n => n.id);
        const uniqueNew = newNotifications.filter(n => !existingIds.includes(n.id));
        return [...prev, ...uniqueNew];
      });
      
      setLastProcessed(new Date());
      setIsProcessing(false);
      
      if (newNotifications.length > 0) {
        console.log(`Generated ${newNotifications.length} proactive notifications`);
      }
    },
    onError: (error) => {
      console.error('Error processing insights for notifications:', error);
      setIsProcessing(false);
      toast({
        title: 'Error procesando notificaciones',
        description: 'No se pudieron generar notificaciones proactivas.',
        variant: 'destructive',
      });
    },
  });

  // Handler para entregar notificaciones usando toasts
  const deliveryHandler = useCallback(async (
    notification: ProactiveNotification
  ): Promise<NotificationDeliveryResult> => {
    try {
      // Determinar variante del toast según la prioridad y tipo
      let variant: 'default' | 'destructive' = 'default';
      if (notification.type === 'alert' || notification.priority === 1) {
        variant = 'destructive';
      }

      // Mostrar el toast
      toast({
        title: notification.title,
        description: notification.message,
        variant,
        duration: notification.priority === 1 ? 10000 : 5000, // Más tiempo para alta prioridad
      });

      return {
        success: true,
        notificationId: notification.id,
        deliveredAt: new Date(),
        channel: 'toast',
      };
    } catch (error) {
      return {
        success: false,
        notificationId: notification.id,
        deliveredAt: new Date(),
        channel: 'toast',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [toast]);

  // Mutation para entregar notificaciones pendientes
  const deliverNotificationsMutation = useMutation({
    mutationFn: async () => {
      return await notificationManager.deliverPendingNotifications(deliveryHandler);
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success);
      if (successful.length > 0) {
        console.log(`Delivered ${successful.length} notifications successfully`);
      }
      
      // Actualizar el estado local con las notificaciones activas
      setNotifications(notificationManager.getActiveNotifications());
    },
    onError: (error) => {
      console.error('Error delivering notifications:', error);
    },
  });

  // Auto-procesar cuando cambien los insights
  useEffect(() => {
    if (autoProcess && insights.length > 0 && patternAnalysis && !isGenerating && !isProcessing) {
      // Solo procesar si ha pasado tiempo suficiente desde la última vez
      if (!lastProcessed || Date.now() - lastProcessed.getTime() > 10 * 60 * 1000) { // 10 minutos
        processInsightsMutation.mutate();
      }
    }
  }, [insights, patternAnalysis, isGenerating, autoProcess, isProcessing, lastProcessed, processInsightsMutation]);

  // Interval para entregar notificaciones pendientes
  useEffect(() => {
    const interval = setInterval(() => {
      const pending = notificationManager.getPendingNotifications();
      if (pending.length > 0 && !deliverNotificationsMutation.isPending) {
        deliverNotificationsMutation.mutate();
      }
    }, deliveryInterval);

    return () => clearInterval(interval);
  }, [deliveryInterval, deliverNotificationsMutation]);

  // Funciones para manejar notificaciones
  const markAsRead = useCallback((notificationId: string) => {
    notificationManager.markAsRead(notificationId);
    setNotifications(notificationManager.getActiveNotifications());
  }, [notificationManager]);

  const dismissNotification = useCallback((notificationId: string) => {
    notificationManager.dismissNotification(notificationId);
    setNotifications(notificationManager.getActiveNotifications());
  }, [notificationManager]);

  const processInsights = useCallback(() => {
    processInsightsMutation.mutate();
  }, [processInsightsMutation]);

  const deliverPendingNotifications = useCallback(() => {
    deliverNotificationsMutation.mutate();
  }, [deliverNotificationsMutation]);

  const updateConfig = useCallback((newConfig: Partial<NotificationConfig>) => {
    notificationManager.updateConfig(newConfig);
    toast({
      title: 'Configuración actualizada',
      description: 'La configuración de notificaciones ha sido actualizada.',
    });
  }, [notificationManager, toast]);

  // Notificaciones filtradas por estado
  const activeNotifications = notifications.filter(n => !n.isDismissed);
  const unreadNotifications = activeNotifications.filter(n => !n.isRead);
  const criticalNotifications = activeNotifications.filter(n => n.priority === 1);
  const pendingNotifications = notificationManager.getPendingNotifications();

  return {
    // Datos
    notifications: activeNotifications,
    unreadNotifications,
    criticalNotifications,
    pendingNotifications,
    config: notificationManager.getConfig(),
    
    // Estados
    isProcessing: isProcessing || processInsightsMutation.isPending,
    isDelivering: deliverNotificationsMutation.isPending,
    lastProcessed,
    
    // Acciones
    processInsights,
    deliverPendingNotifications,
    markAsRead,
    dismissNotification,
    updateConfig,
    
    // Errores
    error: processInsightsMutation.error || deliverNotificationsMutation.error,
  };
};
