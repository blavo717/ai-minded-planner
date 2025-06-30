
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Calendar,
  FileText,
  Settings,
  CheckCircle,
  Clock,
  User,
  Activity
} from 'lucide-react';
import { useProjectLogs, ProjectLogEntry } from '@/hooks/useProjectLogs';
import { Project } from '@/hooks/useProjects';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectLogsDashboardProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectLogsDashboard = ({ project, isOpen, onClose }: ProjectLogsDashboardProps) => {
  const { logs, stats, isLoading } = useProjectLogs(project.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'project_change' | 'task_log'>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.task_info?.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || log.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const getLogIcon = (log: ProjectLogEntry) => {
    if (log.type === 'project_change') {
      return <Settings className="h-4 w-4 text-blue-600" />;
    }
    
    if (log.task_info) {
      switch (log.task_info.level) {
        case 1: return <FileText className="h-4 w-4 text-green-600" />;
        case 2: return <CheckCircle className="h-4 w-4 text-orange-600" />;
        case 3: return <Clock className="h-4 w-4 text-purple-600" />;
        default: return <Activity className="h-4 w-4 text-gray-600" />;
      }
    }
    
    return <Activity className="h-4 w-4 text-gray-600" />;
  };

  const getLogColor = (log: ProjectLogEntry) => {
    if (log.type === 'project_change') return 'bg-blue-50 border-blue-200';
    
    if (log.task_info) {
      switch (log.task_info.level) {
        case 1: return 'bg-green-50 border-green-200';
        case 2: return 'bg-orange-50 border-orange-200';
        case 3: return 'bg-purple-50 border-purple-200';
        default: return 'bg-gray-50 border-gray-200';
      }
    }
    
    return 'bg-gray-50 border-gray-200';
  };

  const getTaskLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Tarea';
      case 2: return 'Subtarea';
      case 3: return 'Microtarea';
      default: return 'Tarea';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            Dashboard de Logs - {project.name}
          </DialogTitle>
        </DialogHeader>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-blue-600">Total Logs</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.taskLogs}</div>
            <div className="text-xs text-green-600">Logs de Tareas</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.projectChanges}</div>
            <div className="text-xs text-orange-600">Cambios Proyecto</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.recentActivity}</div>
            <div className="text-xs text-purple-600">Actividad Reciente</div>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar en los logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            Todos ({stats.total})
          </Button>
          
          <Button
            variant={filterType === 'project_change' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('project_change')}
          >
            Proyecto ({stats.projectChanges})
          </Button>
          
          <Button
            variant={filterType === 'task_log' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('task_log')}
          >
            Tareas ({stats.taskLogs})
          </Button>
        </div>

        {/* Lista de logs */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">Cargando logs...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'No se encontraron logs con los filtros aplicados'
                : 'No hay logs disponibles para este proyecto'
              }
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log, index) => (
                <div key={log.id}>
                  <div className={`p-4 rounded-lg border ${getLogColor(log)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getLogIcon(log)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{log.title}</h4>
                            {log.type === 'project_change' ? (
                              <Badge variant="secondary" className="text-xs">
                                Proyecto
                              </Badge>
                            ) : log.task_info ? (
                              <Badge variant="outline" className="text-xs">
                                {getTaskLevelLabel(log.task_info.level)}
                              </Badge>
                            ) : null}
                          </div>
                          
                          {log.description && (
                            <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                          )}
                          
                          {log.task_info && (
                            <p className="text-xs text-gray-500 mb-2">
                              <strong>Tarea:</strong> {log.task_info.title}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: es })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < filteredLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectLogsDashboard;
