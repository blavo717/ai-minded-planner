
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/hooks/useTasks';

interface TaskCardHeaderProps {
  task: Task;
  isCompleted: boolean;
  onTitleClick?: () => void; // NEW: Handler for title click
}

const TaskCardHeader = ({ task, isCompleted, onTitleClick }: TaskCardHeaderProps) => {
  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTitleClick) {
      onTitleClick();
    }
  };

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
    <div className="space-y-2">
      <h3 
        className={`text-lg font-semibold leading-tight cursor-pointer hover:text-blue-600 transition-colors ${
          isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
        }`}
        onClick={handleTitleClick}
        title="Click para ver detalles completos"
      >
        {task.title}
      </h3>
      
      {task.description && (
        <p className={`text-sm leading-relaxed ${
          isCompleted ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className={`${getPriorityBadgeStyle()} text-xs font-medium`}
        >
          {getPriorityLabel()}
        </Badge>
      </div>
    </div>
  );
};

export default TaskCardHeader;
