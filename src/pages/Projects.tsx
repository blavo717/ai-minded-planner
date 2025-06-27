
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects, Project } from '@/hooks/useProjects';
import { useProjectMutations } from '@/hooks/useProjectMutations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  FolderOpen,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import EditProjectModal from '@/components/modals/EditProjectModal';
import ProjectGanttView from '@/components/projects/ProjectGanttView';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ViewMode = 'grid' | 'gantt';

const Projects = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { deleteProject } = useProjectMutations();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const totalTasks = projectTasks.length;
    
    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditProjectOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditProjectOpen(false);
    setSelectedProject(null);
  };

  if (viewMode === 'gantt') {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8">
        <ProjectGanttView
          tasks={tasks}
          projects={projects}
          onBackToProjects={() => setViewMode('grid')}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proyectos</h1>
          <p className="text-muted-foreground mt-1">
            Organiza tu trabajo en proyectos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => setViewMode('gantt')}
            className="shrink-0"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Vista Gantt
          </Button>
          <Button 
            onClick={() => setIsCreateProjectOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tienes proyectos creados
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Crea tu primer proyecto para comenzar a organizar tus tareas de manera eficiente
            </p>
            <Button 
              onClick={() => setIsCreateProjectOpen(true)}
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer proyecto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            
            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <CardTitle className="text-lg font-semibold text-card-foreground truncate">
                        {project.name}
                      </CardTitle>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => handleEditProject(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => deleteProject(project.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {project.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {project.description}
                    </p>
                  )}
                  
                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-card-foreground">Progreso</span>
                      <Badge variant="outline" className="font-semibold">
                        {stats.completionRate}%
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: project.color,
                          width: `${stats.completionRate}%`
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Clock className="h-4 w-4" />
                          <span className="text-lg font-bold">{stats.pendingTasks}</span>
                        </div>
                        <p className="text-xs text-accent-foreground font-medium">Pendientes</p>
                      </div>
                      
                      <div className="text-center p-3 bg-accent rounded-lg">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-lg font-bold">{stats.completedTasks}</span>
                        </div>
                        <p className="text-xs text-accent-foreground font-medium">Completadas</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Creado el {format(new Date(project.created_at), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={handleCloseEditModal}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;
