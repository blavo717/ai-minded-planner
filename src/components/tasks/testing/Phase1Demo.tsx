
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Users, 
  CheckSquare, 
  Zap, 
  Bell,
  GitBranch,
  Play
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProfiles } from '@/hooks/useProfiles';
import { useTasksContext } from '../providers/TasksProvider';
import CreateTaskModal from '@/components/modals/CreateTaskModal';
import { useProjects } from '@/hooks/useProjects';
import TaskCreatorModal from '../subtasks/TaskCreatorModal';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { toast } from '@/hooks/use-toast';

const Phase1Demo = () => {
  const { mainTasks, getSubtasksForTask, getMicrotasksForSubtask } = useTasks();
  const { profiles } = useProfiles();
  const { projects } = useProjects();
  const { createTask, createMicrotask, isCreatingTask } = useTaskMutations();
  const { setIsCreateTaskOpen, isCreateTaskOpen } = useTasksContext();
  
  const [isDemoSubtaskModalOpen, setIsDemoSubtaskModalOpen] = useState(false);
  const [isDemoMicrotaskModalOpen, setIsDemoMicrotaskModalOpen] = useState(false);
  const [selectedDemoTask, setSelectedDemoTask] = useState<string | null>(null);

  // Demo: Crear tarea con asignación
  const demoCreateTaskWithAssignment = () => {
    setIsCreateTaskOpen(true);
    toast({
      title: "Demo: Crear Tarea",
      description: "Abre el modal para crear una nueva tarea con asignación de persona",
    });
  };

  // Demo: Crear subtarea
  const demoCreateSubtask = (taskId: string) => {
    setSelectedDemoTask(taskId);
    setIsDemoSubtaskModalOpen(true);
    toast({
      title: "Demo: Crear Subtarea",
      description: "Modal completo para crear subtarea con opciones avanzadas",
    });
  };

  // Demo: Crear microtarea
  const demoCreateMicrotask = (subtaskId: string) => {
    setSelectedDemoTask(subtaskId);
    setIsDemoMicrotaskModalOpen(true);
    toast({
      title: "Demo: Crear Microtarea",
      description: "Modal para crear microtarea con todas las opciones",
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
      createMicrotask(selectedDemoTask, data.title, data.description);
      
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="create-task">Crear Tarea</TabsTrigger>
              <TabsTrigger value="assign">Asignar</TabsTrigger>
              <TabsTrigger value="subtasks">Subtareas</TabsTrigger>
              <TabsTrigger value="microtasks">Microtareas</TabsTrigger>
              <TabsTrigger value="hierarchy">Jerarquía</TabsTrigger>
            </TabsList>

            <TabsContent value="create-task" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Tarea Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Prueba crear una nueva tarea con todas las opciones disponibles
                  </p>
                  
                  <Button 
                    onClick={demoCreateTaskWithAssignment}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Abrir Modal de Crear Tarea
                  </Button>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium mb-2">Qué probar:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Título y descripción</li>
                      <li>• Selección de prioridad</li>
                      <li>• Asignación de persona (nuevo!)</li>
                      <li>• Selección de rol en la tarea</li>
                      <li>• Fecha límite y duración</li>
                      <li>• Etiquetas</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Asignación de Personas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Perfiles Disponibles</h4>
                      <div className="space-y-2">
                        {compatibleProfiles.length > 0 ? (
                          compatibleProfiles.slice(0, 3).map((profile) => (
                            <div key={profile.id} className="flex items-center gap-2 p-2 border rounded">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                {profile.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{profile.full_name}</p>
                                <p className="text-xs text-muted-foreground">{profile.email}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No hay perfiles disponibles</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Roles Disponibles</h4>
                      <div className="space-y-1">
                        {['Responsable', 'Revisor', 'Colaborador', 'Observador'].map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded">
                    <h4 className="font-medium mb-2 text-green-800">✓ Funcionalidad Implementada:</h4>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>• Selector de personas en CreateTaskModal</li>
                      <li>• Roles específicos para cada asignación</li>
                      <li>• Creación automática en task_assignments</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subtasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Subtareas con Modal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Prueba crear subtareas usando el nuevo modal completo
                  </p>
                  
                  {mainTasks.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Tareas disponibles para crear subtareas:</h4>
                      {mainTasks.slice(0, 3).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {getSubtasksForTask(task.id).length} subtareas
                            </p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => demoCreateSubtask(task.id)}
                          >
                            + Subtarea
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Primero crea una tarea principal
                      </p>
                      <Button onClick={demoCreateTaskWithAssignment}>
                        Crear Tarea Principal
                      </Button>
                    </div>
                  )}
                  
                  <div className="bg-blue-50 p-3 rounded">
                    <h4 className="font-medium mb-2 text-blue-800">Mejoras Implementadas:</h4>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li>• Modal completo con todos los campos</li>
                      <li>• Título, descripción, prioridad, duración</li>
                      <li>• No más creación automática vacía</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="microtasks" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Microtareas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Prueba crear microtareas desde las subtareas existentes
                  </p>
                  
                  {mainTasks.some(task => getSubtasksForTask(task.id).length > 0) ? (
                    <div className="space-y-3">
                      <h4 className="font-medium">Subtareas disponibles para microtareas:</h4>
                      {mainTasks.flatMap(task => 
                        getSubtasksForTask(task.id).slice(0, 3).map(subtask => (
                          <div key={subtask.id} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <p className="font-medium">{subtask.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {getMicrotasksForSubtask(subtask.id).length} microtareas
                              </p>
                            </div>
                            <Button 
                              size="sm"
                              onClick={() => demoCreateMicrotask(subtask.id)}
                            >
                              + Microtarea
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Primero crea algunas subtareas
                      </p>
                      <Button 
                        onClick={() => mainTasks.length > 0 && demoCreateSubtask(mainTasks[0].id)}
                        disabled={mainTasks.length === 0}
                      >
                        {mainTasks.length > 0 ? 'Crear Subtarea' : 'Crea una tarea primero'}
                      </Button>
                    </div>
                  )}
                  
                  <div className="bg-purple-50 p-3 rounded">
                    <h4 className="font-medium mb-2 text-purple-800">Funcionalidad Restaurada:</h4>
                    <ul className="text-sm space-y-1 text-purple-700">
                      <li>• Creación de microtareas desde subtareas</li>
                      <li>• Modal completo con opciones</li>
                      <li>• Jerarquía de 3 niveles funcional</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hierarchy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    Jerarquía de Tareas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-blue-600">{mainTasks.length}</span>
                      </div>
                      <h4 className="font-medium">Tareas Principales</h4>
                      <p className="text-sm text-muted-foreground">Nivel 1</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-green-600">
                          {mainTasks.reduce((acc, task) => acc + getSubtasksForTask(task.id).length, 0)}
                        </span>
                      </div>
                      <h4 className="font-medium">Subtareas</h4>
                      <p className="text-sm text-muted-foreground">Nivel 2</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-2xl font-bold text-purple-600">
                          {mainTasks.reduce((acc, task) => 
                            acc + getSubtasksForTask(task.id).reduce((subAcc, subtask) => 
                              subAcc + getMicrotasksForSubtask(subtask.id).length, 0
                            ), 0
                          )}
                        </span>
                      </div>
                      <h4 className="font-medium">Microtareas</h4>
                      <p className="text-sm text-muted-foreground">Nivel 3</p>
                    </div>
                  </div>
                  
                  {mainTasks.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Ejemplo de Jerarquía:</h4>
                      {mainTasks.slice(0, 2).map((task) => {
                        const subtasks = getSubtasksForTask(task.id);
                        return (
                          <div key={task.id} className="border rounded p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-blue-100 text-blue-800">Tarea</Badge>
                              <span className="font-medium">{task.title}</span>
                            </div>
                            
                            {subtasks.length > 0 && (
                              <div className="ml-4 space-y-2">
                                {subtasks.slice(0, 2).map((subtask) => {
                                  const microtasks = getMicrotasksForSubtask(subtask.id);
                                  return (
                                    <div key={subtask.id}>
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge className="bg-green-100 text-green-800">Subtarea</Badge>
                                        <span className="text-sm">{subtask.title}</span>
                                      </div>
                                      
                                      {microtasks.length > 0 && (
                                        <div className="ml-4 space-y-1">
                                          {microtasks.slice(0, 2).map((microtask) => (
                                            <div key={microtask.id} className="flex items-center gap-2">
                                              <Badge className="bg-purple-100 text-purple-800">Microtarea</Badge>
                                              <span className="text-xs">{microtask.title}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
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
