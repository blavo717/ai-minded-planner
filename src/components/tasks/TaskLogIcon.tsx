
import React from 'react';
import { FileText } from 'lucide-react';

interface TaskLogIconProps {
  taskId: string;
  className?: string;
  onClick?: () => void;
}

const TaskLogIcon: React.FC<TaskLogIconProps> = ({ taskId, className = '', onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-1 rounded hover:bg-gray-100 transition-colors ${className}`}
      title="Ver historial"
    >
      <FileText className="h-4 w-4 text-gray-500" />
    </button>
  );
};

export default TaskLogIcon;
