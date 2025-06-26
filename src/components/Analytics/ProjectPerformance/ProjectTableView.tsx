
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectPerformance } from '@/hooks/useAnalytics';

interface ProjectTableViewProps {
  data: ProjectPerformance[];
}

const ProjectTableView = ({ data }: ProjectTableViewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Proyectos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Proyecto</th>
                <th className="text-right p-2">Tareas</th>
                <th className="text-right p-2">Horas</th>
                <th className="text-right p-2">Eficiencia</th>
                <th className="text-right p-2">Completado</th>
              </tr>
            </thead>
            <tbody>
              {data.map((project) => (
                <tr key={project.project_id} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{project.project_name}</td>
                  <td className="p-2 text-right">
                    <Badge variant="outline">{project.tasks_completed}</Badge>
                  </td>
                  <td className="p-2 text-right">{((project.total_time || 0) / 60).toFixed(1)}h</td>
                  <td className="p-2 text-right">
                    <Badge variant={project.efficiency > 80 ? 'default' : 'secondary'}>
                      {project.efficiency.toFixed(1)}%
                    </Badge>
                  </td>
                  <td className="p-2 text-right">
                    <Badge variant={project.completion_rate > 70 ? 'default' : 'secondary'}>
                      {project.completion_rate.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectTableView;
