import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ProactiveNotification {
  id: string;
  user_id: string;
  notification_type: 'reminder' | 'suggestion' | 'warning' | 'celebration';
  title: string;
  message: string;
  action_data: Record<string, any>;
  priority: number;
  scheduled_for: string;
  sent_at?: string;
  read_at?: string;
  dismissed_at?: string;
  is_sent: boolean;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export const useProactiveNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get pending notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['proactive-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('proactive_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as ProactiveNotification[];
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  // Generate new notifications
  const generateNotificationsMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('proactive-notifications', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proactive-notifications'] });
      
      if (data.notifications_created > 0) {
        toast.success(`${data.notifications_created} nuevas notificaciones generadas`);
      }
    },
    onError: (error) => {
      console.error('Error generating notifications:', error);
      toast.error('Error al generar notificaciones');
    }
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('proactive_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-notifications'] });
    }
  });

  // Dismiss notification
  const dismissNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase
        .from('proactive_notifications')
        .update({ 
          is_dismissed: true, 
          dismissed_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proactive-notifications'] });
    }
  });

  // Auto-generate notifications on first load
  React.useEffect(() => {
    if (user?.id && !isLoading && !generateNotificationsMutation.isPending) {
      // Generate notifications automatically
      const lastGenerated = localStorage.getItem(`last_notification_generation_${user.id}`);
      const now = Date.now();
      const lastGeneratedTime = lastGenerated ? parseInt(lastGenerated) : 0;
      const thirtyMinutes = 30 * 60 * 1000;

      if (now - lastGeneratedTime > thirtyMinutes) {
        generateNotificationsMutation.mutate();
        localStorage.setItem(`last_notification_generation_${user.id}`, now.toString());
      }
    }
  }, [user?.id, isLoading]);

  // Helper functions
  const unreadNotifications = notifications?.filter(n => !n.is_read) || [];
  const highPriorityNotifications = notifications?.filter(n => n.priority <= 2) || [];
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return '⏰';
      case 'suggestion': return '💡';
      case 'warning': return '⚠️';
      case 'celebration': return '🎉';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string, priority: number) => {
    if (priority === 1) return 'text-red-600 bg-red-50 border-red-200';
    
    switch (type) {
      case 'reminder': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'suggestion': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'celebration': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Show toast notifications for high priority items
  React.useEffect(() => {
    if (highPriorityNotifications.length > 0) {
      highPriorityNotifications.forEach(notification => {
        if (!notification.is_read && !notification.is_sent) {
          const icon = getNotificationIcon(notification.notification_type);
          
          toast(notification.title, {
            description: notification.message,
            icon,
            duration: notification.priority === 1 ? 10000 : 5000,
            action: {
              label: "Ver",
              onClick: () => markAsReadMutation.mutate(notification.id)
            }
          });
        }
      });
    }
  }, [highPriorityNotifications]);

  return {
    notifications: notifications || [],
    unreadNotifications,
    highPriorityNotifications,
    isLoading,
    generateNotifications: generateNotificationsMutation.mutate,
    isGenerating: generateNotificationsMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
    dismissNotification: dismissNotificationMutation.mutate,
    getNotificationIcon,
    getNotificationColor,
  };
};