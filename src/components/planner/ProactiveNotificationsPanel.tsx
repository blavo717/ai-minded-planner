import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  X, 
  Eye,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  Clock,
  Sparkles
} from 'lucide-react';
import { useProactiveNotifications } from '@/hooks/useProactiveNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProactiveNotificationsPanelProps {
  onClose?: () => void;
}

const ProactiveNotificationsPanel: React.FC<ProactiveNotificationsPanelProps> = ({ onClose }) => {
  const {
    notifications,
    unreadNotifications,
    highPriorityNotifications,
    isLoading,
    generateNotifications,
    isGenerating,
    markAsRead,
    dismissNotification,
    getNotificationIcon,
    getNotificationColor,
  } = useProactiveNotifications();

  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'high_priority':
        return notification.priority <= 2;
      default:
        return true;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'suggestion': return Lightbulb;
      case 'warning': return AlertTriangle;
      case 'celebration': return Sparkles;
      default: return Bell;
    }
  };

  const handleNotificationAction = (notification: any) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Handle specific actions based on notification type and action_data
    if (notification.action_data?.task_id) {
      // Navigate to task or show task details
      console.log('Navigate to task:', notification.action_data.task_id);
    } else if (notification.action_data?.type === 'preferences_suggestion') {
      // Open preferences modal
      console.log('Open preferences');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BellRing className="w-6 h-6 text-blue-600" />
            Notificaciones Inteligentes
          </h2>
          <p className="text-gray-600">
            Recordatorios y sugerencias personalizadas para maximizar tu productividad
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => generateNotifications()}
            disabled={isGenerating}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generando...' : 'Actualizar'}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} size="sm">
              <X className="w-4 h-4 mr-2" />
              Cerrar
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total notificaciones</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{unreadNotifications.length}</div>
                <div className="text-sm text-gray-600">Sin leer</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{highPriorityNotifications.length}</div>
                <div className="text-sm text-gray-600">Alta prioridad</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todas ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Sin leer ({unreadNotifications.length})
        </Button>
        <Button
          variant={filter === 'high_priority' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('high_priority')}
        >
          Prioridad alta ({highPriorityNotifications.length})
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-600 text-lg">No hay notificaciones</p>
              <p className="text-gray-500 text-sm">
                {filter === 'all' ? 'Todas las notificaciones están al día' : 
                 filter === 'unread' ? 'No tienes notificaciones sin leer' :
                 'No hay notificaciones de alta prioridad'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.notification_type);
                  const isHighPriority = notification.priority <= 2;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        getNotificationColor(notification.notification_type, notification.priority)
                      } ${!notification.is_read ? 'ring-2 ring-blue-200' : ''}`}
                      onClick={() => handleNotificationAction(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className={`p-2 rounded-lg ${
                            isHighPriority ? 'bg-red-100' : 'bg-white'
                          }`}>
                            <TypeIcon className={`w-5 h-5 ${
                              isHighPriority ? 'text-red-600' : 'text-current'
                            }`} />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm leading-tight">
                                {notification.title}
                                {!notification.is_read && (
                                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  isHighPriority ? 'border-red-300 text-red-700' : ''
                                }`}
                              >
                                {notification.notification_type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {format(new Date(notification.scheduled_for), "dd MMM 'a las' HH:mm", { locale: es })}
                            </span>
                            
                            {notification.action_data?.task_title && (
                              <Badge variant="outline" className="text-xs">
                                {notification.action_data.task_title}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProactiveNotificationsPanel;