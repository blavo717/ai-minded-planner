
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, BarChart3, TrendingUp, Clock, Target, Download, Timer, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import ProductivityOverview from '@/components/Analytics/ProductivityOverview';
import TaskCompletionChart from '@/components/Analytics/TaskCompletionChart';
import TimeDistributionChart from '@/components/Analytics/TimeDistributionChart';
import ProductivityHeatmap from '@/components/Analytics/ProductivityHeatmap';
import ReportGenerator from '@/components/Analytics/ReportGenerator';
import WorkPatternsAnalysis from '@/components/Analytics/WorkPatternsAnalysis';
import TimeMetricsDashboard from '@/components/Analytics/TimeMetricsDashboard';
import TaskSessionLogger from '@/components/Analytics/TaskSessionLogger';
import TestDataGenerator from '@/components/Analytics/TestDataGenerator';
import KPIDashboard from '@/components/Analytics/KPIDashboard';
import TaskLevelAnalytics from '@/components/Analytics/TaskLevelAnalytics';
import GeneralStatsOverview from '@/components/Analytics/GeneralStatsOverview';
import InventoryVsActivity from '@/components/Analytics/InventoryVsActivity';
import RealProjectPerformance from '@/components/Analytics/RealProjectPerformance';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const { isLoading } = useAnalytics();
  const { data: generalStats } = useGeneralStats();

  const periodOptions = [
    { value: 'week', label: 'Última semana' },
    { value: 'month', label: 'Último mes' },
    { value: 'quarter', label: 'Último trimestre' },
    { value: 'year', label: 'Último año' },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Mostrar advertencia si no hay datos
  const showDataWarning = !generalStats?.hasAnyData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Análisis detallado de tu productividad y patrones de trabajo
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(option.value as any)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Advertencia de datos insuficientes */}
      {showDataWarning && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Datos Insuficientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Parece que aún no tienes suficientes datos para generar analytics detallados. 
              Algunas secciones pueden aparecer vacías o con información limitada.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                Crear Proyecto
              </Button>
              <Button size="sm" variant="outline">
                Añadir Tareas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Tiempo
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Sesiones
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Patrones
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <GeneralStatsOverview />
          <InventoryVsActivity />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <KPIDashboard period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <ProductivityOverview period={selectedPeriod} />
          <div className="grid gap-6 lg:grid-cols-2">
            <TaskCompletionChart period={selectedPeriod} />
            <TimeDistributionChart period={selectedPeriod} />
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <TimeMetricsDashboard period={selectedPeriod} />
          <ProductivityHeatmap period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <TaskLevelAnalytics period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <TaskSessionLogger />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <WorkPatternsAnalysis period={selectedPeriod} />
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <RealProjectPerformance />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
