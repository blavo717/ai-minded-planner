
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  count: number;
  hasUrgent?: boolean;
  hasHigh?: boolean;
  className?: string;
}

const NotificationBadge = ({ count, hasUrgent, hasHigh, className = '' }: NotificationBadgeProps) => {
  if (count === 0) return null;

  const getBadgeColor = () => {
    if (hasUrgent) return 'bg-red-500 text-white';
    if (hasHigh) return 'bg-orange-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const getBadgeAnimation = () => {
    if (hasUrgent) return 'animate-pulse';
    return '';
  };

  return (
    <Badge 
      className={`
        absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-bold
        ${getBadgeColor()}
        ${getBadgeAnimation()}
        ${className}
      `}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};

export default NotificationBadge;
