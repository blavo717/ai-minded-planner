
import React, { useState } from 'react';
import { useTasks, Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Timer,
  LayoutGrid,
  List,
  Settings2
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
import EditTaskModal from '@/components/tasks/EditTaskModal';
import SubtaskList from '@/components/tasks/SubtaskList';
import TaskDependencies from '@/components/tasks/TaskDependencies';
import ManageDependenciesModal from '@/components/tasks/ManageDependenciesModal';
import KanbanBoard from '@/components/tasks/KanbanBoard';
import AdvancedFilters from '@/components/tasks/AdvancedFilters';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Tasks = () => {
  const { mainTasks, getSubtasksForTask } = useTasks();
  const { projects } = useProjects();
  const { updateTask, deleteTask, createTask } = useTaskMutations();
  
  // Modal states
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDependenciesModalOpen, setIsDependenciesModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dependenciesTask, setDependenciesTask] = useState<Task | null>(null);
  
  // View states
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showInsights, setShowInsights] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: [] as string[],
    priority: [] as string[],
    projects: [] as string[],
    tags: [] as string[],
    dueDateFrom: undefined as Date | undefined,
    dueDateTo: undefined as Date | undefined,
    hasSubtasks: undefined as boolean | undefined,
    hasDependencies: undefined as boolean | undefined,
  });

  // Get available tags from all tasks
  const availableTags = Array.from(
    new Set(
      mainTasks
        .filter(task => task.tags)
        .flatMap(task => task.tags || [])
    )
  );

  // Filter tasks based on advanced filters
  const filteredTasks = mainTasks.filter((task) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Project filter
    if (filters.projects.length > 0) {
      if (!task.project_id || !filters.projects.includes(task.project_id)) {
        return false;
      }
    }

    // Tags filter
    if (filters.tags.length > 0) {
      if (!task.tags || !filters.tags.some(tag => task.tags?.includes(tag))) {
        return false;
      }
    }

    // Date range filter
    if (filters.dueDateFrom && task.due_date) {
      if (new Date(task.due_date) < filters.dueDateFrom) {
        return false;
      }
    }
    if (filters.dueDateTo && task.due_date) {
      if (new Date(task.due_date) > filters.dueDateTo) {
        return false;
      }
    }

    // Subtasks filter
    if (filters.hasSubtasks !== undefined) {
      const hasSubtasks = getSubtasksForTask(task.id).length > 0;
      if (filters.hasSubtasks !== hasSubtasks) {
        return false;
      }
    }

    return true;
  });

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleManageDependencies = (task: Task) => {
    setDependenciesTask(task);
    setIsDependenciesModalOpen(true);
  };

  const handleCreateSubtask = (parentTaskId: string, title: string) => {
    createTask({
      title,
      parent_task_id: parentTaskId,
      status: 'pending',
      priority: 'medium'
    });
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask({ 
      id: taskId, 
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined
    });
  };

  // Utility functions
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

  const getProjectColor = (projectId?: string) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.color;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600">
            Gestiona todas tus tareas en un solo lugar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInsights(!showInsights)}
          >
            <Settings2 className="h-4 w-4 mr-2" />
            {showInsights ? 'Ocultar' : 'Mostrar'} Insights
          </Button>
          <Button onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* AI Insights Panel */}
      {showInsights && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductivityInsights />
          </div>
          <div>
            <ProductivityTimer />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      <AdvancedFilters
        projects={projects}
        availableTags={availableTags}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Kanban
          </Button>
        </div>
        
        <Badge variant="outline">
          {filteredTasks.length} tareas
        </Badge>
      </div>

      {/* Tasks Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          getSubtasksForTask={getSubtasksForTask}
          onEditTask={handleEditTask}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No se encontraron tareas</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => {
              const subtasks = getSubtasksForTask(task.id);
              const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;
              
              return (
                <div key={task.id} className="space-y-3">
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          {/* Task title and priority */}
                          <div className="flex items-center gap-3">
                            {getStatusIcon(task.status)}
                            <h3 className="text-lg font-semibold">{task.title}</h3>
                            <div
                              className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
                            />
                            {subtasks.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {completedSubtasks}/{subtasks.length} subtareas
                              </Badge>
                            )}
                          </div>
                          
                          {/* Task description */}
                          {task.description && (
                            <p className="text-gray-600">{task.description}</p>
                          )}
                          
                          {/* Task metadata */}
                          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline">
                              {getStatusText(task.status)}
                            </Badge>
                            
                            <Badge variant="outline">
                              {getPriorityText(task.priority)}
                            </Badge>
                            
                            {getProjectName(task.project_id) && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: getProjectColor(task.project_id) || '#3B82F6' }}
                                />
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
                              <div className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {task.estimated_duration} min
                                {task.actual_duration && (
                                  <span className="text-xs">
                                    (real: {task.actual_duration} min)
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions dropdown */}
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
                            
                            <DropdownMenuItem onClick={() => handleEditTask(task)}>
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

                    {/* Task Dependencies */}
                    <TaskDependencies 
                      taskId={task.id}
                      onManageDependencies={() => handleManageDependencies(task)}
                    />
                  </Card>

                  {/* Subtasks */}
                  {subtasks.length > 0 && (
                    <div className="ml-6">
                      <SubtaskList
                        parentTask={task}
                        subtasks={subtasks}
                        onCreateSubtask={(title) => handleCreateSubtask(task.id, title)}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projects={projects}
      />

      {editingTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTask(null);
          }}
          task={editingTask}
          projects={projects}
        />
      )}

      {dependenciesTask && (
        <ManageDependenciesModal
          isOpen={isDependenciesModalOpen}
          onClose={() => {
            setIsDependenciesModalOpen(false);
            setDependenciesTask(null);
          }}
          taskId={dependenciesTask.id}
          taskTitle={dependenciesTask.title}
        />
      )}
    </div>
  );
};

export default Tasks;
