
import React from 'react';
import { FileText } from 'lucide-react';
import { useTaskLogs } from '@/hooks/useTaskLogs';

interface TaskLogIconProps {
  taskId: string;
  className?: string;
  onClick?: () => void;
}

const TaskLogIcon: React.FC<TaskLogIconProps> = ({ taskId, className = '', onClick }) => {
  const { logs } = useTaskLogs(taskId);
  const logCount = logs?.length || 0;
  
  // Determinar el color del badge según el tipo de logs más recientes
  const hasRecentBlocks = logs?.some(log => 
    log.log_type === 'manual' && 
    log.metadata?.type === 'bloqueo' &&
    new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24h
  );

  const badgeColor = hasRecentBlocks ? 'bg-red-500' : logCount > 0 ? 'bg-blue-500' : 'bg-gray-400';

  return (
    <button
      onClick={onClick}
      className={`relative p-1 rounded hover:bg-gray-100 transition-colors ${className}`}
      title={`Ver historial (${logCount} entradas)`}
      aria-label={`Ver historial de actividad para la tarea ${taskId}`}
    >
      <FileText className="h-4 w-4 text-gray-500" />
      {logCount > 0 && (
        <span className={`absolute -top-1 -right-1 ${badgeColor} text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium`}>
          {logCount > 9 ? '9+' : logCount}
        </span>
      )}
    </button>
  );
};

export default TaskLogIcon;
