
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Plus, 
  MessageSquare, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { useTaskLogMutations } from '@/hooks/useTaskLogMutations';
import TaskLogEntryForm from './TaskLogEntryForm';
import LogTimeline from './logs/LogTimeline';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { logs, isLoading } = useTaskLogs(taskId);
  const { createLog, isCreatingLog } = useTaskLogMutations();

  const handleAddLog = async (logData: { type: string; description: string }) => {
    try {
      await createLog({
        task_id: taskId,
        log_type: 'manual',
        title: getLogTypeLabel(logData.type),
        content: logData.description,
        metadata: { type: logData.type }
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error al añadir log:', error);
    }
  };

  const getLogTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'progreso': 'Progreso registrado',
      'bloqueo': 'Bloqueo identificado',
      'nota': 'Nota añadida',
      'milestone': 'Milestone alcanzado'
    };
    return labels[type] || 'Entrada manual';
  };

  const filteredLogs = logs?.filter(log => {
    if (activeTab === 'all') return true;
    if (activeTab === 'manual') return log.log_type === 'manual';
    if (activeTab === 'automatic') return log.log_type !== 'manual';
    return true;
  }) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]" aria-describedby="task-log-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-blue-600" />
            Track Record - {taskTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div id="task-log-description" className="sr-only">
          Historial completo de actividad y logs para la tarea {taskTitle}
        </div>

        <div className="flex justify-between items-center border-b pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Todas ({logs?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Manuales ({logs?.filter(l => l.log_type === 'manual').length || 0})
              </TabsTrigger>
              <TabsTrigger value="automatic" className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Automáticas ({logs?.filter(l => l.log_type !== 'manual').length || 0})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            size="sm" 
            onClick={() => setShowAddForm(!showAddForm)}
            className="gap-2"
            disabled={isCreatingLog}
          >
            <Plus className="h-4 w-4" />
            Añadir Entrada
          </Button>
        </div>

        {showAddForm && (
          <div className="border-b pb-4">
            <TaskLogEntryForm
              taskId={taskId}
              onSubmit={handleAddLog}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isCreatingLog}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          <LogTimeline logs={filteredLogs} isLoading={isLoading} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskActivityLogModal;
