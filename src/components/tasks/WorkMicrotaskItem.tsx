import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Zap, Play, CheckCircle, Circle, MoreHorizontal, Check, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import MicrotaskWorkField from './MicrotaskWorkField';
import MicrotaskTrackRecord from './MicrotaskTrackRecord';
import TaskLogIcon from './TaskLogIcon';

interface WorkMicrotaskItemProps {
  microtask: Task;
  isLast?: boolean;
}

const WorkMicrotaskItem: React.FC<WorkMicrotaskItemProps> = ({ microtask, isLast }) => {
  const { updateTask, deleteTask } = useTaskMutations();
  const navigate = useNavigate();
  const [isActiveWork, setIsActiveWork] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleToggleMicrotask = (completed: boolean) => {
    updateTask({
      id: microtask.id,
      status: completed ? 'completed' : 'pending',
      completed_at: completed ? new Date().toISOString() : undefined
    });
  };

  const handleWorkOnMicrotask = () => {
    navigate(`/work/${microtask.id}`);
  };

  const getStatusColor = () => {
    if (microtask.status === 'completed') return 'text-green-600';
    if (microtask.status === 'in_progress') return 'text-blue-600';
    return 'text-muted-foreground';
  };

  const getStatusIcon = () => {
    if (microtask.status === 'completed') {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
    return <Circle className="w-3 h-3 text-muted-foreground" />;
  };

  const canWork = microtask.status !== 'completed';

  const handleDoubleClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      setEditTitle(microtask.title);
    }
  };

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle.trim() !== microtask.title) {
      updateTask({
        id: microtask.id,
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
    setEditTitle(microtask.title);
  };

  const handleDelete = async () => {
    try {
      await deleteTask(microtask.id);
      toast({
        title: "Microtarea eliminada",
        description: "La microtarea se ha eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la microtarea",
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
      {/* Línea conectora de microtarea */}
      <div className="absolute -left-4 top-3 w-3 h-px bg-muted"></div>
      
      <div className={`flex items-center gap-3 p-2 rounded-md border transition-all hover:bg-muted/30 group ${
        microtask.status === 'completed' 
          ? 'bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-800' 
          : microtask.status === 'in_progress'
          ? 'bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-800'
          : 'bg-background border-border hover:border-primary/20'
      }`}>
        
        {/* Checkbox para completar */}
        <Checkbox
          checked={microtask.status === 'completed'}
          onCheckedChange={(checked) => handleToggleMicrotask(checked as boolean)}
          className="h-3 w-3 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
        />
        
        {/* Icono de microtarea */}
        <Zap className="w-3 h-3 text-yellow-500 flex-shrink-0" />
        
        {/* Contenido de la microtarea */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-5 text-xs"
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
                className="h-5 w-5 p-0"
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-5 w-5 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <p 
                className={`text-xs font-medium truncate cursor-pointer hover:text-blue-600 ${
                  microtask.status === 'completed' 
                    ? 'text-muted-foreground line-through' 
                    : 'text-foreground'
                }`}
                onDoubleClick={handleDoubleClick}
                title="Doble clic para editar"
              >
                {microtask.title}
              </p>
              {microtask.description && (
                <p className="text-xs text-muted-foreground truncate opacity-75">
                  {microtask.description}
                </p>
              )}
            </>
          )}
        </div>

        {/* Estado y acciones */}
        <div className="flex items-center gap-2">
          {/* Indicador de estado */}
          {getStatusIcon()}
          
          <TaskLogIcon 
            taskId={microtask.id} 
            className="h-3 w-3"
          />
          
          {/* Botón para trabajar */}
          {canWork && !isEditing && (
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsActiveWork(!isActiveWork)}
                className={`h-6 px-2 text-xs ${
                  isActiveWork ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10'
                }`}
              >
                <Play className="w-2 h-2 mr-1" />
                {isActiveWork ? 'Trabajando' : 'Trabajar aquí'}
              </Button>
            </div>
          )}
          
          {/* Badge de estado */}
          {!isEditing && microtask.status === 'completed' && (
            <Badge variant="outline" className="text-xs h-5 px-1">
              ✓
            </Badge>
          )}
          {!isEditing && microtask.status === 'in_progress' && (
            <Badge variant="secondary" className="text-xs h-5 px-1">
              🔄
            </Badge>
          )}

          {/* Dropdown menu */}
          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 bg-white shadow-lg border z-50">
                  <div className="flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActionAndClose(handleEdit)}
                      className="justify-start h-6 px-2 rounded-none hover:bg-gray-100 text-left text-xs"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleActionAndClose(handleDelete)}
                      className="justify-start h-6 px-2 rounded-none hover:bg-gray-100 text-left text-xs text-red-600 hover:text-red-700"
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
      
      {/* Campo de trabajo específico */}
      {(canWork && isActiveWork) && (
        <MicrotaskWorkField 
          microtask={microtask}
          showByDefault={isActiveWork}
        />
      )}

      {/* Track records siempre visibles cuando hay trabajo activo */}
      {isActiveWork && (
        <MicrotaskTrackRecord microtask={microtask} />
      )}
    </div>
  );
};

export default WorkMicrotaskItem;