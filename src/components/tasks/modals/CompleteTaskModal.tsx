
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface CompleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

const CompleteTaskModal = ({ isOpen, onClose, taskId, taskTitle }: CompleteTaskModalProps) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const { completeTask, isCompletingTask } = useTaskMutations();

  const handleComplete = () => {
    if (completionNotes.trim().length < 3) {
      return;
    }

    completeTask({ taskId, completionNotes: completionNotes.trim() });
    onClose();
    setCompletionNotes('');
  };

  const handleClose = () => {
    setCompletionNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Completar Tarea
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Tarea a completar:</Label>
            <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded border">
              {taskTitle}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="completion-notes" className="text-sm font-medium text-gray-700">
              Descripción de finalización *
            </Label>
            <Textarea
              id="completion-notes"
              placeholder="Describe cómo completaste esta tarea, resultados obtenidos, o cualquier información relevante..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isCompletingTask}
            />
            <p className="text-xs text-gray-500">
              Mínimo 3 caracteres. Esta información se mostrará junto al nombre de la tarea.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCompletingTask}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isCompletingTask || completionNotes.trim().length < 3}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompletingTask ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Completar Tarea
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteTaskModal;
