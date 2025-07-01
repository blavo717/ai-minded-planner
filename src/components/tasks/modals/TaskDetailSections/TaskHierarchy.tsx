import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  CheckCircle2, 
  Circle,
  Clock,
  Calendar
} from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskHierarchyProps {
  task: Task;
  subtasks: Task[];
  allTasks: Task[];
}

const TaskHierarchy = ({ task, subtasks, allTasks }: TaskHierarchyProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showCreateSubtask, setShowCreateSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  const { createSubtask, updateTask } = useTaskMutations();

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleCreateSubtask = () => {
    if (newSubtaskTitle.trim()) {
      createSubtask({
        parentTaskId: task.id,
        title: newSubtaskTitle.trim()
      });
      setNewSubtaskTitle('');
      setShowCreateSubtask(false);
    }
  };

  const handleToggleSubtaskComplete = (subtask: Task) => {
    const newStatus = subtask.status === 'completed' ? 'pending' : 'completed';
    updateTask({
      id: subtask.id,
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : undefined
    });
  };

  const getSubtasksForTask = (taskId: string): Task[] => {
    return allTasks.filter(t => t.parent_task_id === taskId);
  };

  const calculateProgress = (parentTask: Task): { completed: number; total: number; percentage: number } => {
    const children = getSubtasksForTask(parentTask.id);
    const completed = children.filter(t => t.status === 'completed').length;
    const total = children.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  const renderSubtask = (subtask: Task, level: number = 0) => {
    const children = getSubtasksForTask(subtask.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedTasks.has(subtask.id);
    const progress = calculateProgress(subtask);
    const isCompleted = subtask.status === 'completed';

    return (
      <div key={subtask.id} className={`ml-${level * 4}`}>
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
        } hover:shadow-sm transition-shadow`}>
          {/* Toggle expansion */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(subtask.id)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          {/* Complete checkbox */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleSubtaskComplete(subtask)}
            className="h-6 w-6 p-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400" />
            )}
          </Button>

          {/* Task info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium truncate ${
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {subtask.title}
              </h4>
              
              {subtask.priority !== 'medium' && (
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    subtask.priority === 'urgent' ? 'border-red-300 text-red-700' :
                    subtask.priority === 'high' ? 'border-orange-300 text-orange-700' :
                    'border-green-300 text-green-700'
                  }`}
                >
                  {subtask.priority === 'urgent' ? 'Urgente' :
                   subtask.priority === 'high' ? 'Alta' : 'Baja'}
                </Badge>
              )}
            </div>

            {subtask.description && (
              <p className="text-sm text-gray-500 truncate mt-1">
                {subtask.description}
              </p>
            )}

            {/* Progress bar for parent tasks */}
            {hasChildren && (
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progress.percentage} className="flex-1 h-2" />
                <span className="text-xs text-gray-500">
                  {progress.completed}/{progress.total} ({progress.percentage}%)
                </span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              {subtask.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(subtask.due_date), 'dd MMM', { locale: es })}
                </div>
              )}
              {subtask.estimated_duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {subtask.estimated_duration}min
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Render children if expanded */}
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {children.map(child => renderSubtask(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const mainProgress = calculateProgress(task);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Progreso General</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Subtareas Completadas</span>
              <span className="text-sm text-gray-500">
                {mainProgress.completed} de {mainProgress.total}
              </span>
            </div>
            <Progress value={mainProgress.percentage} className="h-3" />
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600">
                {mainProgress.percentage}%
              </span>
              <p className="text-sm text-gray-500">Completado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtasks List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Subtareas</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateSubtask(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Añadir Subtarea
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Create new subtask */}
            {showCreateSubtask && (
              <div className="flex items-center gap-2 p-3 border border-dashed border-gray-300 rounded-lg">
                <Circle className="h-5 w-5 text-gray-400" />
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Título de la nueva subtarea..."
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateSubtask();
                    if (e.key === 'Escape') setShowCreateSubtask(false);
                  }}
                />
                <Button size="sm" onClick={handleCreateSubtask}>
                  Crear
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCreateSubtask(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}

            {/* Existing subtasks */}
            {subtasks.length > 0 ? (
              <div className="space-y-2">
                {subtasks.map(subtask => renderSubtask(subtask))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Circle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">No hay subtareas</p>
                <p className="text-sm">
                  Las subtareas te ayudan a dividir el trabajo en pasos más pequeños
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskHierarchy;
