
import React from 'react';

interface NotificationBadgeProps {
  count: number;
  hasUrgent?: boolean;
  hasHigh?: boolean;
  className?: string;
}

const NotificationBadge = ({ count, hasUrgent, hasHigh, className = '' }: NotificationBadgeProps) => {
  if (count === 0) return null;

  const getBadgeStyles = () => {
    if (hasUrgent) {
      return 'bg-red-500 text-white animate-pulse border-2 border-red-300';
    }
    if (hasHigh) {
      return 'bg-orange-500 text-white border-2 border-orange-300';
    }
    return 'bg-blue-500 text-white border-2 border-blue-300';
  };

  return (
    <div 
      className={`
        absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold
        ${getBadgeStyles()}
        ${className}
      `}
      data-testid="notification-badge"
      data-count={count}
      data-has-urgent={hasUrgent}
      data-has-high={hasHigh}
    >
      {count > 99 ? '99+' : count}
    </div>
  );
};

export default NotificationBadge;
