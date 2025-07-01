
import React from 'react';
import { Clock, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';
import { TaskLog } from '@/types/taskLogs';

interface LogTimelineProps {
  logs: TaskLog[];
  isLoading?: boolean;
}

const LogTimeline: React.FC<LogTimelineProps> = ({ logs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-3 p-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">No hay entradas de log aún</p>
        <p className="text-xs mt-1">Las actividades aparecerán aquí automáticamente</p>
      </div>
    );
  }

  const getLogIcon = (log: TaskLog) => {
    switch (log.log_type) {
      case 'completion':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'status_change':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'manual':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'creation':
        return <Clock className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLogTypeEmoji = (log: TaskLog) => {
    if (log.log_type === 'manual' && log.metadata?.type) {
      const type = log.metadata.type;
      const emojis = {
        'progreso': '📈',
        'bloqueo': '🚫',
        'nota': '📝',
        'milestone': '🎯'
      };
      return emojis[type] || '📝';
    }
    
    const typeEmojis = {
      'completion': '✅',
      'status_change': '🔄',
      'creation': '🆕',
      'manual': '💬'
    };
    return typeEmojis[log.log_type] || '📝';
  };

  return (
    <div className="space-y-4">
      {logs.map((log, index) => (
        <div key={log.id} className="flex gap-3 relative">
          {/* Timeline line */}
          {index < logs.length - 1 && (
            <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-200"></div>
          )}
          
          {/* Icon */}
          <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
            {getLogIcon(log)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <span>{getLogTypeEmoji(log)}</span>
                  {log.title}
                </h4>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
              
              {log.content && (
                <p className="text-sm text-gray-600 mb-2">{log.content}</p>
              )}
              
              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {log.log_type === 'status_change' && log.metadata.from && log.metadata.to && (
                    <span>Estado: {log.metadata.from} → {log.metadata.to}</span>
                  )}
                  {log.metadata.type && log.log_type === 'manual' && (
                    <span>Tipo: {log.metadata.type}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogTimeline;
