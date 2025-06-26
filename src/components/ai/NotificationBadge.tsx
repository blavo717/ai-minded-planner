
import React from 'react';

interface NotificationBadgeProps {
  count: number;
  hasUrgent?: boolean;
  hasHigh?: boolean;
  className?: string;
}

const NotificationBadge = ({ count, hasUrgent, hasHigh, className = '' }: NotificationBadgeProps) => {
  // CORRECCIÓN 5: Debugging optimizado
  console.log('🏷️ NotificationBadge render (CORRECTED):', { 
    count, 
    hasUrgent, 
    hasHigh,
    key: `${count}-${hasUrgent}-${hasHigh}`
  });
  
  if (count === 0) {
    console.log('🏷️ NotificationBadge: count is 0, not rendering');
    return null;
  }

  const getBadgeStyles = () => {
    if (hasUrgent) {
      console.log('🏷️ NotificationBadge: using urgent styles (red + animation)');
      return 'bg-red-500 text-white animate-pulse border-2 border-red-300 shadow-lg shadow-red-200';
    }
    if (hasHigh) {
      console.log('🏷️ NotificationBadge: using high priority styles (orange)');
      return 'bg-orange-500 text-white border-2 border-orange-300 shadow-lg shadow-orange-200';
    }
    console.log('🏷️ NotificationBadge: using default styles (blue)');
    return 'bg-blue-500 text-white border-2 border-blue-300 shadow-lg shadow-blue-200';
  };

  const displayCount = count > 99 ? '99+' : count.toString();
  console.log('🏷️ NotificationBadge: displaying count:', displayCount);

  // CORRECCIÓN 4: Clave ESTABLE sin Date.now()
  const stableKey = `badge-${count}-${hasUrgent ? 'urgent' : ''}-${hasHigh ? 'high' : ''}`;
  
  return (
    <div 
      key={stableKey}
      className={`
        absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold
        transition-all duration-200 transform hover:scale-110
        ${getBadgeStyles()}
        ${className}
      `}
      data-testid="notification-badge"
      data-count={count}
      data-has-urgent={hasUrgent}
      data-has-high={hasHigh}
      data-stable-key={stableKey}
    >
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
