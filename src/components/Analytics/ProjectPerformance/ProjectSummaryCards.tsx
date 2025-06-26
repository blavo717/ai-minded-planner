
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Clock, TrendingUp } from 'lucide-react';

interface ProjectSummaryCardsProps {
  totalTasks: number;
  totalHours: number;
  avgEfficiency: number;
}

const ProjectSummaryCards = ({ totalTasks, totalHours, avgEfficiency }: ProjectSummaryCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Tareas</span>
          </div>
          <div className="text-2xl font-bold">{totalTasks}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Total Horas</span>
          </div>
          <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Eficiencia Promedio</span>
          </div>
          <div className="text-2xl font-bold">{avgEfficiency.toFixed(1)}%</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectSummaryCards;
