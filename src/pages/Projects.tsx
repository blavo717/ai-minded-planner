
import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects, Project } from '@/hooks/useProjects';
import { useProjectMutations } from '@/hooks/useProjectMutations';
import CreateProjectModal from '@/components/modals/CreateProjectModal';
import AdvancedEditProjectModal from '@/components/modals/AdvancedEditProjectModal';
import ProjectGanttView from '@/components/projects/ProjectGanttView';
import ProjectStatusModal from '@/components/modals/ProjectStatusModal';
import ProjectsHeader from '@/components/projects/ProjectsHeader';
import EmptyProjectsState from '@/components/projects/EmptyProjectsState';
import ProjectsGrid from '@/components/projects/ProjectsGrid';
import ProjectAnalyticsDashboard from '@/components/planner/ProjectAnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ViewMode = 'grid' | 'gantt' | 'analytics';

const Projects = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { deleteProject } = useProjectMutations();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditProjectOpen(true);
  };

  const handleChangeStatus = (project: Project) => {
    setSelectedProject(project);
    setIsStatusModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditProjectOpen(false);
    setSelectedProject(null);
  };

  const handleCloseStatusModal = () => {
    setIsStatusModalOpen(false);
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

  if (viewMode === 'analytics') {
    return (
      <div className="container mx-auto px-6 py-8 space-y-8">
        <ProjectAnalyticsDashboard />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <ProjectsHeader
        onCreateProject={() => setIsCreateProjectOpen(true)}
        onViewGantt={() => setViewMode('gantt')}
      />

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid">Proyectos</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          {projects.length === 0 ? (
            <EmptyProjectsState onCreateProject={() => setIsCreateProjectOpen(true)} />
          ) : (
            <ProjectsGrid
              projects={projects}
              tasks={tasks}
              onEditProject={handleEditProject}
              onChangeStatus={handleChangeStatus}
              onDeleteProject={deleteProject}
            />
          )}
        </TabsContent>

        <TabsContent value="gantt" className="space-y-6">
          <ProjectGanttView
            tasks={tasks}
            projects={projects}
            onBackToProjects={() => setViewMode('grid')}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ProjectAnalyticsDashboard />
        </TabsContent>
      </Tabs>

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
      />

      <AdvancedEditProjectModal
        isOpen={isEditProjectOpen}
        onClose={handleCloseEditModal}
        project={selectedProject}
      />

      <ProjectStatusModal
        isOpen={isStatusModalOpen}
        onClose={handleCloseStatusModal}
        project={selectedProject}
      />
    </div>
  );
};

export default Projects;
