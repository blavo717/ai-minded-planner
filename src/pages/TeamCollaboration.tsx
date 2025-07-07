import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import TeamCollaborationDashboard from '@/components/planner/TeamCollaborationDashboard';

const TeamCollaboration: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <TeamCollaborationDashboard />
      </div>
    </MainLayout>
  );
};

export default TeamCollaboration;