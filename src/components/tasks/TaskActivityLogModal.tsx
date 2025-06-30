
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Clock, 
  Plus, 
  CheckCircle, 
  MessageSquare, 
  AlertTriangle,
  Target,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { useTaskLogMutations } from '@/hooks/useTaskLogMutations';
import { groupLogsByDate, formatLogDate } from '@/utils/logUtils';
import TaskLogEntryForm from './TaskLogEntryForm';
import { TaskLog } from '@/types/taskLogs';

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

  // ✅ CORRECCIÓN: Manejar evento correctamente sin doble click
  const handleAddLog = async (logData: { type: string; description: string }) => {
    try {
      await createLog({
        task_id: taskId,
        log_type: 'manual',
        title: getLogTypeLabel(logData.type),
        content: logData.description,
        metadata: { type: logData.type }
      });
      // ✅ Solo cerrar DESPUÉS de éxito
      setShowAddForm(false);
    } catch (error) {
      console.error('Error al añadir log:', error);
      // No cerrar formulario si hay error
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

  const groupedLogs = groupLogsByDate(filteredLogs);

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

        {/* Formulario para añadir entrada */}
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

        {/* Timeline de logs */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No hay entradas de log</p>
              <p className="text-sm">Añade la primera entrada para comenzar el seguimiento</p>
            </div>
          ) : (
            Object.entries(groupedLogs).map(([date, dayLogs]) => (
              <div key={date} className="relative">
                {/* Línea temporal */}
                <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                
                <h4 className="text-sm font-semibold text-gray-700 mb-4 bg-white px-2">
                  {formatLogDate(date)}
                </h4>
                
                <div className="space-y-3">
                  {dayLogs.map((log, index) => (
                    <LogEntry key={log.id} log={log} isLast={index === dayLogs.length - 1} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ✅ CORRECCIÓN: LogEntry mejorado con UX directa
interface LogEntryProps {
  log: TaskLog;
  isLast: boolean;
}

const LogEntry: React.FC<LogEntryProps> = ({ log, isLast }) => {
  const getLogIcon = () => {
    const metadata = log.metadata as Record<string, any> || {};
    const type = metadata.type || log.log_type;
    
    switch (type) {
      case 'progreso':
        return <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-2 w-2 text-white" />
        </div>;
      case 'bloqueo':
        return <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-2 w-2 text-white" />
        </div>;
      case 'milestone':
        return <div className="w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
          <Target className="h-2 w-2 text-white" />
        </div>;
      case 'status_change':
        return <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
          <RefreshCw className="h-2 w-2 text-white" />
        </div>;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
          <MessageSquare className="h-2 w-2 text-white" />
        </div>;
    }
  };

  const getLogTypeIcon = () => {
    const metadata = log.metadata as Record<string, any> || {};
    const type = metadata.type || log.log_type;
    
    const icons: Record<string, string> = {
      'progreso': '📈',
      'bloqueo': '🚫', 
      'nota': '📝',
      'milestone': '🎯',
      'status_change': '🔄',
      'creation': '✨',
      'completion': '✅',
      'manual': '💬'
    };
    return icons[type] || '📝';
  };

  const getBorderColor = () => {
    const metadata = log.metadata as Record<string, any> || {};
    const type = metadata.type || log.log_type;
    
    switch (type) {
      case 'progreso': return 'border-l-green-500';
      case 'bloqueo': return 'border-l-red-500';
      case 'milestone': return 'border-l-purple-500';
      case 'status_change': return 'border-l-blue-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="relative flex gap-4 pb-4">
      {/* Icono en la línea temporal */}
      <div className="relative z-10 mt-1.5">
        {getLogIcon()}
      </div>
      
      {/* Contenido */}
      <div className={`flex-1 border-l-4 ${getBorderColor()} pl-4 pb-2`}>
        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          {/* ✅ DESCRIPCIÓN COMO TÍTULO PRINCIPAL */}
          <p className="font-medium text-gray-900 mb-1">
            {getLogTypeIcon()} {log.content || log.title}
          </p>
          
          {/* ✅ METADATA COMO SUBTÍTULO */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{new Date(log.created_at).toLocaleString('es-ES', { 
              weekday: 'short',
              day: '2-digit', 
              month: '2-digit',
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
            {log.log_type === 'status_change' && log.metadata && (
              <span>• Estado: {(log.metadata as any).from} → {(log.metadata as any).to}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskActivityLogModal;
