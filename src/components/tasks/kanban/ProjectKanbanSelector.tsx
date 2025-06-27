
import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/useProjects';
import { Task } from '@/hooks/useTasks';
import { FolderOpen, BarChart3, X, CheckCircle, Clock } from 'lucide-react';

interface ProjectKanbanSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  tasks: Task[];
}

const ProjectKanbanSelector = memo(({
  projects,
  selectedProjectId,
  onProjectSelect,
  tasks
}: ProjectKanbanSelectorProps) => {
  const selectedProject = projects.find(p => p.id === selectedProjectId);
  
  const getProjectStats = (projectId: string | null) => {
    const projectTasks = projectId 
      ? tasks.filter(task => task.project_id === projectId)
      : tasks;
    
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = projectTasks.filter(task => task.status === 'in_progress').length;
    const pendingTasks = projectTasks.filter(task => task.status === 'pending').length;
    
    return {
      total: projectTasks.length,
      completed: completedTasks,
      inProgress: inProgressTasks,
      pending: pendingTasks,
      completionRate: projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
    };
  };

  const stats = getProjectStats(selectedProjectId);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span className="text-lg font-semibold">Vista Kanban por Proyecto</span>
            </div>
            
            {selectedProjectId && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onProjectSelect(null)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4 mr-1" />
                  Ver todas
                </Button>
              </motion.div>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 min-w-0">
              <Select
                value={selectedProjectId || "all"}
                onValueChange={(value) => onProjectSelect(value === "all" ? null : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400" />
                      <span>Todos los proyectos</span>
                    </div>
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <span>{project.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{stats.completed}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <span>{stats.inProgress}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <div className="w-4 h-4 rounded-full bg-yellow-500" />
                  <span>{stats.pending}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {selectedProject && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-white rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: selectedProject.color }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {selectedProject.name}
                  </h3>
                  {selectedProject.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {selectedProject.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {stats.total} tareas
                  </Badge>
                  {selectedProject.status && (
                    <Badge 
                      variant={selectedProject.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {selectedProject.status === 'active' ? 'Activo' :
                       selectedProject.status === 'completed' ? 'Completado' :
                       selectedProject.status === 'on_hold' ? 'En pausa' : 'Archivado'}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

ProjectKanbanSelector.displayName = 'ProjectKanbanSelector';

export default ProjectKanbanSelector;
