
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ZoomIn, ZoomOut } from 'lucide-react';

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

  const processTasksForGantt = (): GanttTask[] => {
    const filteredTasks = selectedProjectId 
      ? tasks.filter(task => task.project_id === selectedProjectId)
      : tasks;

    return filteredTasks
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
  };

  useEffect(() => {
    setGanttTasks(processTasksForGantt());
  }, [tasks, projects, selectedProjectId]);

  useEffect(() => {
    if (!svgRef.current || ganttTasks.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 60, right: 30, bottom: 60, left: 200 };
    const width = 1000 - margin.left - margin.right;
    const height = ganttTasks.length * 40 + margin.top + margin.bottom;

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height);

    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);

    // Time scale
    const minDate = d3.min(ganttTasks, d => d.startDate) || new Date();
    const maxDate = d3.max(ganttTasks, d => d.endDate) || new Date();
    
    // Add padding to dates
    const timePadding = (maxDate.getTime() - minDate.getTime()) * 0.1;
    const paddedMinDate = new Date(minDate.getTime() - timePadding);
    const paddedMaxDate = new Date(maxDate.getTime() + timePadding);

    const xScale = d3.scaleTime()
                     .domain([paddedMinDate, paddedMaxDate])
                     .range([0, width]);

    const yScale = d3.scaleBand()
                     .domain(ganttTasks.map(d => d.id))
                     .range([0, ganttTasks.length * 40])
                     .padding(0.1);

    // Create time axis
    let timeFormat;
    let tickInterval;
    
    switch (timeScale) {
      case 'day':
        timeFormat = d3.timeFormat("%d/%m");
        tickInterval = d3.timeDay.every(1);
        break;
      case 'week':
        timeFormat = d3.timeFormat("%d/%m");
        tickInterval = d3.timeWeek.every(1);
        break;
      case 'month':
        timeFormat = d3.timeFormat("%m/%Y");
        tickInterval = d3.timeMonth.every(1);
        break;
    }

    const xAxis = d3.axisTop(xScale)
                    .tickFormat(timeFormat)
                    .ticks(tickInterval);

    g.append("g")
     .attr("class", "x-axis")
     .call(xAxis)
     .selectAll("text")
     .style("text-anchor", "middle")
     .style("font-size", "12px");

    // Add grid lines
    g.selectAll(".grid-line")
     .data(xScale.ticks(tickInterval))
     .enter()
     .append("line")
     .attr("class", "grid-line")
     .attr("x1", d => xScale(d))
     .attr("x2", d => xScale(d))
     .attr("y1", 0)
     .attr("y2", ganttTasks.length * 40)
     .attr("stroke", "#e2e8f0")
     .attr("stroke-width", 1)
     .attr("opacity", 0.5);

    // Create task bars
    const taskGroups = g.selectAll(".task-group")
                        .data(ganttTasks)
                        .enter()
                        .append("g")
                        .attr("class", "task-group")
                        .attr("transform", d => `translate(0, ${yScale(d.id)})`);

    // Background bars
    taskGroups.append("rect")
              .attr("class", "task-background")
              .attr("x", d => xScale(d.startDate))
              .attr("width", d => xScale(d.endDate) - xScale(d.startDate))
              .attr("height", yScale.bandwidth())
              .attr("fill", d => d.projectColor)
              .attr("opacity", 0.2)
              .attr("rx", 4);

    // Progress bars
    taskGroups.append("rect")
              .attr("class", "task-progress")
              .attr("x", d => xScale(d.startDate))
              .attr("width", d => (xScale(d.endDate) - xScale(d.startDate)) * (d.progress / 100))
              .attr("height", yScale.bandwidth())
              .attr("fill", d => d.projectColor)
              .attr("rx", 4);

    // Task labels
    taskGroups.append("text")
              .attr("class", "task-label")
              .attr("x", -10)
              .attr("y", yScale.bandwidth() / 2)
              .attr("dy", "0.35em")
              .attr("text-anchor", "end")
              .attr("font-size", "12px")
              .attr("font-weight", "500")
              .text(d => d.title.length > 25 ? d.title.substring(0, 25) + "..." : d.title);

    // Priority indicators
    taskGroups.append("circle")
              .attr("class", "priority-indicator")
              .attr("cx", d => xScale(d.startDate) - 8)
              .attr("cy", yScale.bandwidth() / 2)
              .attr("r", 4)
              .attr("fill", d => {
                switch (d.priority) {
                  case 'urgent': return '#ef4444';
                  case 'high': return '#f97316';
                  case 'medium': return '#eab308';
                  case 'low': return '#22c55e';
                  default: return '#6b7280';
                }
              });

    // Add tooltips
    taskGroups.append("title")
              .text(d => `${d.title}\nInicio: ${d.startDate.toLocaleDateString()}\nFin: ${d.endDate.toLocaleDateString()}\nProgreso: ${d.progress}%`);

  }, [ganttTasks, timeScale]);

  const handleZoomIn = () => {
    const currentIndex = ['month', 'week', 'day'].indexOf(timeScale);
    if (currentIndex < 2) {
      setTimeScale(['month', 'week', 'day'][currentIndex + 1] as 'day' | 'week' | 'month');
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ['month', 'week', 'day'].indexOf(timeScale);
    if (currentIndex > 0) {
      setTimeScale(['month', 'week', 'day'][currentIndex - 1] as 'day' | 'week' | 'month');
    }
  };

  if (ganttTasks.length === 0) {
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
      <CardContent>
        <div className="overflow-x-auto">
          <svg ref={svgRef} className="w-full"></svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttChart;
