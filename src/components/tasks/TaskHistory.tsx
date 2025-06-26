
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { 
  Archive, 
  Search, 
  Calendar, 
  Clock, 
  FileText, 
  RotateCcw,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TaskHistory = () => {
  const { archivedTasks, isLoadingArchived } = useTasks();
  const { unarchiveTask } = useTaskMutations();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredTasks = archivedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.completion_notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesPriority;
  });

  const handleUnarchive = (taskId: string) => {
    unarchiveTask(taskId);
  };

  const getCompletionBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoadingArchived) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-gray-500">Cargando histórico...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Histórico de Tareas
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tareas completadas y archivadas ({archivedTasks.length} total)
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar en el histórico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {archivedTasks.length === 0 ? 'No hay tareas archivadas' : 'No se encontraron tareas'}
              </h3>
              <p className="text-gray-500">
                {archivedTasks.length === 0 
                  ? 'Las tareas completadas aparecerán aquí cuando las archives'
                  : 'Intenta ajustar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <Card key={task.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <Badge className={getCompletionBadgeColor(task.status)}>
                            {task.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </Badge>
                          <Badge variant="outline" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}

                        {task.completion_notes && (
                          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-3">
                            <div className="flex items-center gap-1 mb-1">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Notas de finalización:
                              </span>
                            </div>
                            <p className="text-sm text-green-700">{task.completion_notes}</p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {task.completed_at && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Completada: {format(new Date(task.completed_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Creada: {format(new Date(task.created_at), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchive(task.id)}
                        className="ml-4 flex items-center gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Restaurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskHistory;
