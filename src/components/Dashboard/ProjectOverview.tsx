
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Task } from '@/hooks/useTasks';
import { Folder, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProjectOverviewProps {
  projects: Project[];
  tasks: Task[];
  maxItems?: number;
}

const ProjectOverview = ({ projects, tasks, maxItems = 4 }: ProjectOverviewProps) => {
  const displayProjects = projects.slice(0, maxItems);

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId).length;
  };

  const getProjectCompletedTaskCount = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId && task.status === 'completed').length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Proyectos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {displayProjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No hay proyectos para mostrar
          </p>
        ) : (
          <div className="space-y-3">
            {displayProjects.map((project) => {
              const totalTasks = getProjectTaskCount(project.id);
              const completedTasks = getProjectCompletedTaskCount(project.id);
              
              return (
                <div
                  key={project.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm">{project.name}</h4>
                      
                      {project.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Folder className="h-3 w-3" />
                          {totalTasks} tareas
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(project.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className="text-xs">
                    {completedTasks}/{totalTasks}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectOverview;
