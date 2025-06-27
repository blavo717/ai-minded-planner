
import React from 'react';
import { Project } from '@/hooks/useProjects';
import { Task } from '@/hooks/useTasks';
import ProjectCard from './ProjectCard';

interface ProjectsGridProps {
  projects: Project[];
  tasks: Task[];
  onEditProject: (project: Project) => void;
  onChangeStatus: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectsGrid = ({ 
  projects, 
  tasks, 
  onEditProject, 
  onChangeStatus, 
  onDeleteProject 
}: ProjectsGridProps) => {
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const stats = getProjectStats(project.id);
        
        return (
          <ProjectCard
            key={project.id}
            project={project}
            stats={stats}
            onEdit={onEditProject}
            onChangeStatus={onChangeStatus}
            onDelete={onDeleteProject}
          />
        );
      })}
    </div>
  );
};

export default ProjectsGrid;
