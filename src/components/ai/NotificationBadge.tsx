
import React from 'react';

interface NotificationBadgeProps {
  count: number;
  hasUrgent?: boolean;
  hasHigh?: boolean;
  className?: string;
}

const NotificationBadge = ({ count, hasUrgent, hasHigh, className = '' }: NotificationBadgeProps) => {
  // Debug logging
  console.log('🏷️ NotificationBadge render:', { count, hasUrgent, hasHigh });
  
  if (count === 0) {
    console.log('🏷️ NotificationBadge: count is 0, not rendering');
    return null;
  }

  const getBadgeStyles = () => {
    if (hasUrgent) {
      console.log('🏷️ NotificationBadge: using urgent styles');
      return 'bg-red-500 text-white animate-pulse border-2 border-red-300';
    }
    if (hasHigh) {
      console.log('🏷️ NotificationBadge: using high priority styles');
      return 'bg-orange-500 text-white border-2 border-orange-300';
    }
    console.log('🏷️ NotificationBadge: using default styles');
    return 'bg-blue-500 text-white border-2 border-blue-300';
  };

  const displayCount = count > 99 ? '99+' : count.toString();
  console.log('🏷️ NotificationBadge: displaying count:', displayCount);

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
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
