import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Circle, Play, ChevronDown, ChevronRight, Plus, Check, Save, MoreHorizontal, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { useTasks } from '@/hooks/useTasks';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import WorkMicrotaskItem from './WorkMicrotaskItem';
import MicrotaskCreator from './microtasks/MicrotaskCreator';
import SubtaskWorkField from './SubtaskWorkField';
import SubtaskTrackRecord from './SubtaskTrackRecord';
import { useSubtaskTrackRecords } from '@/hooks/useSubtaskTrackRecords';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskLogIcon from './TaskLogIcon';

interface WorkSubtaskCardProps {
  subtask: Task;
  isLast?: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

const WorkSubtaskCard: React.FC<WorkSubtaskCardProps> = ({ subtask, isLast, isExpanded, onToggleExpanded }) => {
  const { microtasks } = useTasks();
  const { createTask, updateTask, deleteTask } = useTaskMutations();
  const { trackRecords } = useSubtaskTrackRecords({ subtaskId: subtask.id });
  const navigate = useNavigate();
  const [isActiveWork, setIsActiveWork] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
    if (subtask.status === 'completed' || subtaskProgress === 100) return 'text-green-600';
    if (subtask.status === 'in_progress') return 'text-blue-600'; 
    if (hasBeenStarted) return 'text-orange-600';
    return 'text-slate-500';
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

  const handleTitleClick = () => {
    if (!isEditing) {
      setIsActiveWork(!isActiveWork);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== subtask.title) {
      updateTask({
        id: subtask.id,
        title: editTitle.trim()
      });
    }
    setIsEditing(false);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(subtask.title);
  };

  const handleDelete = async () => {
    // Check if subtask has microtasks
    if (subtaskMicrotasks.length > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Esta subtarea tiene microtareas. Elimínelas primero.",
        variant: "destructive"
      });
      return;
    }

    try {
      await deleteTask(subtask.id);
      toast({
        title: "Subtarea eliminada",
        description: "La subtarea se ha eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la subtarea",
        variant: "destructive"
      });
    }
  };

  const handleActionAndClose = (action: () => void) => {
    action();
    setDropdownOpen(false);
  };

  return (
    <div className="relative">
      {/* Línea conectora */}
      <div className="absolute -left-6 top-6 w-4 h-px bg-primary/30"></div>
      
      <Card className={`border-l-4 transition-all hover:shadow-md group ${
        subtask.status === 'completed' || subtaskProgress === 100
          ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : subtask.status === 'in_progress'
          ? 'border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
          : hasBeenStarted
          ? 'border-l-orange-500 bg-orange-50/30 dark:bg-orange-950/20'
          : 'border-l-slate-400 bg-slate-50/30 dark:bg-slate-950/20'
      }`}>
        <Collapsible open={isExpanded} onOpenChange={onToggleExpanded}>
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
                ) : hasBeenStarted ? (
                  <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center">
                    <Circle className="w-3 h-3 text-white" />
                  </div>
                ) : subtask.status === 'in_progress' ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <Circle className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-slate-500" />
                )}
                
                 <div className="flex-1">
                   {isEditing ? (
                     <div className="flex items-center gap-1">
                       <Input
                         value={editTitle}
                         onChange={(e) => setEditTitle(e.target.value)}
                         className="h-6 text-sm"
                         autoFocus
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') handleSaveTitle();
                           if (e.key === 'Escape') handleCancelEdit();
                         }}
                         onBlur={handleSaveTitle}
                       />
                       <Button
                         size="sm"
                         onClick={handleSaveTitle}
                         className="h-6 w-6 p-0"
                       >
                         <Check className="h-3 w-3" />
                       </Button>
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={handleCancelEdit}
                         className="h-6 w-6 p-0"
                       >
                         <X className="h-3 w-3" />
                       </Button>
                     </div>
                   ) : (
                     <>
                        <CardTitle 
                          className={`text-base flex items-center gap-2 cursor-pointer hover:text-blue-600 ${
                            isActiveWork ? 'text-primary' : ''
                          }`}
                          onClick={handleTitleClick}
                          title="Clic para trabajar"
                        >
                          {subtask.title}
                        </CardTitle>
                       {subtask.description && isExpanded && (
                         <p className="text-xs text-muted-foreground mt-1">
                           {subtask.description}
                         </p>
                       )}
                     </>
                   )}
                 </div>
              </div>
               
                <div className="flex items-center gap-2">
                  <TaskLogIcon 
                    taskId={subtask.id} 
                    className="h-4 w-4"
                  />
                  
                  {!isEditing && (
                    <>
                      <Badge variant="outline" className={`text-xs ${
                        subtask.status === 'completed' || subtaskProgress === 100 ? 'text-green-700 border-green-300' : ''
                      }`}>
                        {getStatusLabel()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {subtaskProgress}%
                      </Badge>
                    </>
                  )}
                  

                  {/* Dropdown menu */}
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white shadow-lg border z-50">
                          <div className="flex flex-col">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActionAndClose(handleEdit)}
                              className="justify-start h-7 px-2 rounded-none hover:bg-gray-100 text-left text-xs"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleActionAndClose(handleDelete)}
                              className="justify-start h-7 px-2 rounded-none hover:bg-gray-100 text-left text-xs text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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