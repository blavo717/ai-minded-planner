
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historial - {taskTitle}</DialogTitle>
        </DialogHeader>
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
