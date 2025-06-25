
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivitySummaryProps {
  task: Task;
}

const ActivitySummary = ({ task }: ActivitySummaryProps) => {
  const getLastActivityText = () => {
    const lastWorked = task.last_worked_at ? new Date(task.last_worked_at) : null;
    const lastCommunication = task.last_communication_at ? new Date(task.last_communication_at) : null;
    
    if (!lastWorked && !lastCommunication) {
      return <span className="text-gray-500">Sin actividad registrada</span>;
    }

    const mostRecent = lastWorked && lastCommunication 
      ? (lastWorked > lastCommunication ? lastWorked : lastCommunication)
      : (lastWorked || lastCommunication);

    if (!mostRecent) return null;

    const isRecent = mostRecent > new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return (
      <span className={isRecent ? "text-green-600" : "text-yellow-600"}>
        {formatDistanceToNow(mostRecent, { addSuffix: true, locale: es })}
      </span>
    );
  };

  const showFollowupWarning = () => {
    if (!task.last_communication_at) return false;
    const daysSince = (Date.now() - new Date(task.last_communication_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 3 && !task.needs_followup;
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {getLastActivityText()}
      </div>
      
      {showFollowupWarning() && (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Requiere seguimiento
        </Badge>
      )}
    </div>
  );
};

export default ActivitySummary;
