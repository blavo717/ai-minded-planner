
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Flag
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import ActivityTracker from '../ActivityTracker';

interface SubtaskItemProps {
  subtask: Task;
  microtasks: Task[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateTask: (data: any) => void;
  onDeleteTask: (id: string) => void;
  onCreateMicrotask: (title: string) => void;
  children?: React.ReactNode;
}

const SubtaskItem = ({ 
  subtask, 
  microtasks, 
  isExpanded, 
  onToggleExpanded,
  onUpdateTask,
  onDeleteTask,
  onCreateMicrotask,
  children 
}: SubtaskItemProps) => {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const completedMicrotasks = microtasks.filter(m => m.status === 'completed').length;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {getStatusIcon(subtask.status)}
          <div className="flex-1">
            <h4 className="font-medium flex items-center gap-2">
              {subtask.title}
              {subtask.needs_followup && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                  <Flag className="h-3 w-3 mr-1" />
                  Seguimiento
                </Badge>
              )}
            </h4>
            {subtask.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {subtask.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getStatusText(subtask.status)}
            </Badge>
            
            {microtasks.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {completedMicrotasks}/{microtasks.length} microtareas
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {microtasks.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          
          {subtask.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateTask({ 
                id: subtask.id, 
                status: 'completed',
                completed_at: new Date().toISOString()
              })}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(subtask.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ActivityTracker task={subtask} />

      {children}
    </div>
  );
};

export default SubtaskItem;
