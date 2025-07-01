
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User,
  Calendar,
  PlayCircle
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskActivityProps {
  task: Task;
}

const TaskActivity = ({ task }: TaskActivityProps) => {
  const { logs, isLoading } = useTaskLogs(task.id);

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'status_change':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'comment':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'assignment':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'time_tracking':
        return <PlayCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogTitle = (log: any) => {
    switch (log.log_type) {
      case 'status_change':
        return `Estado cambiado: ${log.title}`;
      case 'comment':
        return 'Comentario añadido';
      case 'assignment':
        return 'Tarea asignada';
      case 'time_tracking':
        return `Tiempo registrado: ${log.metadata?.duration || 0} minutos`;
      default:
        return log.title || 'Actividad registrada';
    }
  };

  const formatLogTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm', { locale: es });
    } else if (diffInHours < 24 * 7) {
      return format(date, 'EEEE HH:mm', { locale: es });
    } else {
      return format(date, 'dd MMM HH:mm', { locale: es });
    }
  };

  // Crear entrada de actividad para la creación de la tarea
  const taskCreationLog = {
    id: 'creation',
    log_type: 'created',
    title: 'Tarea creada',
    content: null,
    created_at: task.created_at,
    metadata: {}
  };

  // Combinar logs reales con log de creación
  const allLogs = [taskCreationLog, ...(logs || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400 animate-spin" />
            <p className="text-gray-500">Cargando actividad...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Línea de Tiempo de Actividad
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allLogs.length > 0 ? (
            <div className="space-y-4">
              {allLogs.map((log, index) => (
                <div key={log.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200">
                      {log.log_type === 'created' ? (
                        <Calendar className="h-4 w-4 text-green-500" />
                      ) : (
                        getLogIcon(log.log_type)
                      )}
                    </div>
                    {index < allLogs.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {log.log_type === 'created' ? 'Tarea creada' : getLogTitle(log)}
                        </h4>
                        {log.content && log.log_type !== 'created' && (
                          <p className="text-sm text-gray-600 mt-1">
                            {log.content}
                          </p>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {JSON.stringify(log.metadata)}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        {formatLogTime(log.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">Sin actividad registrada</p>
              <p className="text-sm">
                La actividad aparecerá aquí cuando interactúes con la tarea
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {allLogs.length}
            </div>
            <p className="text-sm text-gray-500">Eventos Totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {allLogs.filter(log => log.log_type === 'status_change').length}
            </div>
            <p className="text-sm text-gray-500">Cambios de Estado</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allLogs.filter(log => log.log_type === 'time_tracking').length}
            </div>
            <p className="text-sm text-gray-500">Sesiones de Tiempo</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskActivity;
