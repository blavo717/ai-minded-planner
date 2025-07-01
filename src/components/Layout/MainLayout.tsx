
import React from 'react';
import TopNavigation from '@/components/Navigation/TopNavigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <TopNavigation />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
