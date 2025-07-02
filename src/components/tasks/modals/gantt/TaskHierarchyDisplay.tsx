import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, ListChecks } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { getStatusConfig, getPriorityConfig, calculateProgress, getProgressBarColor } from './TaskStatusUtils';

interface TaskHierarchyDisplayProps {
  task: Task;
  subtasks: Task[];
  project?: Project;
  getMicrotasksForSubtask: (subtaskId: string) => Task[];
}

export const TaskHierarchyDisplay: React.FC<TaskHierarchyDisplayProps> = memo(({
  task,
  subtasks,
  project,
  getMicrotasksForSubtask
}) => {
  const allTasks = [task, ...subtasks];
  
  // Get microtasks for each subtask for complete hierarchy
  const tasksWithMicrotasks = allTasks.map(t => ({
    ...t,
    microtasks: t.task_level === 2 ? getMicrotasksForSubtask(t.id) : []
  }));

  const tasksByLevel = tasksWithMicrotasks.reduce((acc, t) => {
    const level = t.task_level || 1;
    if (!acc[level]) acc[level] = [];
    acc[level].push(t);
    return acc;
  }, {} as Record<number, any[]>);

  return (
    <div className="space-y-8">
      {/* Main Task Section - Always Expanded */}
      <div className="bg-gradient-card border border-task-card-border rounded-lg p-6 shadow-task-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
            <Star className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground">Tarea Principal</h3>
            <p className="text-muted-foreground text-sm">Información completa y estado actual</p>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const statusConfig = getStatusConfig(task.status);
              const priorityConfig = getPriorityConfig(task.priority);
              const StatusIcon = statusConfig.icon;
              
              return (
                <>
                  <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} px-3 py-1`}>
                    {priorityConfig.label}
                  </Badge>
                  <Badge className={`${statusConfig.bgColor} ${statusConfig.color} px-3 py-1 flex items-center gap-2`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig.label}
                  </Badge>
                </>
              );
            })()}
          </div>
        </div>

        {/* Main Task Details - All Visible */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Task Title and Description */}
            <div className="bg-task-card border border-task-card-border rounded-md p-4">
              <h4 className="font-semibold text-base mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{task.description}</p>
              )}
              {task.due_date && (
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Vence: {format(new Date(task.due_date), 'PPp', { locale: es })}
                  </span>
                  {isAfter(new Date(), new Date(task.due_date)) && (
                    <Badge variant="destructive" className="text-xs">VENCIDA</Badge>
                  )}
                </div>
              )}
            </div>

            {/* Project Information - Always Visible */}
            {project && (
              <div className="bg-task-card border border-task-card-border rounded-md p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-white shadow-sm" 
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <h5 className="font-medium text-sm">{project.name}</h5>
                    <p className="text-xs text-muted-foreground">
                      {project.description || 'Sin descripción del proyecto'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats - Always Visible */}
          <div className="space-y-4">
            <div className="bg-task-card border border-task-card-border rounded-md p-4 text-center">
              <div className="text-2xl font-bold text-foreground mb-1">
                {calculateProgress(task)}%
              </div>
              <div className="text-xs text-muted-foreground mb-2">Progreso</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(task.status)}`}
                  style={{ width: `${calculateProgress(task)}%` }}
                />
              </div>
            </div>

            <div className="bg-task-card border border-task-card-border rounded-md p-4 text-center">
              <div className="text-lg font-bold text-foreground mb-1">
                {subtasks.length}
              </div>
              <div className="text-xs text-muted-foreground">Subtareas</div>
            </div>

            <div className="bg-task-card border border-task-card-border rounded-md p-4 text-center">
              <div className="text-lg font-bold text-foreground mb-1">
                {subtasks.reduce((acc, st) => acc + getMicrotasksForSubtask(st.id).length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Microtareas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks Section - Always Expanded */}
      {tasksByLevel[2] && tasksByLevel[2].length > 0 && (
        <div className="bg-gradient-card border border-task-card-border rounded-lg p-6 shadow-task-md">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-full bg-status-in-progress-bg border border-status-in-progress/20">
              <ListChecks className="w-6 h-6 text-status-in-progress" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground">Subtareas</h3>
              <p className="text-muted-foreground text-sm">
                {tasksByLevel[2].length} subtareas • {tasksByLevel[2].filter(st => st.status === 'completed').length} completadas
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {tasksByLevel[2].map((subtask: any) => {
              const statusConfig = getStatusConfig(subtask.status);
              const priorityConfig = getPriorityConfig(subtask.priority);
              const StatusIcon = statusConfig.icon;
              const microtasks = subtask.microtasks || [];
              
              return (
                <div key={subtask.id} className="bg-task-card border border-task-card-border rounded-lg p-5">
                  {/* Subtask Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-base">{subtask.title}</h4>
                        {subtask.description && (
                          <p className="text-sm text-muted-foreground mt-1">{subtask.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} text-xs`}>
                        {priorityConfig.label}
                      </Badge>
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs`}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Subtask Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">PROGRESO</span>
                      <span className="text-xs font-bold">{calculateProgress(subtask)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(subtask.status)}`}
                        style={{ width: `${calculateProgress(subtask)}%` }}
                      />
                    </div>
                  </div>

                  {/* Microtasks - Always Visible if they exist */}
                  {microtasks.length > 0 && (
                    <div className="border-t border-border pt-4">
                      <h5 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        MICROTAREAS ({microtasks.length})
                      </h5>
                      <div className="grid gap-2">
                        {microtasks.map((microtask: Task) => {
                          const microStatusConfig = getStatusConfig(microtask.status);
                          const MicroStatusIcon = microStatusConfig.icon;
                          
                          return (
                            <div key={microtask.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border">
                              <div className="flex items-center gap-3 flex-1">
                                <MicroStatusIcon className={`w-4 h-4 ${microStatusConfig.color}`} />
                                <span className="text-sm font-medium truncate">{microtask.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-12 bg-muted rounded-full h-2">
                                  <div 
                                    className={`h-full rounded-full ${getProgressBarColor(microtask.status)}`}
                                    style={{ width: `${calculateProgress(microtask)}%` }}
                                  />
                                </div>
                                <Badge className={`${microStatusConfig.bgColor} ${microStatusConfig.color} text-xs`}>
                                  {microStatusConfig.label}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Subtask Metadata - Always Visible */}
                  <div className="border-t border-border pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Creada:</span>
                        <p className="font-medium mt-1">
                          {format(new Date(subtask.created_at), 'PPp', { locale: es })}
                        </p>
                      </div>
                      {subtask.due_date && (
                        <div>
                          <span className="text-muted-foreground">Vence:</span>
                          <p className="font-medium mt-1">
                            {format(new Date(subtask.due_date), 'PPp', { locale: es })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});