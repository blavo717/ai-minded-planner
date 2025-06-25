
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import QuickActions from '@/components/Dashboard/QuickActions';
import ProductivityTimer from '@/components/AI/ProductivityTimer';
import AIAnalysisPanel from '@/components/AI/AIAnalysisPanel';
import ProductivityInsights from '@/components/AI/ProductivityInsights';
import { Brain, BarChart3, CheckSquare, FolderOpen, TrendingUp, Users, Calendar, Clock } from 'lucide-react';

const Index = () => {
  // Mock data for stats
  const statsData = [
    {
      title: "Tareas Completadas",
      value: "12",
      icon: CheckSquare,
      description: "Esta semana"
    },
    {
      title: "Proyectos Activos",
      value: "3",
      icon: FolderOpen,
      description: "En progreso"
    },
    {
      title: "Productividad",
      value: "85%",
      icon: TrendingUp,
      description: "Meta mensual"
    },
    {
      title: "Colaboradores",
      value: "8",
      icon: Users,
      description: "Equipo activo"
    }
  ];

  // Mock tasks data
  const mockTasks = [
    {
      id: "1",
      title: "Revisar propuesta de proyecto",
      status: "pending" as const,
      priority: "high" as const,
      due_date: "2024-01-15",
      description: "Revisar y aprobar la propuesta del nuevo proyecto"
    },
    {
      id: "2", 
      title: "Llamada con cliente",
      status: "in_progress" as const,
      priority: "medium" as const,
      due_date: "2024-01-12",
      description: "Reunión semanal de seguimiento"
    },
    {
      id: "3",
      title: "Actualizar documentación",
      status: "completed" as const,
      priority: "low" as const,
      due_date: "2024-01-10",
      description: "Documentar nuevas funcionalidades"
    }
  ];

  // Mock projects data
  const mockProjects = [
    {
      id: "1",
      name: "Aplicación Web",
      description: "Desarrollo de nueva plataforma",
      color: "#3b82f6",
      created_at: "2024-01-01"
    },
    {
      id: "2",
      name: "Sistema CRM",
      description: "Implementación de CRM personalizado",
      color: "#10b981",
      created_at: "2023-12-15"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-500" />;
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
              {/* Tasks List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Tareas Recientes
                    <span className="text-sm font-normal text-muted-foreground">
                      {mockTasks.length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(task.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium truncate">{task.title}</h4>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              <QuickActions />
            </div>
            <div className="space-y-6">
              {/* Projects Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Proyectos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockProjects.map((project) => (
                      <div
                        key={project.id}
                        className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="w-4 h-4 rounded-full mt-0.5 flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium text-sm">{project.name}</h4>
                            {project.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <ProductivityTimer />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          {/* Tasks Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Todas las Tareas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockTasks.map((task) => (
                <div key={task.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {getStatusText(task.status)}
                      </Badge>
                      {task.due_date && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{task.due_date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          {/* Projects Tab Content */}
          <Card>
            <CardHeader>
              <CardTitle>Todos los Proyectos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockProjects.map((project) => (
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
