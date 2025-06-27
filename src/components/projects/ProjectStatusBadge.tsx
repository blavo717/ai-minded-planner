
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Archive, Pause, Play } from 'lucide-react';

interface ProjectStatusBadgeProps {
  status: 'active' | 'completed' | 'archived' | 'on_hold';
  size?: 'sm' | 'default';
}

const statusConfig = {
  active: {
    label: 'Activo',
    icon: Play,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  completed: {
    label: 'Completado',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  on_hold: {
    label: 'En pausa',
    icon: Pause,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
  archived: {
    label: 'Archivado',
    icon: Archive,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
};

const ProjectStatusBadge = ({ status, size = 'default' }: ProjectStatusBadgeProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <Badge
      variant="outline"
      className={`${config.className} ${size === 'sm' ? 'text-xs px-2 py-1' : ''}`}
    >
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
      {config.label}
    </Badge>
  );
};

export default ProjectStatusBadge;
