
import React from 'react';
import { Label } from '@/components/ui/label';
import { Task } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, 
  Mail, 
  Phone, 
  MessageCircle, 
  Users, 
  Video, 
  Calendar
} from 'lucide-react';

interface ActivityHistoryProps {
  task: Task;
}

const ActivityHistory = ({ task }: ActivityHistoryProps) => {
  const getActivityIcon = (type?: string) => {
    const communicationTypes = [
      { value: 'email', icon: Mail },
      { value: 'phone', icon: Phone },
      { value: 'whatsapp', icon: MessageCircle },
      { value: 'meeting', icon: Users },
      { value: 'video_call', icon: Video },
      { value: 'chat', icon: MessageCircle },
      { value: 'in_person', icon: Users },
      { value: 'other', icon: Calendar },
    ];
    
    const typeConfig = communicationTypes.find(t => t.value === type);
    if (!typeConfig) return <Clock className="h-4 w-4" />;
    const Icon = typeConfig.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {task.last_worked_at && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">Trabajado:</span>
            <span>{format(new Date(task.last_worked_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
          </div>
        )}
        
        {task.last_communication_at && (
          <div className="flex items-center gap-2">
            {getActivityIcon(task.communication_type)}
            <span className="text-gray-600">Comunicación:</span>
            <span>{format(new Date(task.last_communication_at), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
          </div>
        )}
      </div>

      {task.communication_notes && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <Label className="text-sm font-medium">Notas de comunicación:</Label>
          <p className="text-sm text-gray-700 mt-1">{task.communication_notes}</p>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;
