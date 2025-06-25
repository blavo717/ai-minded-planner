
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useProjects } from '@/hooks/useProjects';
import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { useProfiles } from '@/hooks/useProfiles';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Tag,
  Timer,
  UserPlus,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskDependencies from './TaskDependencies';
import SubtaskList from './SubtaskList';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  subtasks: Task[];
  onEditTask: (task: Task) => void;
  onManageDependencies: (task: Task) => void;
  onAssignTask: (task: Task) => void;
  onCreateSubtask: (parentTaskId: string, title: string) => void;
}

const TaskCard = ({ 
  task, 
  subtasks, 
  onEditTask, 
  onManageDependencies,
  onAssignTask,
  onCreateSubtask 
}: TaskCardProps) => {
  const { updateTask, deleteTask } = useTaskMutations();
  const { projects } = useProjects();
  const { taskAssignments } = useTaskAssignments();
  const { profiles } = useProfiles();

  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;

  // Get assignments for this task
  const taskAssignmentsForTask = taskAssignments.filter(assignment => assignment.task_id === task.id);

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

  const getAssignedUserName = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    return profile?.full_name || profile?.email || 'Usuario';
  };

  const getAssignedUserInitials = (userId: string) => {
    const profile = profiles.find(p => p.id === userId);
    const name = profile?.full_name || profile?.email || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    updateTask({ 
      id: taskId, 
      status,
      completed_at: status === 'completed' ? new Date().toISOString() : undefined
    });
  };

  return (
    <div className="space-y-3">
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
                {taskAssignmentsForTask.length > 0 && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {taskAssignmentsForTask.length} asignada{taskAssignmentsForTask.length > 1 ? 's' : ''}
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

              {/* Assigned users */}
              {taskAssignmentsForTask.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Asignado a:</span>
                  <div className="flex -space-x-2">
                    {taskAssignmentsForTask.slice(0, 3).map((assignment) => (
                      <Avatar key={assignment.id} className="h-6 w-6 border-2 border-white">
                        <AvatarFallback className="text-xs">
                          {getAssignedUserInitials(assignment.assigned_to)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {taskAssignmentsForTask.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          +{taskAssignmentsForTask.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {taskAssignmentsForTask.slice(0, 2).map((assignment, index) => (
                      <span key={assignment.id}>
                        {getAssignedUserName(assignment.assigned_to)}
                        {index < Math.min(taskAssignmentsForTask.length, 2) - 1 && ', '}
                      </span>
                    ))}
                    {taskAssignmentsForTask.length > 2 && (
                      <span> y {taskAssignmentsForTask.length - 2} más</span>
                    )}
                  </div>
                </div>
              )}

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
                
                <DropdownMenuItem onClick={() => onEditTask(task)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onAssignTask(task)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Asignar
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

          {/* Subtasks - Now always showing the SubtaskList component */}
          <div className="mt-4">
            <SubtaskList
              parentTask={task}
              subtasks={subtasks}
              onCreateSubtask={(title) => onCreateSubtask(task.id, title)}
            />
          </div>
        </CardContent>

        {/* Task Dependencies */}
        <TaskDependencies 
          taskId={task.id}
          onManageDependencies={() => onManageDependencies(task)}
        />
      </Card>
    </div>
  );
};

export default TaskCard;
