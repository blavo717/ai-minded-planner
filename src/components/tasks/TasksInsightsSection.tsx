
import React from 'react';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import DailyPlannerPreview from '@/components/AI/DailyPlannerPreview';

interface TasksInsightsSectionProps {
  showInsights: boolean;
}

const TasksInsightsSection = ({ showInsights }: TasksInsightsSectionProps) => {
  if (!showInsights) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-fade-in">
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-6">
          <ProductivityInsights />
          <DailyPlannerPreview />
        </div>
      </div>
      <div>
        <ProductivityTimer />
      </div>
    </div>
  );
};

export default TasksInsightsSection;
