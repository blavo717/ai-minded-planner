
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ProjectPerformance } from '@/hooks/useAnalytics';

interface ProjectChartsViewProps {
  data: ProjectPerformance[];
  chartConfig: any;
}

const ProjectChartsView = ({ data, chartConfig }: ProjectChartsViewProps) => {
  const pieData = data.map((project, index) => ({
    name: project.project_name,
    value: project.tasks_completed,
    color: `hsl(${(index * 60) % 360}, 70%, 50%)`
  }));

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Tareas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Proporción de tareas por proyecto
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparación de Métricas</CardTitle>
            <p className="text-sm text-muted-foreground">
              Eficiencia vs Tareas completadas
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.slice(0, 5)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="project_name" 
                    tick={{ fontSize: 12 }}
                    width={100}
                  />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="efficiency"
                    fill="var(--color-efficiency)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tareas Completadas por Proyecto</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis 
                  type="category" 
                  dataKey="project_name" 
                  tick={{ fontSize: 12 }}
                  width={120}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="tasks_completed"
                  fill="var(--color-tasks_completed)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default ProjectChartsView;
