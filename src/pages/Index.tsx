
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/Dashboard/StatsCard';
import TaskList from '@/components/Dashboard/TaskList';
import ProjectOverview from '@/components/Dashboard/ProjectOverview';
import QuickActions from '@/components/Dashboard/QuickActions';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import AIAnalysisPanel from '@/components/AI/AIAnalysisPanel';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import { Brain, BarChart3, CheckSquare, FolderOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido a tu espacio de trabajo inteligente
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tareas
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Proyectos
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard />
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <TaskList />
              <QuickActions />
            </div>
            <div className="space-y-6">
              <ProjectOverview />
              <ProductivityTimer />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskList />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectOverview />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <AIAnalysisPanel />
            <ProductivityInsights />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
