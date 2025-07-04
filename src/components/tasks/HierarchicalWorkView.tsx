import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ListTodo } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTasks } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import WorkSubtaskCard from './WorkSubtaskCard';
import CompactSubtaskCreator from './compact/CompactSubtaskCreator';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface HierarchicalWorkViewProps {
  task: Task;
  hierarchyData: {
    parentTask?: Task;
    children: Task[];
    siblings: Task[];
    totalHierarchy: Task[];
  };
}

const HierarchicalWorkView: React.FC<HierarchicalWorkViewProps> = ({
  task,
  hierarchyData
}) => {
  const { microtasks } = useTasks();
  const { createTask } = useTaskMutations();
  const navigate = useNavigate();
  const { children } = hierarchyData;
  
  // Estado para la creación de subtareas
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Estado para manejar expansión de subtareas
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  // Obtener subtareas (nivel 2)
  const subtasks = children.filter(child => child.task_level === 2);

  // Calcular progreso agregado de la tarea principal
  const calculateMainTaskProgress = () => {
    if (subtasks.length === 0) return 0;
    
    let totalProgress = 0;
    subtasks.forEach(subtask => {
      const subtaskMicrotasks = microtasks.filter(m => m.parent_task_id === subtask.id);
      if (subtaskMicrotasks.length > 0) {
        const completed = subtaskMicrotasks.filter(m => m.status === 'completed').length;
        totalProgress += (completed / subtaskMicrotasks.length) * 100;
      } else {
        totalProgress += subtask.status === 'completed' ? 100 : 0;
      }
    });
    
    return Math.round(totalProgress / subtasks.length);
  };

  const mainProgress = calculateMainTaskProgress();
  const completedSubtasks = subtasks.filter(s => s.status === 'completed').length;

  const handleWorkOnTask = () => {
    navigate(`/work/${task.id}`);
  };

  // Función para crear nueva subtarea
  const handleCreateSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      await createTask({
        title: newSubtaskTitle,
        parent_task_id: task.id,
        project_id: task.project_id,
        status: 'pending',
        priority: 'medium',
        task_level: 2 as 1 | 2 | 3
      });
      
      setNewSubtaskTitle('');
      setIsCreatingSubtask(false);
      
      toast({
        title: "Subtarea creada",
        description: "La subtarea se ha creado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la subtarea",
        variant: "destructive"
      });
    }
  };

  const handleCancelSubtask = () => {
    setNewSubtaskTitle('');
    setIsCreatingSubtask(false);
  };

  // Función para toggle expansión de subtareas
  const handleToggleSubtaskExpansion = (subtaskId: string) => {
    setExpandedSubtasks(prev => ({
      ...prev,
      [subtaskId]: !prev[subtaskId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header de la tarea principal */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ListTodo className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Nivel 1
              </Badge>
              <Badge variant="outline" className="text-xs">
                {mainProgress}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Barra de progreso principal */}
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Progreso General</span>
                <span>{completedSubtasks}/{subtasks.length} subtareas</span>
              </div>
              <Progress value={mainProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subtareas jerárquicas */}
      <div className="space-y-3 pl-6 border-l-2 border-primary/20">
        {subtasks.length > 0 ? (
          subtasks.map((subtask, index) => (
            <WorkSubtaskCard 
              key={subtask.id}
              subtask={subtask}
              isLast={index === subtasks.length - 1}
              isExpanded={expandedSubtasks[subtask.id] ?? true}
              onToggleExpanded={() => handleToggleSubtaskExpansion(subtask.id)}
            />
          ))
        ) : (
          <Card className="border-dashed border-2 border-muted">
            <CardContent className="py-8 text-center">
              <ListTodo className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">No hay subtareas creadas</p>
              <p className="text-xs text-muted-foreground mt-1">
                Divide esta tarea en subtareas más pequeñas
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Creador de subtareas */}
        <div className="mt-3">
          <CompactSubtaskCreator
            isCreating={isCreatingSubtask}
            newSubtaskTitle={newSubtaskTitle}
            onTitleChange={setNewSubtaskTitle}
            onCreate={handleCreateSubtask}
            onCancel={handleCancelSubtask}
            onStartCreating={() => setIsCreatingSubtask(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default HierarchicalWorkView;