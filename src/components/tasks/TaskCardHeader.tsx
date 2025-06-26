
import React from 'react';
import { CheckCircle, FileText } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface TaskCardHeaderProps {
  task: Task;
  isCompleted: boolean;
}

const TaskCardHeader = ({ task, isCompleted }: TaskCardHeaderProps) => {
  return (
    <div className="flex-1 min-w-0">
      <h3 className={`font-semibold text-lg truncate ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>
        {task.title}
        {isCompleted && <CheckCircle className="inline-block h-4 w-4 ml-2 text-green-600" />}
      </h3>
      {task.description && (
        <p className={`text-sm mt-1 line-clamp-2 ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
          {task.description}
        </p>
      )}
      {task.completion_notes && (
        <div className="mt-2 p-2 bg-green-100 rounded-md border border-green-200">
          <div className="flex items-center gap-1 mb-1">
            <FileText className="h-3 w-3 text-green-600" />
            <span className="text-xs font-medium text-green-800">Notas de finalización:</span>
          </div>
          <p className="text-sm text-green-700">{task.completion_notes}</p>
        </div>
      )}
    </div>
  );
};

export default TaskCardHeader;
