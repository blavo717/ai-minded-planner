
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useTasksContext } from '../providers/TasksProvider';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import { useProjects } from '@/hooks/useProjects';
import TaskCreatorModal from '../subtasks/TaskCreatorModal';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { toast } from '@/hooks/use-toast';
import DemoCreateTaskSection from './DemoCreateTaskSection';
import DemoHierarchySection from './DemoHierarchySection';

const Phase1Demo = () => {
  const { mainTasks, getSubtasksForTask, getMicrotasksForSubtask } = useTasks();
  const { profiles } = useProfiles();
  const { projects } = useProjects();
  const { createTask, createMicrotask, isCreatingTask } = useTaskMutations();
  const { setIsCreateTaskOpen, isCreateTaskOpen } = useTasksContext();
  
  const [isDemoSubtaskModalOpen, setIsDemoSubtaskModalOpen] = useState(false);
  const [isDemoMicrotaskModalOpen, setIsDemoMicrotaskModalOpen] = useState(false);
  const [selectedDemoTask, setSelectedDemoTask] = useState<string | null>(null);

  const demoCreateTaskWithAssignment = () => {
    setIsCreateTaskOpen(true);
    toast({
      title: "Demo: Crear Tarea",
      description: "Abre el modal para crear una nueva tarea con asignación de persona",
    });
  };

  const handleDemoSubtaskCreate = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    if (data.title && selectedDemoTask) {
      createTask({
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        parent_task_id: selectedDemoTask,
        status: 'pending'
      });
      
      toast({
        title: "Subtarea creada",
        description: `Se ha creado la subtarea "${data.title}" exitosamente.`,
      });
    }
    setIsDemoSubtaskModalOpen(false);
    setSelectedDemoTask(null);
  };

  const handleDemoMicrotaskCreate = (data: { title?: string; description?: string; priority?: 'low' | 'medium' | 'high' | 'urgent'; estimated_duration?: number }) => {
    if (data.title && selectedDemoTask) {
      createMicrotask({ parentSubtaskId: selectedDemoTask, title: data.title });
      
      toast({
        title: "Microtarea creada",
        description: `Se ha creado la microtarea "${data.title}" exitosamente.`,
      });
    }
    setIsDemoMicrotaskModalOpen(false);
    setSelectedDemoTask(null);
  };

  const compatibleProfiles = profiles
    .filter(profile => profile.full_name)
    .map(profile => ({
      id: profile.id,
      full_name: profile.full_name!,
      email: profile.email || '',
      role: profile.role,
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Demo Práctico - Fase 1
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Prueba manualmente cada funcionalidad implementada en la Fase 1:
          </p>
          
          <Tabs defaultValue="create-task" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create-task">Crear Tarea</TabsTrigger>
              <TabsTrigger value="subtasks">Subtareas</TabsTrigger>
              <TabsTrigger value="hierarchy">Jerarquía</TabsTrigger>
            </TabsList>

            <TabsContent value="create-task" className="space-y-4">
              <DemoCreateTaskSection onCreateTask={demoCreateTaskWithAssignment} />
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4">
              {/* Contenido de subtareas simplificado */}
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Subtareas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Las subtareas y microtareas ahora se gestionan desde el componente principal de tareas.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hierarchy" className="space-y-4">
              <DemoHierarchySection 
                mainTasks={mainTasks}
                getSubtasksForTask={getSubtasksForTask}
                getMicrotasksForSubtask={getMicrotasksForSubtask}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projects={projects}
        profiles={compatibleProfiles}
      />

      <TaskCreatorModal
        isOpen={isDemoSubtaskModalOpen}
        onClose={() => {
          setIsDemoSubtaskModalOpen(false);
          setSelectedDemoTask(null);
        }}
        onCreateTask={handleDemoSubtaskCreate}
        isCreating={isCreatingTask}
        taskLevel="subtarea"
      />

      <TaskCreatorModal
        isOpen={isDemoMicrotaskModalOpen}
        onClose={() => {
          setIsDemoMicrotaskModalOpen(false);
          setSelectedDemoTask(null);
        }}
        onCreateTask={handleDemoMicrotaskCreate}
        isCreating={isCreatingTask}
        taskLevel="microtarea"
      />
    </div>
  );
};

export default Phase1Demo;
