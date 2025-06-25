
import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Tasks = () => {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { updateTask, deleteTask, isUpdatingTask, isDeletingTask } = useTaskMutations();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'in_progress':
        return 'En Progreso';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'Baja';
      case 'medium':
        return 'Media';
      case 'high':
        return 'Alta';
      case 'urgent':
        return 'Urgente';
      default:
        return priority;
    }
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name;
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask({ 
      id: taskId, 
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">
            Gestiona todas tus tareas en un solo lugar
          </p>
        </div>
        <Button onClick={() => setIsCreateTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in_progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No se encontraron tareas</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(task.status)}
                      <h3 className="text-lg font-semibold">{task.title}</h3>
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                      />
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <Badge variant="outline">
                        {getStatusText(task.status)}
                      </Badge>
                      
                      <Badge variant="outline">
                        {getPriorityText(task.priority)}
                      </Badge>
                      
                      {getProjectName(task.project_id) && (
                        <Badge variant="outline">
                          {getProjectName(task.project_id)}
                        </Badge>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.due_date), 'dd MMM yyyy', { locale: es })}
                        </div>
                      )}
                      
                      {task.estimated_duration && (
                        <span>{task.estimated_duration} min</span>
                      )}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {task.status !== 'completed' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar completada
                        </DropdownMenuItem>
                      )}
                      
                      {task.status === 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Iniciar progreso
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => console.log('Edit task', task.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projects={projects}
      />
    </div>
  );
};

export default Tasks;
