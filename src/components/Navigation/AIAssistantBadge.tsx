import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReminderBadge } from '@/hooks/useReminderBadge';

interface AIAssistantBadgeProps {
  onClick: () => void;
}

/**
 * Componente badge del Asistente de IA con notificaciones de recordatorios
 */
export const AIAssistantBadge: React.FC<AIAssistantBadgeProps> = ({ onClick }) => {
  const { 
    reminderCount, 
    urgentCount, 
    hasReminders 
  } = useReminderBadge();

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onClick}
        className={cn(
          "transition-all duration-200",
          hasReminders 
            ? "bg-purple-100 border-purple-300 hover:bg-purple-200 dark:bg-purple-800/40 dark:border-purple-600 ring-2 ring-purple-300 dark:ring-purple-700" 
            : "bg-purple-50 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-700"
        )}
      >
        <Brain className="h-4 w-4 text-purple-600" />
        <span className="hidden sm:ml-2 sm:inline text-purple-700 dark:text-purple-300">IA</span>
      </Button>
      
      {/* Badge de Notificaciones */}
      {hasReminders && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
          <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg animate-pulse">
            {reminderCount > 99 ? '99+' : reminderCount}
          </div>
          {urgentCount > 0 && (
            <div className="absolute -top-1 -right-1">
              <Bell className="h-3 w-3 text-orange-500 animate-bounce" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistantBadge;