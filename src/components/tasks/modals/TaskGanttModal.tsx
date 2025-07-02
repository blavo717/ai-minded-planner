
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Plus, Calendar, Activity } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTaskLogs } from '@/hooks/useTaskLogs';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { format, differenceInDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { TimelineEventRenderer } from './gantt/TimelineEventRenderer';
import { TaskHierarchyDisplay } from './gantt/TaskHierarchyDisplay';
import { NextActionsPlanner } from './gantt/NextActionsPlanner';
import { getStatusConfig } from './gantt/TaskStatusUtils';

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
  const { logs } = useTaskLogs(task.id);
  const { getSubtasksForTask, getMicrotasksForSubtask } = useTasks();

  const subtasks = getSubtasksForTask(task.id);
  const project = projects.find(p => p.id === task.project_id);

  // Integrated chronological timeline data processing
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
          {/* Dense Task Hierarchy - Always Visible */}
          <TaskHierarchyDisplay
            task={task}
            subtasks={subtasks}
            project={project}
            getMicrotasksForSubtask={getMicrotasksForSubtask}
          />

          {/* Central Chronological Timeline */}
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
                {chronologicalData.events.map((event, index) => (
                  <TimelineEventRenderer
                    key={event.id}
                    event={event}
                    chronologicalData={chronologicalData}
                  />
                ))}
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
          <NextActionsPlanner tasks={[task, ...subtasks]} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskGanttModal;
