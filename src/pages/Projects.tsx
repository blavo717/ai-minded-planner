
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
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
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Projects = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { deleteProject } = useProjectMutations();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
            <p className="text-gray-600 mt-1">
              Organiza tu trabajo en proyectos
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateProjectOpen(true)}
            className="shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes proyectos creados
              </h3>
              <p className="text-gray-500 mb-6 max-w-md">
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
                <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 bg-white">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <CardTitle className="text-lg font-semibold text-gray-900 truncate">
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
                          <DropdownMenuItem onClick={() => console.log('Edit project', project.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            onClick={() => deleteProject(project.id)}
                            className="text-red-600 focus:text-red-600"
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
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {project.description}
                      </p>
                    )}
                    
                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Progreso</span>
                        <Badge variant="outline" className="font-semibold">
                          {stats.completionRate}%
                        </Badge>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: project.color,
                            width: `${stats.completionRate}%`
                          }}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-lg font-bold">{stats.pendingTasks}</span>
                          </div>
                          <p className="text-xs text-blue-700 font-medium">Pendientes</p>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-lg font-bold">{stats.completedTasks}</span>
                          </div>
                          <p className="text-xs text-green-700 font-medium">Completadas</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
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
      </div>
    </div>
  );
};

export default Projects;
