
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TaskActivityLogModalProps {
  taskId: string;
  taskTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const TaskActivityLogModal: React.FC<TaskActivityLogModalProps> = ({ 
  taskId, 
  taskTitle, 
  isOpen, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" aria-describedby="task-log-description">
        <DialogHeader>
          <DialogTitle>Historial - {taskTitle}</DialogTitle>
        </DialogHeader>
        <div id="task-log-description" className="sr-only">
          Modal para mostrar el historial de actividad de la tarea {taskTitle}
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">
            Historial de actividad para la tarea: {taskTitle}
          </p>
          {/* Contenido temporal - implementar después */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskActivityLogModal;
