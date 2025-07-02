
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Edit, Plus, Clock, Star, TrendingUp, MessageCircle, AlertTriangle, Calendar, Activity, CheckCircle2, PlayCircle, PauseCircle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { format, parseISO, differenceInDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
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

  // Phase 1: Integrated chronological timeline data processing
  const chronologicalData = useMemo(() => {
    const allTasks = [task, ...subtasks];
    const allEvents = [];

    // Collect all events from all tasks and logs
    allTasks.forEach(taskItem => {
      const taskLogs = logs.filter(log => log.task_id === taskItem.id);
      
      // Add task creation event
      if (taskItem.created_at) {
        allEvents.push({
          id: `task-created-${taskItem.id}`,
          type: 'task_created',
          timestamp: taskItem.created_at,
          taskId: taskItem.id,
          title: `Tarea creada: ${taskItem.title}`,
          task: taskItem,
          data: { task: taskItem }
        });
      }

      // Add due date event if exists
      if (taskItem.due_date) {
        allEvents.push({
          id: `task-due-${taskItem.id}`,
          type: 'task_due',
          timestamp: taskItem.due_date,
          taskId: taskItem.id,
          title: `Vence: ${taskItem.title}`,
          task: taskItem,
          data: { task: taskItem }
        });
      }

      // Add all log events
      taskLogs.forEach(log => {
        allEvents.push({
          id: `log-${log.id}`,
          type: 'log_entry',
          timestamp: log.created_at,
          taskId: taskItem.id,
          title: log.title,
          task: taskItem,
          data: { log, task: taskItem }
        });
      });
    });

    // Sort all events chronologically
    allEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Calculate timeline boundaries
    const startDate = allEvents.length > 0 
      ? new Date(allEvents[0].timestamp) 
      : startOfDay(new Date(task.created_at || Date.now()));
    
    const endDate = allEvents.length > 0 
      ? new Date(allEvents[allEvents.length - 1].timestamp) 
      : endOfDay(new Date());

    const timelineSpan = Math.max(differenceInDays(endDate, startDate), 1);

    return {
      events: allEvents,
      startDate,
      endDate,
      timelineSpan,
      currentTime: new Date()
    };
  }, [task, subtasks, logs]);

  // Enhanced status components with semantic design system
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': 
        return {
          icon: CheckCircle2,
          color: 'text-status-completed',
          bgColor: 'bg-status-completed-bg',
          label: 'Completado'
        };
      case 'in_progress': 
        return {
          icon: PlayCircle,
          color: 'text-status-in-progress',
          bgColor: 'bg-status-in-progress-bg',
          label: 'En Progreso'
        };
      case 'cancelled': 
        return {
          icon: X,
          color: 'text-status-cancelled',
          bgColor: 'bg-status-cancelled-bg',
          label: 'Cancelado'
        };
      default: 
        return {
          icon: PauseCircle,
          color: 'text-status-pending-fg',
          bgColor: 'bg-status-pending-bg',
          label: 'Pendiente'
        };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': return { color: 'text-priority-urgent', bgColor: 'bg-priority-urgent', label: 'Urgente' };
      case 'high': return { color: 'text-priority-high', bgColor: 'bg-priority-high', label: 'Alta' };
      case 'medium': return { color: 'text-priority-medium', bgColor: 'bg-priority-medium', label: 'Media' };
      case 'low': return { color: 'text-priority-low', bgColor: 'bg-priority-low', label: 'Baja' };
      default: return { color: 'text-muted-foreground', bgColor: 'bg-muted', label: 'Sin prioridad' };
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

  // Phase 1: Central Timeline Event Renderer
  const renderTimelineEvent = (event: any, index: number) => {
    const eventDate = new Date(event.timestamp);
    const isOverdue = event.type === 'task_due' && isAfter(new Date(), eventDate);
    const isFuture = isAfter(eventDate, new Date());
    const statusConfig = getStatusConfig(event.task?.status || 'pending');
    const priorityConfig = getPriorityConfig(event.task?.priority || 'medium');
    
    // Calculate position on timeline (0-100%)
    const positionPercentage = chronologicalData.timelineSpan > 0 
      ? ((eventDate.getTime() - chronologicalData.startDate.getTime()) / 
         (chronologicalData.endDate.getTime() - chronologicalData.startDate.getTime())) * 100
      : 50;

    const getEventIcon = (type: string) => {
      switch (type) {
        case 'task_created': return Star;
        case 'task_due': return Calendar;
        case 'log_entry': return Activity;
        default: return Clock;
      }
    };

    const EventIcon = getEventIcon(event.type);

    return (
      <div key={event.id} className="mb-6 bg-gradient-card border border-task-card-border rounded-lg p-4 shadow-task-sm hover:shadow-task-md transition-all">
        {/* Event Header with Timeline Position */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <EventIcon className={`w-4 h-4 ${statusConfig.color}`} />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{event.title}</h4>
              <p className="text-xs text-muted-foreground">
                {format(eventDate, 'PPp', { locale: es })}
                {isOverdue && <span className="ml-2 text-destructive font-medium">VENCIDA</span>}
                {isFuture && <span className="ml-2 text-primary font-medium">PRÓXIMA</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} text-xs`}>
              {priorityConfig.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {event.task?.title || 'Sistema'}
            </Badge>
          </div>
        </div>

        {/* Horizontal Timeline Visualization */}
        <div className="relative mb-4">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            {/* Timeline Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-primary/30"></div>
            {/* Current Event Position */}
            <div 
              className={`absolute top-0 h-full w-1 ${statusConfig.color === 'text-status-completed' ? 'bg-status-completed' : 'bg-primary'} shadow-sm`}
              style={{ left: `${Math.max(0, Math.min(100, positionPercentage))}%` }}
            />
          </div>
          {/* Timeline Labels */}
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>{format(chronologicalData.startDate, 'dd MMM', { locale: es })}</span>
            <span className="text-primary font-medium">AHORA</span>
            <span>{format(chronologicalData.endDate, 'dd MMM', { locale: es })}</span>
          </div>
        </div>

        {/* Event Details - Always Visible */}
        {event.type === 'log_entry' && event.data.log && (
          <div className="bg-status-pending-bg border border-border rounded-md p-3 mb-3">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-4 h-4 text-status-pending-fg mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-foreground font-medium">{event.data.log.title}</p>
                {event.data.log.content && (
                  <p className="text-xs text-muted-foreground mt-1">{event.data.log.content}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task Progress Information */}
        {event.task && (
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Progreso</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className={`h-full rounded-full ${getProgressBarColor(event.task.status)}`}
                    style={{ width: `${calculateProgress(event.task)}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{calculateProgress(event.task)}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Estado</p>
              <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs mt-1`}>
                {statusConfig.label}
              </Badge>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Jerarquía</p>
              <p className="text-xs font-medium mt-1">
                {event.task.task_level === 1 ? 'Tarea Principal' : 
                 event.task.task_level === 2 ? 'Subtarea' : 'Microtarea'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Dense Task Hierarchy Renderer
  const renderTaskHierarchy = () => {
    const allTasks = [task, ...subtasks];
    const tasksByLevel = allTasks.reduce((acc, t) => {
      const level = t.task_level || 1;
      if (!acc[level]) acc[level] = [];
      acc[level].push(t);
      return acc;
    }, {} as Record<number, Task[]>);

    return (
      <div className="bg-gradient-subtle border border-task-card-border rounded-lg p-4 mb-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Jerarquía de Tareas Completa
        </h3>
        
        {Object.entries(tasksByLevel)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([level, tasks]) => (
            <div key={level} className={`mb-4 ${level !== '1' ? 'ml-6' : ''}`}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                {level === '1' ? 'TAREAS PRINCIPALES' : level === '2' ? 'SUBTAREAS' : 'MICROTAREAS'}
              </h4>
              <div className="grid gap-2">
                {tasks.map(t => {
                  const statusConfig = getStatusConfig(t.status);
                  const priorityConfig = getPriorityConfig(t.priority);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-task-card border border-task-card-border rounded-md hover:bg-task-card-hover transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                        <span className="font-medium truncate">{t.title}</span>
                        <div className="flex items-center gap-1 ml-auto">
                          <div className="w-16 bg-muted rounded-full h-2">
                            <div 
                              className={`h-full rounded-full ${getProgressBarColor(t.status)}`}
                              style={{ width: `${calculateProgress(t)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-8">{calculateProgress(t)}%</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} text-xs`}>
                          {priorityConfig.label}
                        </Badge>
                        <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
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
                  {(() => {
                    const statusConfig = getStatusConfig(task.status);
                    const StatusIcon = statusConfig.icon;
                    return <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />;
                  })()}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Phase 1: Dense Task Hierarchy - Always Visible */}
          {renderTaskHierarchy()}

          {/* Phase 1: Central Chronological Timeline */}
          <div className="bg-gradient-card border border-task-card-border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Timeline Cronológico Completo
              <Badge variant="outline" className="text-xs ml-2">
                {chronologicalData.events.length} eventos
              </Badge>
            </h3>
            
            {/* Master Timeline Overview */}
            <div className="mb-6 p-4 bg-gradient-subtle rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">CRONOLOGÍA GENERAL</span>
                <span className="text-xs text-muted-foreground">
                  {format(chronologicalData.startDate, 'dd MMM yyyy', { locale: es })} - {format(chronologicalData.endDate, 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
              <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/50"></div>
                {chronologicalData.events.map((event, index) => {
                  const eventDate = new Date(event.timestamp);
                  const positionPercentage = chronologicalData.timelineSpan > 0 
                    ? ((eventDate.getTime() - chronologicalData.startDate.getTime()) / 
                       (chronologicalData.endDate.getTime() - chronologicalData.startDate.getTime())) * 100
                    : 50;
                  
                  return (
                    <div
                      key={event.id}
                      className={`absolute top-1 w-1 h-4 rounded-full ${
                        event.type === 'task_created' ? 'bg-status-in-progress' :
                        event.type === 'task_due' ? 'bg-priority-urgent' :
                        'bg-muted-foreground'
                      } shadow-sm`}
                      style={{ left: `${Math.max(0, Math.min(100, positionPercentage))}%` }}
                      title={event.title}
                    />
                  );
                })}
                {/* Current time indicator */}
                <div 
                  className="absolute top-0 w-0.5 h-full bg-primary shadow-md z-10"
                  style={{ 
                    left: `${chronologicalData.timelineSpan > 0 
                      ? ((chronologicalData.currentTime.getTime() - chronologicalData.startDate.getTime()) / 
                         (chronologicalData.endDate.getTime() - chronologicalData.startDate.getTime())) * 100
                      : 50}%` 
                  }}
                />
              </div>
            </div>

            {/* Integrated Event Flow */}
            {chronologicalData.events.length > 0 ? (
              <div className="space-y-4">
                {chronologicalData.events.map((event, index) => renderTimelineEvent(event, index))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-muted" />
                <h3 className="text-lg font-medium mb-2">Sin eventos registrados</h3>
                <p className="text-sm mb-4">
                  Esta tarea no tiene actividad registrada aún. Los eventos aparecerán aquí conforme se vayan generando.
                </p>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar primer evento
                </Button>
              </div>
            )}
          </div>

          {/* Next Actions Section - Always Visible */}
          <div className="bg-gradient-subtle border border-task-card-border rounded-lg p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Próximos Pasos y Planificación
            </h3>
            
            <div className="grid gap-4">
              {[task, ...subtasks].map(taskItem => {
                const statusConfig = getStatusConfig(taskItem.status);
                const priorityConfig = getPriorityConfig(taskItem.priority);
                
                return (
                  <div key={taskItem.id} className="bg-task-card border border-task-card-border rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priorityConfig.bgColor}`} />
                        <span className="font-medium text-sm">{taskItem.title}</span>
                      </div>
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    
                    {editingNextStep === taskItem.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={newNextStep}
                          onChange={(e) => setNewNextStep(e.target.value)}
                          placeholder="Describe el próximo paso..."
                          className="flex-1 h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
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
                        <Button size="sm" className="h-8 text-xs">Guardar</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {taskItem.status === 'completed' 
                            ? '✅ Tarea completada exitosamente' 
                            : taskItem.status === 'pending'
                            ? '🚀 Listo para iniciar trabajo'
                            : taskItem.status === 'in_progress'
                            ? '⚡ En progreso activo'
                            : '⏸️ Esperando reanudación'
                          }
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingNextStep(taskItem.id);
                            setNewNextStep('');
                          }}
                          className="h-7 text-xs text-primary"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Planificar
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskGanttModal;
