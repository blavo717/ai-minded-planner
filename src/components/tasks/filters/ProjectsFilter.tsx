
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface ProjectsFilterProps {
  projects: Project[];
  selectedProjects: string[];
  operator: 'AND' | 'OR';
  onProjectChange: (projectId: string, checked: boolean) => void;
  onOperatorChange: (operator: 'AND' | 'OR') => void;
}

const ProjectsFilter = ({ 
  projects, 
  selectedProjects, 
  operator, 
  onProjectChange, 
  onOperatorChange 
}: ProjectsFilterProps) => {
  if (projects.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Proyectos</Label>
        <Select value={operator} onValueChange={onOperatorChange}>
          <SelectTrigger className="w-20 h-6 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="OR">O</SelectItem>
            <SelectItem value="AND">Y</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
        {projects.map((project) => (
          <div key={project.id} className="flex items-center space-x-2">
            <Checkbox
              id={`project-${project.id}`}
              checked={selectedProjects.includes(project.id)}
              onCheckedChange={(checked) => onProjectChange(project.id, checked as boolean)}
            />
            <Label htmlFor={`project-${project.id}`} className="text-sm font-normal flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: project.color || '#3B82F6' }}
              />
              {project.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsFilter;
