import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Activity, Clock, MessageCircle } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { getStatusConfig, getPriorityConfig, calculateProgress, getProgressBarColor } from './TaskStatusUtils';

interface TimelineEvent {
  id: string;
  type: 'task_created' | 'task_due' | 'log_entry';
  timestamp: string;
  taskId: string;
  title: string;
  task?: any;
  data?: any;
}

interface ChronologicalData {
  events: TimelineEvent[];
  startDate: Date;
  endDate: Date;
  timelineSpan: number;
  currentTime: Date;
}

interface TimelineEventRendererProps {
  event: TimelineEvent;
  chronologicalData: ChronologicalData;
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'task_created': return Star;
    case 'task_due': return Calendar;
    case 'log_entry': return Activity;
    default: return Clock;
  }
};

export const TimelineEventRenderer: React.FC<TimelineEventRendererProps> = ({
  event,
  chronologicalData
}) => {
  const eventDate = new Date(event.timestamp);
  const isOverdue = event.type === 'task_due' && isAfter(new Date(), eventDate);
  const isFuture = isAfter(eventDate, new Date());
  const isPast = isBefore(eventDate, new Date());
  const statusConfig = getStatusConfig(event.task?.status || 'pending');
  const priorityConfig = getPriorityConfig(event.task?.priority || 'medium');
  
  // Calculate position on timeline (0-100%)
  const positionPercentage = chronologicalData.timelineSpan > 0 
    ? ((eventDate.getTime() - chronologicalData.startDate.getTime()) / 
       (chronologicalData.endDate.getTime() - chronologicalData.startDate.getTime())) * 100
    : 50;

  const EventIcon = getEventIcon(event.type);

  // Determine temporal section for layout
  const temporalSection = isPast ? 'past' : isFuture ? 'future' : 'current';
  const sectionColors = {
    past: 'bg-muted/50 border-muted',
    current: 'bg-primary/5 border-primary/20',
    future: 'bg-gradient-card border-task-card-border'
  };

  return (
    <div className={`mb-4 ${sectionColors[temporalSection]} rounded-lg p-4 shadow-task-sm hover:shadow-task-md transition-all`}>
      {/* Dominant Horizontal Timeline - Full Width */}
      <div className="relative mb-6">
        <div className="w-full h-6 bg-gradient-to-r from-muted via-muted/50 to-muted rounded-full overflow-hidden border border-border">
          {/* Timeline Zones: Past | Current | Future */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 bg-gradient-to-r from-muted-foreground/10 to-muted-foreground/5" />
            <div className="w-0.5 bg-primary shadow-lg z-10" />
            <div className="flex-1 bg-gradient-to-r from-primary/10 to-primary/20" />
          </div>
          
          {/* Event Position Marker - Anchored to Timeline */}
          <div 
            className={`absolute top-1 bottom-1 w-1 rounded-full shadow-lg z-20 ${
              temporalSection === 'past' ? 'bg-muted-foreground' :
              temporalSection === 'current' ? 'bg-primary' : 'bg-primary/70'
            }`}
            style={{ left: `${Math.max(0, Math.min(100, positionPercentage))}%` }}
          />
          
          {/* Timeline Navigation Labels */}
          <div className="absolute -top-5 left-0 text-xs text-muted-foreground">PASADO</div>
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs text-primary font-medium">AHORA</div>
          <div className="absolute -top-5 right-0 text-xs text-muted-foreground">FUTURO</div>
        </div>
        
        {/* Timeline Date Anchors */}
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-muted-foreground">{format(chronologicalData.startDate, 'dd MMM', { locale: es })}</span>
          <span className="font-medium text-primary">
            {format(eventDate, 'dd MMM HH:mm', { locale: es })}
          </span>
          <span className="text-muted-foreground">{format(chronologicalData.endDate, 'dd MMM', { locale: es })}</span>
        </div>
      </div>

      {/* Information Anchored to Timeline Position */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Context & Task Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <EventIcon className={`w-4 h-4 ${statusConfig.color}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{event.title}</h4>
              <p className="text-xs text-muted-foreground">
                {temporalSection === 'past' && '✓ Completado'}
                {temporalSection === 'current' && '⚡ Actual'}
                {temporalSection === 'future' && '📅 Programado'}
                {isOverdue && <span className="text-destructive font-medium"> • VENCIDA</span>}
              </p>
            </div>
          </div>
          
          {event.task && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progreso:</span>
                <span className="font-medium">{calculateProgress(event.task)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-full rounded-full ${getProgressBarColor(event.task.status)}`}
                  style={{ width: `${calculateProgress(event.task)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Center: Main Event Content */}
        <div className="space-y-3">
          {event.type === 'log_entry' && event.data.log && (
            <div className="bg-background/50 border border-border rounded-md p-3">
              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{event.data.log.title}</p>
                  {event.data.log.content && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.data.log.content}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {event.task && (
            <div className="text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-current mr-2" />
              {event.task.task_level === 1 ? 'Tarea Principal' : 
               event.task.task_level === 2 ? 'Subtarea' : 'Microtarea'}
            </div>
          )}
        </div>

        {/* Right: Status & Actions */}
        <div className="space-y-2 text-right">
          <div className="flex flex-col gap-1">
            <Badge className={`${priorityConfig.bgColor} ${priorityConfig.color} text-xs w-fit ml-auto`}>
              {priorityConfig.label}
            </Badge>
            <Badge className={`${statusConfig.bgColor} ${statusConfig.color} text-xs w-fit ml-auto`}>
              {statusConfig.label}
            </Badge>
          </div>
          
          {event.task && (
            <Badge variant="outline" className="text-xs w-fit ml-auto">
              {event.task.title || 'Sistema'}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};