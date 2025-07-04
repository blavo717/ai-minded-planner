import React, { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy dashboard components  
const UserAnalyticsDashboard = React.lazy(() => import('./UserAnalyticsDashboard').then(m => ({ default: m.UserAnalyticsDashboard })));
const RecommendationMetricsDashboard = React.lazy(() => import('./RecommendationMetricsDashboard').then(m => ({ default: m.RecommendationMetricsDashboard })));
const PerformanceDashboard = React.lazy(() => import('./PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));

// Loading skeleton components
const DashboardSkeleton = () => (
  <Card className="w-full">
    <CardContent className="pt-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="w-full">
    <CardContent className="pt-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-64 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Lazy dashboard wrapper components
export const LazyUserAnalyticsDashboard: React.FC<{ className?: string }> = ({ className }) => (
  <Suspense fallback={<DashboardSkeleton />}>
    <UserAnalyticsDashboard className={className} />
  </Suspense>
);

export const LazyRecommendationMetricsDashboard: React.FC<{ className?: string }> = ({ className }) => (
  <Suspense fallback={<DashboardSkeleton />}>
    <RecommendationMetricsDashboard className={className} />
  </Suspense>
);

export const LazyPerformanceDashboard: React.FC<{ className?: string }> = ({ className }) => (
  <Suspense fallback={<ChartSkeleton />}>
    <PerformanceDashboard className={className} />
  </Suspense>
);

// Combined lazy dashboard with tabs for better organization
export const LazyPlannerDashboards: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<'analytics' | 'metrics' | 'performance'>('analytics');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Análisis de Usuario
        </button>
        <button
          onClick={() => setActiveTab('metrics')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'metrics'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Métricas de Recomendaciones
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'performance'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Rendimiento del Sistema
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'analytics' && <LazyUserAnalyticsDashboard />}
        {activeTab === 'metrics' && <LazyRecommendationMetricsDashboard />}
        {activeTab === 'performance' && <LazyPerformanceDashboard />}
      </div>
    </div>
  );
};

// Hook for preloading dashboards
export const useDashboardPreloader = () => {
  const preloadDashboards = React.useCallback(() => {
    // Preload all dashboard components
    Promise.all([
      import('./UserAnalyticsDashboard'),
      import('./RecommendationMetricsDashboard'),
      import('./PerformanceDashboard')
    ]).catch(error => {
      console.warn('Failed to preload dashboards:', error);
    });
  }, []);

  return { preloadDashboards };
};

export default LazyPlannerDashboards;