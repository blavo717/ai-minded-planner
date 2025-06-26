
import React, { useState, useMemo } from 'react';
import { Task } from '@/hooks/useTasks';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface CalendarViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onCompleteTask: (task: Task) => void;
}

const CalendarView = ({ tasks, onEditTask, onCompleteTask }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Tareas por fecha
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(task);
      }
    });
    
    return map;
  }, [tasks]);

  // Tareas del día seleccionado
  const selectedDateTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate.get(dateKey) || [];
  }, [selectedDate, tasksByDate]);

  // Fechas con tareas para el calendario
  const datesWithTasks = useMemo(() => {
    return Array.from(tasksByDate.keys()).map(dateStr => parseISO(dateStr));
  }, [tasksByDate]);

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-500" />;
      case 'pending':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.status === 'completed') return false;
    return parseISO(task.due_date) < new Date();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const WeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-7 gap-2 h-96">
        {weekDays.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate.get(dateKey) || [];
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={dateKey} className={`border rounded-lg p-2 ${isToday ? 'bg-primary/5 border-primary' : ''}`}>
              <div className="font-medium text-sm mb-2">
                {format(day, 'EEE dd', { locale: es })}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded border-l-2 cursor-pointer hover:bg-muted ${getPriorityColor(task.priority)}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(task.status)}
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayTasks.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Vista Calendario</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-32 text-center">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'month' | 'week')}>
        <TabsList>
          <TabsTrigger value="month">Mes</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    locale={es}
                    modifiers={{
                      hasTask: datesWithTasks,
                    }}
                    modifiersStyles={{
                      hasTask: {
                        backgroundColor: 'hsl(var(--primary))',
                        color: 'hsl(var(--primary-foreground))',
                        fontWeight: 'bold',
                      },
                    }}
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {format(selectedDate, 'dd MMMM yyyy', { locale: es })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDateTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay tareas para este día
                    </p>
                  ) : (
                    selectedDateTasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-3 border rounded-lg border-l-4 ${getPriorityColor(task.priority)} ${isOverdue(task) ? 'bg-red-50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <span className="font-medium text-sm">{task.title}</span>
                          </div>
                          {isOverdue(task) && (
                            <Badge variant="destructive" className="text-xs">
                              Vencida
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
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
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => onEditTask(task)}
                          >
                            Editar
                          </Button>
                          {task.status !== 'completed' && (
                            <Button
                              variant="default"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => onCompleteTask(task)}
                            >
                              Completar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <WeekView />
          
          {selectedDateTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Tareas del {format(selectedDate, 'dd MMMM', { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedDateTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3 border rounded-lg border-l-4 ${getPriorityColor(task.priority)} ${isOverdue(task) ? 'bg-red-50' : ''}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(task.status)}
                      <span className="font-medium text-sm truncate">{task.title}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 flex-1"
                        onClick={() => onEditTask(task)}
                      >
                        Editar
                      </Button>
                      {task.status !== 'completed' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs h-7 flex-1"
                          onClick={() => onCompleteTask(task)}
                        >
                          Completar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarView;
