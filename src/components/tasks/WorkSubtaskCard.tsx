import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Circle, Play, ChevronDown, ChevronRight, Plus, Check, Save } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import WorkMicrotaskItem from './WorkMicrotaskItem';
import MicrotaskCreator from './microtasks/MicrotaskCreator';
import SubtaskWorkField from './SubtaskWorkField';
import SubtaskTrackRecord from './SubtaskTrackRecord';
import { useSubtaskTrackRecords } from '@/hooks/useSubtaskTrackRecords';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface WorkSubtaskCardProps {
  subtask: Task;
  isLast?: boolean;
}

const WorkSubtaskCard: React.FC<WorkSubtaskCardProps> = ({ subtask, isLast }) => {
  const { microtasks } = useTasks();
  const { createTask } = useTaskMutations();
  const { trackRecords } = useSubtaskTrackRecords({ subtaskId: subtask.id });
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isActiveWork, setIsActiveWork] = useState(false);

  // Obtener microtareas de esta subtarea
  const subtaskMicrotasks = microtasks.filter(m => m.parent_task_id === subtask.id);
  const completedMicrotasks = subtaskMicrotasks.filter(m => m.status === 'completed').length;
  
  // Calcular progreso de la subtarea
  const subtaskProgress = subtaskMicrotasks.length > 0 
    ? Math.round((completedMicrotasks / subtaskMicrotasks.length) * 100)
    : (subtask.status === 'completed' ? 100 : 0);

  // Verificar si la subtarea ha sido iniciada (tiene microtareas en progreso o track records)
  const hasBeenStarted = subtaskProgress > 0 || trackRecords.length > 0;

  const handleWorkOnSubtask = () => {
    setIsActiveWork(!isActiveWork);
  };

  const getStatusColor = () => {
    if (subtask.status === 'completed' || subtaskProgress === 100) return 'stroke-green-600';
    if (subtask.status === 'in_progress') return 'stroke-blue-600';
    if (hasBeenStarted) return 'stroke-orange-600';
    return 'stroke-slate-500';
  };

  const getStatusLabel = () => {
    if (subtask.status === 'completed' || subtaskProgress === 100) return 'Completado';
    if (subtask.status === 'in_progress') return 'En Progreso';
    if (hasBeenStarted) return 'Iniciado';
    return 'Pendiente';
  };

  const handleSaveSession = () => {
    // Función para guardar sesión sin completar la tarea
    console.log('Guardando sesión para subtarea:', subtask.id);
  };

  const canWork = subtask.status !== 'completed' && subtaskProgress !== 100;

  const handleCreateMicrotask = async (title: string) => {
    try {
      await createTask({
        title,
        parent_task_id: subtask.id,
        project_id: subtask.project_id,
        status: 'pending',
        priority: 'medium',
        task_level: 3 as 1 | 2 | 3
      });
    } catch (error) {
      console.error('Error creating microtask:', error);
    }
  };

  return (
    <div className="relative">
      {/* Línea conectora */}
      <div className="absolute -left-6 top-6 w-4 h-px bg-primary/30"></div>
      
      <Card className={`border-l-4 transition-all hover:shadow-md ${
        subtask.status === 'completed' || subtaskProgress === 100
          ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : subtask.status === 'in_progress'
          ? 'border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
          : hasBeenStarted
          ? 'border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
          : 'border-l-slate-400 bg-slate-50/30 dark:bg-slate-950/20'
      }`}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                {subtask.status === 'completed' || subtaskProgress === 100 ? (
                  <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <Circle className={`w-5 h-5 ${getStatusColor()}`} />
                )}
                
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {subtask.title}
                  </CardTitle>
                  {subtask.description && isExpanded && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {subtask.description}
                    </p>
                  )}
                </div>
              </div>
              
               <div className="flex items-center gap-2">
                 <Badge variant="outline" className={`text-xs ${
                   subtask.status === 'completed' || subtaskProgress === 100 ? 'text-green-700 border-green-300' : ''
                 }`}>
                   {getStatusLabel()}
                 </Badge>
                 <Badge variant="secondary" className="text-xs">
                   {subtaskProgress}%
                 </Badge>
                 {canWork && (
                   <>
                     <Button 
                       size="sm" 
                       onClick={handleWorkOnSubtask}
                       className={`h-7 px-3 text-xs ${
                         isActiveWork ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'
                       }`}
                     >
                       <Play className="w-3 h-3 mr-1" />
                       {isActiveWork ? 'Trabajando' : 'Trabajar aquí'}
                     </Button>
                     {isActiveWork && (
                       <Button 
                         size="sm" 
                         variant="outline"
                         onClick={handleSaveSession}
                         className="h-7 px-3 text-xs text-green-700 border-green-300 hover:bg-green-50"
                       >
                         <Save className="w-3 h-3 mr-1" />
                         Guardar Sesión
                       </Button>
                     )}
                   </>
                 )}
               </div>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              {/* Progress bar de la subtarea */}
              {subtaskMicrotasks.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>Progreso de microtareas</span>
                    <span>{completedMicrotasks}/{subtaskMicrotasks.length}</span>
                  </div>
                  <Progress value={subtaskProgress} className="h-1.5 [&>div]:bg-green-600" />
                </div>
              )}

              {/* Lista de microtareas */}
              <div className="space-y-2 pl-4 border-l-2 border-dashed border-muted">
                {subtaskMicrotasks.length > 0 ? (
                  subtaskMicrotasks.map((microtask, index) => (
                    <WorkMicrotaskItem 
                      key={microtask.id}
                      microtask={microtask}
                      isLast={index === subtaskMicrotasks.length - 1}
                    />
                  ))
                ) : (
                  <div className="py-3 text-center text-muted-foreground">
                    <p className="text-xs">Sin microtareas</p>
                    <p className="text-xs opacity-75">Divide en pasos más pequeños</p>
                  </div>
                )}
              </div>

              {/* Crear nueva microtarea */}
              <div className="mt-3 pl-4">
                <MicrotaskCreator onCreateMicrotask={handleCreateMicrotask} />
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Campo de trabajo específico para subtarea */}
      {(canWork && isActiveWork) && (
        <div className="mt-4 pl-6">
          <div className="border border-border/40 rounded-md p-4 bg-background/50">
            <SubtaskWorkField 
              subtask={subtask}
              showByDefault={isActiveWork}
            />
            
            {/* Track records dentro del contenedor */}
            <SubtaskTrackRecord subtask={subtask} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSubtaskCard;