
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Trash2,
  ChevronRight,
  ChevronDown,
  Flag,
  Edit,
  X,
  Check
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface CompactSubtaskItemProps {
  subtask: Task;
  microtasks: Task[];
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onUpdateTask: (data: any) => void;
  onDeleteTask: (id: string) => void;
  children?: React.ReactNode;
}

const CompactSubtaskItem = ({ 
  subtask, 
  microtasks, 
  isExpanded, 
  onToggleExpanded,
  onUpdateTask,
  onDeleteTask,
  children 
}: CompactSubtaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);

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

  const getStatusBadgeStyle = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== subtask.title) {
      onUpdateTask({ id: subtask.id, title: editTitle.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(subtask.title);
    setIsEditing(false);
  };

  const completedMicrotasks = microtasks.filter(m => m.status === 'completed').length;

  return (
    <div className="border rounded-md p-3 space-y-2 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon(subtask.status)}
          
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="h-7 w-7 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-7 w-7 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <h4 
                className="font-medium text-sm truncate cursor-pointer hover:text-blue-600"
                onDoubleClick={() => setIsEditing(true)}
                title="Doble clic para editar"
              >
                {subtask.title}
                {subtask.needs_followup && (
                  <Flag className="h-3 w-3 ml-1 inline text-orange-500" />
                )}
              </h4>
              {subtask.description && (
                <p className="text-xs text-gray-500 truncate">
                  {subtask.description}
                </p>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Badge variant="outline" className={`text-xs h-5 ${getStatusBadgeStyle(subtask.status)}`}>
              {getStatusText(subtask.status)}
            </Badge>
            
            {microtasks.length > 0 && (
              <Badge variant="outline" className="text-xs h-5 bg-purple-100 text-purple-800 border-purple-300">
                {completedMicrotasks}/{microtasks.length}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {microtasks.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleExpanded}
              className="h-6 w-6 p-0"
              title={isExpanded ? "Ocultar microtareas" : "Ver microtareas"}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6 w-6 p-0"
            title="Editar"
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          {subtask.status !== 'completed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateTask({ 
                id: subtask.id, 
                status: 'completed',
                completed_at: new Date().toISOString()
              })}
              className="h-6 w-6 p-0 text-green-600"
              title="Marcar como completada"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(subtask.id)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Renderizar children (MicrotaskList) cuando está expandida */}
      {children}
    </div>
  );
};

export default CompactSubtaskItem;
