
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import QuickActions from '@/components/Dashboard/QuickActions';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import AIAnalysisPanel from '@/components/AI/AIAnalysisPanel';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import TaskList from '@/components/Dashboard/TaskList';
import ProjectOverview from '@/components/Dashboard/ProjectOverview';
import { Brain, BarChart3, CheckSquare, FolderOpen, TrendingUp, Users, Calendar, Clock } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';

const Index = () => {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { projects, isLoading: projectsLoading } = useProjects();

  // Calculate real stats from data
  const completedTasksThisWeek = tasks.filter(task => {
    if (task.status !== 'completed' || !task.completed_at) return false;
    const completedDate = new Date(task.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate >= weekAgo;
  }).length;

  const activeProjects = projects.filter(project => {
    // A project is active if it has incomplete tasks
    return tasks.some(task => task.project_id === project.id && task.status !== 'completed');
  }).length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const productivityPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get unique collaborators (users who have tasks assigned)
  const collaborators = new Set(tasks.map(task => task.user_id)).size;

  const statsData = [
    {
      title: "Tareas Completadas",
      value: completedTasksThisWeek.toString(),
      icon: CheckSquare,
      description: "Esta semana"
    },
    {
      title: "Proyectos Activos",
      value: activeProjects.toString(),
      icon: FolderOpen,
      description: "En progreso"
    },
    {
      title: "Productividad",
      value: `${productivityPercentage}%`,
      icon: TrendingUp,
      description: "Meta mensual"
    },
    {
      title: "Colaboradores",
      value: collaborators.toString(),
      icon: Users,
      description: "Equipo activo"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Calendar className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      default: return status;
    }
  };

  if (tasksLoading || projectsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-16 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            {statsData.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {stat.description && (
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <TaskList 
                tasks={tasks} 
                title="Tareas Recientes"
                maxItems={5}
              />
              <QuickActions />
            </div>
            <div className="space-y-6">
              <ProjectOverview 
                projects={projects}
                tasks={tasks}
                maxItems={4}
              />
              <ProductivityTimer />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          {/* Tasks Tab Content */}
          <TaskList 
            tasks={tasks} 
            title="Todas las Tareas"
          />
        </TabsContent>

        <TabsContent value="projects">
          {/* Projects Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Todos los Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay proyectos para mostrar
                </p>
              ) : (
                <div className="space-y-3">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div 
                          className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="flex-1 space-y-1">
                          <h4 className="font-medium">{project.name}</h4>
                          {project.description && (
                            <p className="text-sm text-muted-foreground">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
