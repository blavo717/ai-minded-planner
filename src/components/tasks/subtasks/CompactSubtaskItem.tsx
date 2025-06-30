
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
  Check,
  Timer,
  Plus
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
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
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

  // Calcular tiempo de actividad de manera simple
  const getActivityTime = () => {
    if (subtask.completed_at && subtask.created_at) {
      const completed = new Date(subtask.completed_at).getTime();
      const created = new Date(subtask.created_at).getTime();
      const hours = Math.round((completed - created) / (1000 * 60 * 60));
      return hours > 0 ? `${hours}h` : '<1h';
    }
    return null;
  };

  return (
    <div className="border rounded-md px-3 py-2 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon(subtask.status)}
          
          {isEditing ? (
            <div className="flex items-center gap-1 flex-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-6 text-xs"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button
                size="sm"
                onClick={handleSaveEdit}
                className="h-6 w-6 p-0"
              >
                <Check className="h-2 w-2" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span 
                className="text-xs font-medium truncate cursor-pointer hover:text-blue-600"
                onDoubleClick={() => setIsEditing(true)}
                title="Doble clic para editar"
              >
                {subtask.title}
                {subtask.needs_followup && (
                  <Flag className="h-2 w-2 ml-1 inline text-orange-500" />
                )}
              </span>
              
              {/* Información de actividad inline */}
              <div className="flex items-center gap-1 text-xs text-gray-500">
                {getActivityTime() && (
                  <div className="flex items-center gap-1">
                    <Timer className="h-2 w-2" />
                    <span>{getActivityTime()}</span>
                  </div>
                )}
                {subtask.description && (
                  <span className="text-gray-400" title={subtask.description}>
                    📝
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Badge variant="outline" className={`text-xs h-4 px-1 ${getStatusBadgeStyle(subtask.status)}`}>
            {getStatusText(subtask.status)}
          </Badge>
          
          {/* Mejorar indicador de microtareas */}
          {microtasks.length > 0 ? (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs h-4 px-1 bg-purple-100 text-purple-800 border-purple-300">
                {completedMicrotasks}/{microtasks.length} µ
              </Badge>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleExpanded}
                className="h-5 w-5 p-0 text-purple-600 hover:text-purple-700"
                title={isExpanded ? "Ocultar microtareas" : "Ver microtareas"}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleExpanded}
              className="h-5 w-5 p-0 text-purple-400 hover:text-purple-600"
              title="Añadir microtareas"
            >
              <Plus className="h-2 w-2" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-5 w-5 p-0 opacity-60 hover:opacity-100 text-blue-600"
            title="Editar"
          >
            <Edit className="h-2 w-2" />
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
              className="h-5 w-5 p-0 text-green-600 opacity-60 hover:opacity-100"
              title="Marcar como completada"
            >
              <CheckCircle className="h-2 w-2" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(subtask.id)}
            className="h-5 w-5 p-0 text-red-600 hover:text-red-700 opacity-60 hover:opacity-100"
            title="Eliminar"
          >
            <Trash2 className="h-2 w-2" />
          </Button>
        </div>
      </div>

      {/* Renderizar children (MicrotaskList) cuando está expandida */}
      {children}
    </div>
  );
};

export default CompactSubtaskItem;
