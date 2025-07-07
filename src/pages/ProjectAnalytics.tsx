import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import ProjectAnalyticsDashboard from '@/components/planner/ProjectAnalyticsDashboard';

const ProjectAnalytics: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <ProjectAnalyticsDashboard />
      </div>
    </MainLayout>
  );
};

export default ProjectAnalytics;