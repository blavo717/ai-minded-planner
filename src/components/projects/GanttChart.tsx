
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ZoomIn, ZoomOut } from 'lucide-react';
import Logger, { LogCategory } from '@/utils/logger';
import { PerformanceMonitor } from '@/utils/performanceMonitor';

interface GanttChartProps {
  tasks: Task[];
  projects: Project[];
  selectedProjectId?: string;
}

interface GanttTask {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  priority: string;
  projectColor: string;
  dependencies: string[];
}

const GanttChart = ({ tasks, projects, selectedProjectId }: GanttChartProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [timeScale, setTimeScale] = useState<'day' | 'week' | 'month'>('week');
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const processTasksForGantt = (): GanttTask[] => {
    Logger.debug(LogCategory.GANTT_RENDER, 'Processing tasks for Gantt', {
      totalTasks: tasks.length,
      selectedProjectId,
      projects: projects.length
    });

    return PerformanceMonitor.measure('gantt-process-tasks', () => {
      const filteredTasks = selectedProjectId 
        ? tasks.filter(task => task.project_id === selectedProjectId)
        : tasks;

      const processedTasks = filteredTasks
        .filter(task => task.due_date)
        .map(task => {
          const project = projects.find(p => p.id === task.project_id);
          const startDate = task.created_at ? new Date(task.created_at) : new Date();
          const endDate = new Date(task.due_date!);
          
          // Calculate progress based on status
          let progress = 0;
          switch (task.status) {
            case 'completed':
              progress = 100;
              break;
            case 'in_progress':
              progress = 50;
              break;
            case 'pending':
              progress = 0;
              break;
            default:
              progress = 0;
          }

          return {
            id: task.id,
            title: task.title,
            startDate,
            endDate,
            progress,
            priority: task.priority,
            projectColor: project?.color || '#3B82F6',
            dependencies: [] // TODO: Implement task dependencies
          };
        })
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      Logger.info(LogCategory.GANTT_RENDER, 'Tasks processed for Gantt', {
        originalCount: filteredTasks.length,
        processedCount: processedTasks.length,
        withDates: processedTasks.length
      });

      return processedTasks;
    }, { selectedProjectId, taskCount: tasks.length });
  };

  useEffect(() => {
    PerformanceMonitor.logMemoryUsage('gantt-tasks-update');
    setGanttTasks(processTasksForGantt());
  }, [tasks, projects, selectedProjectId]);

  // Helper functions for minimalistic status indicators
  const getStatusIcon = (progress: number, priority: string) => {
    if (progress === 100) return '●'; // Completed
    if (progress > 0) return '◐'; // In progress
    return priority === 'urgent' ? '○' : '○'; // Pending
  };

  const getStatusColor = (progress: number, priority: string) => {
    if (progress === 100) return 'text-status-completed';
    if (progress > 0) return 'text-status-in-progress';
    if (priority === 'urgent') return 'text-priority-urgent';
    return 'text-muted-foreground';
  };

  const getPriorityDotColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-priority-urgent';
      case 'high': return 'bg-priority-high';
      case 'medium': return 'bg-priority-medium';
      case 'low': return 'bg-priority-low';
      default: return 'bg-muted';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDateRange = () => {
    if (ganttTasks.length === 0) return { start: new Date(), end: new Date() };
    
    const startDates = ganttTasks.map(t => t.startDate);
    const endDates = ganttTasks.map(t => t.endDate);
    
    return {
      start: new Date(Math.min(...startDates.map(d => d.getTime()))),
      end: new Date(Math.max(...endDates.map(d => d.getTime())))
    };
  };

  const dateRange = getDateRange();

  const handleZoomIn = () => {
    const currentIndex = ['month', 'week', 'day'].indexOf(timeScale);
    if (currentIndex < 2) {
      const newScale = ['month', 'week', 'day'][currentIndex + 1] as 'day' | 'week' | 'month';
      Logger.info(LogCategory.GANTT_RENDER, 'Gantt zoom in', { from: timeScale, to: newScale });
      setTimeScale(newScale);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ['month', 'week', 'day'].indexOf(timeScale);
    if (currentIndex > 0) {
      const newScale = ['month', 'week', 'day'][currentIndex - 1] as 'day' | 'week' | 'month';
      Logger.info(LogCategory.GANTT_RENDER, 'Gantt zoom out', { from: timeScale, to: newScale });
      setTimeScale(newScale);
    }
  };

  if (ganttTasks.length === 0) {
    Logger.info(LogCategory.GANTT_RENDER, 'Showing empty state', {
      totalTasks: tasks.length,
      tasksWithDates: tasks.filter(t => t.due_date).length
    });

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Sin tareas con fechas</h3>
          <p className="text-muted-foreground text-center">
            Agrega fechas de vencimiento a tus tareas para ver el diagrama de Gantt
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Diagrama de Gantt
            <Badge variant="secondary">{ganttTasks.length} tareas</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={timeScale === 'month'}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Badge variant="outline" className="capitalize">{timeScale}</Badge>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={timeScale === 'day'}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Minimalistic Timeline Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between text-sm text-muted-foreground font-medium">
            <span className="w-80">Tarea</span>
            <div className="flex-1 flex justify-between px-8">
              <span>{formatDate(dateRange.start)}</span>
              <span>{formatDate(dateRange.end)}</span>
            </div>
            <span className="w-20 text-center">Estado</span>
          </div>
        </div>

        {/* Minimalistic Task Rows */}
        <div className="divide-y divide-border">
          {ganttTasks.map((task) => (
            <div
              key={task.id}
              className={`
                flex items-center py-4 px-6 transition-all duration-200 group
                hover:bg-muted/30 cursor-pointer
                ${hoveredTask === task.id ? 'bg-muted/40' : ''}
              `}
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              {/* Task Info Column */}
              <div className="w-80 flex items-center gap-3">
                {/* Priority Dot */}
                <div className={`
                  w-2 h-2 rounded-full flex-shrink-0
                  ${getPriorityDotColor(task.priority)}
                `} />
                
                {/* Project Color Accent */}
                <div
                  className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.projectColor }}
                />
                
                {/* Task Title */}
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-foreground truncate text-sm">
                    {task.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(task.endDate)}
                  </p>
                </div>
              </div>

              {/* Timeline Visual */}
              <div className="flex-1 px-8 py-2">
                <div className="relative h-6 bg-muted/40 rounded-sm overflow-hidden">
                  {/* Timeline Bar */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-sm transition-all duration-300"
                    style={{
                      backgroundColor: task.projectColor,
                      width: `${Math.max(task.progress, 8)}%`,
                      opacity: task.progress === 100 ? 0.9 : 0.6
                    }}
                  />
                  
                  {/* Progress Text */}
                  {task.progress > 30 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white/90">
                        {task.progress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Column */}
              <div className="w-20 flex items-center justify-center">
                <span className={`
                  text-lg font-medium transition-all duration-200
                  ${getStatusColor(task.progress, task.priority)}
                  ${hoveredTask === task.id ? 'scale-125' : ''}
                `}>
                  {getStatusIcon(task.progress, task.priority)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Minimalistic Footer Stats */}
        <div className="px-6 py-4 border-t border-border bg-muted/10">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {ganttTasks.filter(t => t.progress === 100).length} de {ganttTasks.length} completadas
            </span>
            <span>
              Progreso general: {Math.round(ganttTasks.reduce((acc, t) => acc + t.progress, 0) / ganttTasks.length)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
