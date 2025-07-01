
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Flag, FolderOpen, Tag, Edit, Save, X } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { Project } from '@/hooks/useProjects';
import { useTaskMutations } from '@/hooks/useTaskMutations';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TaskBasicInfoProps {
  task: Task;
  project?: Project;
}

const TaskBasicInfo = ({ task, project }: TaskBasicInfoProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  
  const { updateTask } = useTaskMutations();

  const handleSaveTitle = () => {
    if (editTitle.trim() !== task.title) {
      updateTask({ id: task.id, title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (editDescription !== (task.description || '')) {
      updateTask({ id: task.id, description: editDescription });
    }
    setIsEditingDescription(false);
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Sin definir';
    }
  };

  const getStatusLabel = () => {
    switch (task.status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Sin definir';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Título de la Tarea</CardTitle>
            {!isEditingTitle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingTitle(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditTitle(task.title);
                    setIsEditingTitle(false);
                  }
                }}
              />
              <Button size="sm" onClick={handleSaveTitle} className="h-8 w-8 p-0">
                <Save className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setEditTitle(task.title);
                  setIsEditingTitle(false);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h3 className="text-xl font-medium">{task.title}</h3>
          )}
        </CardContent>
      </Card>

      {/* Estado y Metadatos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Estado y Prioridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <Badge className={getStatusColor()}>
                {getStatusLabel()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Prioridad:</span>
              <Badge className={getPriorityColor()}>
                {getPriorityLabel()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Creada:</span>
              <span className="text-sm">
                {format(new Date(task.created_at), 'PPP', { locale: es })}
              </span>
            </div>
            {task.due_date && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vence:</span>
                <span className="text-sm">
                  {format(new Date(task.due_date), 'PPP', { locale: es })}
                </span>
              </div>
            )}
            {task.completed_at && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Completada:</span>
                <span className="text-sm">
                  {format(new Date(task.completed_at), 'PPP', { locale: es })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Proyecto y Duración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {project && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                />
                <span className="font-medium">{project.name}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {task.estimated_duration && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duración Estimada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-lg font-medium">{task.estimated_duration} minutos</span>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Descripción */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Descripción</CardTitle>
            {!isEditingDescription && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingDescription(true)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingDescription ? (
            <div className="space-y-2">
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                placeholder="Añadir descripción..."
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveDescription}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    setEditDescription(task.description || '');
                    setIsEditingDescription(false);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[80px]">
              {task.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              ) : (
                <p className="text-gray-400 italic">No hay descripción</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etiquetas */}
      {task.tags && task.tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Etiquetas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TaskBasicInfo;
