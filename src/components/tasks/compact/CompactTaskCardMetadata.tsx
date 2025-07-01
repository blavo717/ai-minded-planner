
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Flag, FolderOpen } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CompactTaskCardMetadataProps {
  task: Task;
  project?: Project;
}

const CompactTaskCardMetadata = ({ task, project }: CompactTaskCardMetadataProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  const getPriorityBadgeStyle = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  return (
    <div className="flex items-center gap-6 text-sm text-gray-500 flex-shrink-0">
      {/* Proyecto */}
      {project && (
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderOpen className="h-4 w-4 flex-shrink-0" />
          <span className="truncate max-w-32" title={project.name}>
            {project.name}
          </span>
        </div>
      )}

      {/* Asignación */}
      <div className="flex items-center gap-1.5">
        <User className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs">Sin asignar</span>
      </div>

      {/* Fecha límite - MÁS PROMINENTE */}
      {task.due_date && (
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${
          isOverdue 
            ? 'bg-red-100 text-red-700 border border-red-200' 
            : 'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium">
            {format(new Date(task.due_date), 'dd MMM', { locale: es })}
          </span>
          {isOverdue && (
            <span className="text-xs font-semibold">VENCIDA</span>
          )}
        </div>
      )}

      {/* Duración estimada */}
      {task.estimated_duration && (
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs">{task.estimated_duration}h</span>
        </div>
      )}

      {/* Prioridad - CON COLORES MÁS PROMINENTES */}
      <Badge 
        variant="outline" 
        className={`${getPriorityBadgeStyle()} font-medium border px-2 py-1`}
      >
        <Flag className="h-3 w-3 mr-1" />
        {getPriorityLabel()}
      </Badge>
    </div>
  );
};

export default CompactTaskCardMetadata;
