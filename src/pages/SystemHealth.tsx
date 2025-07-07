import React from 'react';
import MainLayout from '@/components/Layout/MainLayout';
import SystemHealthDashboard from '@/components/planner/SystemHealthDashboard';

const SystemHealth: React.FC = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <SystemHealthDashboard />
      </div>
    </MainLayout>
  );
};

export default SystemHealth;