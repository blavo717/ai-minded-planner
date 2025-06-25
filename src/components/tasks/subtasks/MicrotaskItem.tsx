
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2,
  Flag
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface MicrotaskItemProps {
  microtask: Task;
  onUpdate: (data: any) => void;
  onDelete: (id: string) => void;
}

const MicrotaskItem = ({ microtask, onUpdate, onDelete }: MicrotaskItemProps) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
      <div className="flex items-center gap-2 flex-1">
        {getStatusIcon(microtask.status)}
        <span className="text-sm">{microtask.title}</span>
        {microtask.needs_followup && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
            <Flag className="h-2 w-2 mr-1" />
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1">
        {microtask.status !== 'completed' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onUpdate({ 
              id: microtask.id, 
              status: 'completed',
              completed_at: new Date().toISOString()
            })}
            className="h-6 w-6 p-0"
          >
            <CheckCircle className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(microtask.id)}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default MicrotaskItem;
