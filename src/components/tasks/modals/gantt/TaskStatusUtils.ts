import { CheckCircle2, PlayCircle, PauseCircle, X } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

export interface StatusConfig {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  label: string;
}

export interface PriorityConfig {
  color: string;
  bgColor: string;
  label: string;
}

export const getStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case 'completed': 
      return {
        icon: CheckCircle2,
        color: 'text-status-completed',
        bgColor: 'bg-status-completed-bg',
        label: 'Completado'
      };
    case 'in_progress': 
      return {
        icon: PlayCircle,
        color: 'text-status-in-progress',
        bgColor: 'bg-status-in-progress-bg',
        label: 'En Progreso'
      };
    case 'cancelled': 
      return {
        icon: X,
        color: 'text-status-cancelled',
        bgColor: 'bg-status-cancelled-bg',
        label: 'Cancelado'
      };
    default: 
      return {
        icon: PauseCircle,
        color: 'text-status-pending-fg',
        bgColor: 'bg-status-pending-bg',
        label: 'Pendiente'
      };
  }
};

export const getPriorityConfig = (priority: string): PriorityConfig => {
  switch (priority) {
    case 'urgent': return { color: 'text-priority-urgent', bgColor: 'bg-priority-urgent', label: 'Urgente' };
    case 'high': return { color: 'text-priority-high', bgColor: 'bg-priority-high', label: 'Alta' };
    case 'medium': return { color: 'text-priority-medium', bgColor: 'bg-priority-medium', label: 'Media' };
    case 'low': return { color: 'text-priority-low', bgColor: 'bg-priority-low', label: 'Baja' };
    default: return { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Sin prioridad' };
  }
};

export const calculateProgress = (taskItem: Task): number => {
  if (taskItem.status === 'completed') return 100;
  if (taskItem.status === 'in_progress') return 50;
  return 0;
};

export const getProgressBarColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'in_progress': return 'bg-blue-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-300';
  }
};

export const getLogIcon = (logType: string): string => {
  switch (logType) {
    case 'created': return '⭐';
    case 'status_change': return '📈';
    case 'comment': return '💬';
    case 'communication': return '📞';
    case 'time_tracking': return '⏱️';
    default: return '📝';
  }
};