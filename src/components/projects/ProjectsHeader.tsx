
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3 } from 'lucide-react';

interface ProjectsHeaderProps {
  onCreateProject: () => void;
  onViewGantt: () => void;
}

const ProjectsHeader = ({ onCreateProject, onViewGantt }: ProjectsHeaderProps) => {
  return (
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
          onClick={onViewGantt}
          className="shrink-0"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Vista Gantt
        </Button>
        <Button 
          onClick={onCreateProject}
          className="shrink-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>
    </div>
  );
};

export default ProjectsHeader;
