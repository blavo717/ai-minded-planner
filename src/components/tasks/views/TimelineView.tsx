
import React, { useMemo } from 'react';
import { Task } from '@/hooks/useTasks';
import { format, parseISO, startOfDay, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Calendar as CalendarIcon, AlertTriangle, CheckCircle } from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

interface TimelineGroup {
  date: Date;
  dateLabel: string;
  tasks: Task[];
}

const TimelineView = ({ tasks, onEditTask, onCompleteTask }: TimelineViewProps) => {
  const timelineGroups = useMemo(() => {
    const today = startOfDay(new Date());
    const groups: TimelineGroup[] = [];
    
    // Crear grupos por fecha
    const tasksByDate = new Map<string, Task[]>();
    
    // Procesar tareas con fecha
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd');
        if (!tasksByDate.has(dateKey)) {
          tasksByDate.set(dateKey, []);
        }
        tasksByDate.get(dateKey)!.push(task);
      }
    });
    
    // Tareas sin fecha
    const tasksWithoutDate = tasks.filter(task => !task.due_date);
    if (tasksWithoutDate.length > 0) {
      groups.push({
        date: new Date(0), // Fecha especial para tareas sin fecha
        dateLabel: 'Sin fecha',
        tasks: tasksWithoutDate
      });
    }
    
    // Convertir a grupos ordenados
    const sortedDates = Array.from(tasksByDate.keys()).sort();
    sortedDates.forEach(dateKey => {
      const date = parseISO(dateKey);
      const daysDiff = differenceInDays(date, today);
      
      let dateLabel = format(date, 'EEEE, dd MMMM yyyy', { locale: es });
      
      if (daysDiff === 0) {
        dateLabel = `Hoy - ${format(date, 'dd MMMM', { locale: es })}`;
      } else if (daysDiff === 1) {
        dateLabel = `Mañana - ${format(date, 'dd MMMM', { locale: es })}`;
      } else if (daysDiff === -1) {
        dateLabel = `Ayer - ${format(date, 'dd MMMM', { locale: es })}`;
      } else if (daysDiff < 0) {
        dateLabel = `${Math.abs(daysDiff)} días atrás - ${format(date, 'dd MMMM', { locale: es })}`;
      } else if (daysDiff <= 7) {
        dateLabel = `En ${daysDiff} días - ${format(date, 'EEEE, dd MMMM', { locale: es })}`;
      }
      
      groups.push({
        date,
        dateLabel,
        tasks: tasksByDate.get(dateKey)!
      });
    });
    
    return groups;
  }, [tasks]);

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

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed') return false;
    return parseISO(task.due_date) < startOfDay(new Date());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vista Timeline</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>Organizadas por fecha de vencimiento</span>
        </div>
      </div>

      <div className="relative">
        {/* Línea vertical del timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>
        
        <div className="space-y-8">
          {timelineGroups.map((group, groupIndex) => (
            <div key={group.dateLabel} className="relative">
              {/* Punto del timeline */}
              <div className="absolute left-6 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
              
              {/* Contenido del grupo */}
              <div className="ml-16">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-foreground">
                    {group.dateLabel}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {group.tasks.length} tarea{group.tasks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="space-y-3">
                  {group.tasks.map((task) => (
                    <Card key={task.id} className={`${isOverdue(task) ? 'border-red-200 bg-red-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(task.status)}
                              <h4 className="font-medium truncate">{task.title}</h4>
                              <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                              {isOverdue(task) && (
                                <Badge variant="destructive" className="text-xs">
                                  Vencida
                                </Badge>
                              )}
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs">
                                {task.status === 'pending' ? 'Pendiente' : 
                                 task.status === 'in_progress' ? 'En Progreso' : 
                                 task.status === 'completed' ? 'Completada' : 'Cancelada'}
                              </Badge>
                              
                              {task.estimated_duration && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{task.estimated_duration}min</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditTask(task)}
                            >
                              Editar
                            </Button>
                            {task.status !== 'completed' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onCompleteTask(task)}
                              >
                                Completar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {timelineGroups.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay tareas para mostrar</h3>
            <p className="text-muted-foreground">
              Las tareas aparecerán aquí organizadas por fecha de vencimiento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
