
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Brain } from 'lucide-react';
import { CheckCircle, Clock, AlertTriangle, FolderOpen } from 'lucide-react';
import StatsCard from '@/components/Dashboard/StatsCard';
import TaskList from '@/components/Dashboard/TaskList';
import ProjectOverview from '@/components/Dashboard/ProjectOverview';
import QuickActions from '@/components/Dashboard/QuickActions';
import MainLayout from '@/components/Layout/MainLayout';

const Index = () => {
  const { user } = useAuth();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { projects, isLoading: projectsLoading } = useProjects();

  const isLoading = tasksLoading || projectsLoading;

  // Calculate statistics
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const totalProjects = projects.length;

  // Get recent and upcoming tasks
  const recentTasks = tasks.slice(0, 5);
  const upcomingTasks = tasks
    .filter(task => task.due_date && new Date(task.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Cargando tu AI Planner...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Bienvenido de vuelta!
          </h2>
          <p className="text-gray-600">
            Aquí tienes un resumen de tu productividad y tareas pendientes.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Tareas Pendientes"
            value={pendingTasks}
            icon={Clock}
            description="Tareas por completar"
            className="border-l-4 border-l-orange-500"
          />
          <StatsCard
            title="Tareas Completadas"
            value={completedTasks}
            icon={CheckCircle}
            description="Tareas finalizadas"
            className="border-l-4 border-l-green-500"
          />
          <StatsCard
            title="En Progreso"
            value={inProgressTasks}
            icon={AlertTriangle}
            description="Tareas en desarrollo"
            className="border-l-4 border-l-blue-500"
          />
          <StatsCard
            title="Proyectos Activos"
            value={totalProjects}
            icon={FolderOpen}
            description="Proyectos en curso"
            className="border-l-4 border-l-purple-500"
          />
        </div>

        {/* Dashboard Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <TaskList
              tasks={recentTasks}
              title="Tareas Recientes"
              maxItems={8}
            />
            
            {upcomingTasks.length > 0 && (
              <TaskList
                tasks={upcomingTasks}
                title="Próximas Tareas"
                maxItems={5}
              />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <QuickActions />
            <ProjectOverview
              projects={projects}
              tasks={tasks}
              maxItems={6}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
