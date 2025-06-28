
export interface ProactiveNotification {
  id: string;
  type: 'reminder' | 'alert' | 'suggestion' | 'celebration';
  category: 'productivity' | 'task_management' | 'health' | 'achievement';
  title: string;
  message: string;
  priority: 1 | 2 | 3; // 1 = alta, 2 = media, 3 = baja
  triggerTime: Date;
  expiresAt?: Date;
  isRead: boolean;
  isDismissed: boolean;
  actions?: NotificationAction[];
  metadata: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
}

export interface NotificationAction {
  id: string;
  label: string;
  type: 'navigate' | 'execute' | 'external';
  target?: string;
  handler?: () => void;
}

export interface NotificationTrigger {
  id: string;
  type: 'pattern_based' | 'time_based' | 'event_based';
  condition: NotificationCondition;
  template: NotificationTemplate;
  isActive: boolean;
  frequency: NotificationFrequency;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface NotificationCondition {
  type: 'temporal' | 'task_state' | 'productivity' | 'pattern_match';
  parameters: Record<string, any>;
  threshold?: number;
  operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

export interface NotificationTemplate {
  title: string;
  message: string;
  category: ProactiveNotification['category'];
  priority: ProactiveNotification['priority'];
  actions?: Omit<NotificationAction, 'id'>[];
  expirationHours?: number;
}

export interface NotificationFrequency {
  type: 'once' | 'daily' | 'weekly' | 'custom';
  interval?: number; // minutos para custom
  maxPerDay?: number;
  cooldownMinutes?: number;
}

export interface NotificationConfig {
  enableProductivityReminders: boolean;
  enableTaskHealthAlerts: boolean;
  enableDeadlineWarnings: boolean;
  enableAchievementCelebrations: boolean;
  quietHoursStart?: number; // hora (0-23)
  quietHoursEnd?: number; // hora (0-23)
  maxNotificationsPerHour: number;
  priorities: {
    enableHigh: boolean;
    enableMedium: boolean;
    enableLow: boolean;
  };
}

export interface NotificationDeliveryResult {
  success: boolean;
  notificationId: string;
  deliveredAt: Date;
  channel: 'toast' | 'push' | 'email';
  error?: string;
}
