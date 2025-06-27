
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Calendar, ArrowLeft } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import GanttChart from './GanttChart';

interface ProjectGanttViewProps {
  tasks: Task[];
  projects: Project[];
  onBackToProjects: () => void;
}

const ProjectGanttView = ({ tasks, projects, onBackToProjects }: ProjectGanttViewProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');

  const getProjectStats = (projectId?: string) => {
    let projectTasks: Task[];
    
    if (projectId === 'all' || !projectId) {
      projectTasks = tasks;
    } else {
      projectTasks = tasks.filter(task => task.project_id === projectId);
    }
    
    // Para el Gantt solo mostramos tareas con fechas, pero para las estadísticas mostramos todas
    const tasksWithDates = projectTasks.filter(task => task.due_date);
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const completedTasksWithDates = tasksWithDates.filter(task => task.status === 'completed').length;
    
    return {
      totalTasks: projectTasks.length,
      totalTasksWithDates: tasksWithDates.length,
      completedTasks,
      completedTasksWithDates,
      pendingTasks: projectTasks.length - completedTasks,
      pendingTasksWithDates: tasksWithDates.length - completedTasksWithDates,
      completionRate: projectTasks.length > 0 
        ? Math.round((completedTasks / projectTasks.length) * 100) 
        : 0
    };
  };

  const selectedProject = selectedProjectId === 'all' 
    ? null 
    : projects.find(p => p.id === selectedProjectId);

  const stats = getProjectStats(selectedProjectId === 'all' ? undefined : selectedProjectId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBackToProjects}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Proyectos
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Vista de Gantt
            </h1>
            <p className="text-muted-foreground">
              Visualiza la línea de tiempo de tus tareas y proyectos
            </p>
          </div>
        </div>

        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccionar proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proyecto</p>
                <p className="text-lg font-semibold">
                  {selectedProject?.name || 'Todos los proyectos'}
                </p>
              </div>
              {selectedProject && (
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tareas</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTasksWithDates} con fechas
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.completedTasksWithDates} con fechas
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {stats.completionRate}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pendingTasks}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingTasksWithDates} con fechas
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.pendingTasks}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <GanttChart 
        tasks={tasks}
        projects={projects}
        selectedProjectId={selectedProjectId === 'all' ? undefined : selectedProjectId}
      />
    </div>
  );
};

export default ProjectGanttView;
