
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Edit, Plus, Clock, Star, TrendingUp, MessageCircle, AlertTriangle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskGanttModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projects: Project[];
  onNavigateToPrevious?: () => void;
  onNavigateToNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const TaskGanttModal = ({
  isOpen,
  onClose,
  task,
  projects,
  onNavigateToPrevious,
  onNavigateToNext,
  hasPrevious = false,
  hasNext = false
}: TaskGanttModalProps) => {
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingNextStep, setEditingNextStep] = useState<string | null>(null);
  const [newNextStep, setNewNextStep] = useState('');

  const { logs } = useTaskLogs(task.id);
  const { getSubtasksForTask, getMicrotasksForSubtask } = useTasks();
  const { updateTask } = useTaskMutations();

  const subtasks = getSubtasksForTask(task.id);
  const project = projects.find(p => p.id === task.project_id);

  const getStatusIcon = (status: string, priority: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return priority === 'urgent' ? '🔥' : '🔄';
      case 'cancelled': return '❌';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in_progress': return 'En Progreso';
      case 'cancelled': return 'Cancelado';
      case 'pending': return 'Pendiente';
      default: return 'Sin estado';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin prioridad';
    }
  };

  const calculateProgress = (taskItem: Task): number => {
    if (taskItem.status === 'completed') return 100;
    if (taskItem.status === 'in_progress') return 50;
    return 0;
  };

  const getLogIcon = (logType: string) => {
    switch (logType) {
      case 'created': return '⭐';
      case 'status_change': return '📈';
      case 'comment': return '💬';
      case 'communication': return '📞';
      case 'time_tracking': return '⏱️';
      default: return '📝';
    }
  };

  const formatLogTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'dd MMM HH:mm', { locale: es });
  };

  const handleTitleEdit = (taskId: string, newTitle: string) => {
    if (newTitle.trim()) {
      updateTask({ id: taskId, title: newTitle.trim() });
    }
    setEditingTitle(null);
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const renderTaskSection = (taskItem: Task, level: number = 0) => {
    const taskLogs = logs.filter(log => log.task_id === taskItem.id);
    const microtasks = level === 1 ? getMicrotasksForSubtask(taskItem.id) : [];
    const progress = calculateProgress(taskItem);
    const isMainTask = level === 0;
    const indentClass = level === 0 ? '' : level === 1 ? 'ml-6' : 'ml-12';

    return (
      <div key={taskItem.id} className={`${indentClass} mb-6`}>
        {/* Task Header */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{getStatusIcon(taskItem.status, taskItem.priority)}</span>
          {editingTitle === taskItem.id ? (
            <Input
              value={newNextStep}
              onChange={(e) => setNewNextStep(e.target.value)}
              onBlur={() => handleTitleEdit(taskItem.id, newNextStep)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleEdit(taskItem.id, newNextStep);
                if (e.key === 'Escape') setEditingTitle(null);
              }}
              className="flex-1 font-bold text-lg"
              autoFocus
            />
          ) : (
            <h3 
              className={`flex-1 font-bold cursor-pointer hover:text-blue-600 transition-colors ${
                isMainTask ? 'text-xl' : 'text-lg'
              }`}
              onClick={() => {
                setEditingTitle(taskItem.id);
                setNewNextStep(taskItem.title);
              }}
            >
              {taskItem.title}
            </h3>
          )}
          <Badge variant="outline" className="text-xs">
            {getStatusLabel(taskItem.status)} - {getPriorityLabel(taskItem.priority)}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${getProgressBarColor(taskItem.status)}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{progress}%</span>
          </div>
        </div>

        {/* Activity Timeline */}
        {taskLogs.length > 0 && (
          <div className="ml-4 border-l-2 border-gray-200 pl-4 mb-4">
            {taskLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="flex items-start gap-3 mb-2 text-sm">
                <span className="text-lg">{getLogIcon(log.log_type)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500 text-xs">
                      {formatLogTime(log.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1">{log.title}</p>
                  {log.content && (
                    <p className="text-gray-600 text-xs mt-1">{log.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Next Step Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">PRÓXIMO:</span>
            {editingNextStep === taskItem.id ? (
              <div className="flex-1 flex items-center gap-2">
                <Input
                  value={newNextStep}
                  onChange={(e) => setNewNextStep(e.target.value)}
                  placeholder="Describe el próximo paso..."
                  className="flex-1 h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Aquí podrías crear un log o actualizar la tarea
                      setEditingNextStep(null);
                      setNewNextStep('');
                    }
                    if (e.key === 'Escape') {
                      setEditingNextStep(null);
                      setNewNextStep('');
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" className="h-8">Guardar</Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-blue-700">
                  {taskItem.status === 'completed' 
                    ? '¡Tarea completada!' 
                    : taskItem.status === 'pending'
                    ? 'Iniciar trabajo en esta tarea'
                    : 'Continuar con el progreso actual'
                  }
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingNextStep(taskItem.id);
                    setNewNextStep('');
                  }}
                  className="h-8 text-blue-600"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Render Microtasks if this is a subtask */}
        {microtasks.length > 0 && (
          <div className="ml-4">
            {microtasks.map(microtask => renderTaskSection(microtask, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasPrevious && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToPrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold truncate max-w-96 flex items-center gap-3">
                  <span className="text-3xl">{getStatusIcon(task.status, task.priority)}</span>
                  {task.title}
                </h2>
                {project && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color || '#3B82F6' }}
                    />
                    {project.name}
                  </p>
                )}
              </div>

              {hasNext && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNavigateToNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Main Task */}
          {renderTaskSection(task, 0)}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <div className="space-y-6">
              {subtasks.map(subtask => renderTaskSection(subtask, 1))}
            </div>
          )}

          {/* Empty State */}
          {subtasks.length === 0 && logs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">¡Comienza a trabajar!</h3>
              <p className="text-sm mb-4">
                Esta tarea no tiene subtareas ni actividad registrada aún.
              </p>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Añadir primera subtarea
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskGanttModal;
