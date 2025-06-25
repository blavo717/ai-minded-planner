
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Task, UpdateTaskData } from '@/hooks/useTasks';
import { useTaskMutations } from '@/hooks/useTaskMutations';

interface Project {
  id: string;
  name: string;
  color?: string;
}

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projects: Project[];
}

const EditTaskModal = ({ isOpen, onClose, task, projects }: EditTaskModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'pending' as 'pending' | 'in_progress' | 'completed' | 'cancelled',
    due_date: null as Date | null,
    estimated_duration: '',
    tags: [] as string[],
  });
  
  const [newTag, setNewTag] = useState('');
  const { updateTask, isUpdatingTask } = useTaskMutations();

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        project_id: task.project_id || '',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date ? new Date(task.due_date) : null,
        estimated_duration: task.estimated_duration?.toString() || '',
        tags: task.tags || [],
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData: UpdateTaskData = {
      id: task.id,
      title: formData.title,
      description: formData.description || undefined,
      project_id: formData.project_id || undefined,
      priority: formData.priority,
      status: formData.status,
      due_date: formData.due_date?.toISOString() || undefined,
      estimated_duration: formData.estimated_duration ? parseInt(formData.estimated_duration) : undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
    };

    if (formData.status === 'completed' && task.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    updateTask(updateData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarea</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la tarea"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la tarea"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'pending' | 'in_progress' | 'completed' | 'cancelled') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Proyecto</Label>
            <Select
              value={formData.project_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proyecto (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin proyecto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color || '#3B82F6' }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de vencimiento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? (
                      format(formData.due_date, 'PPP', { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date || null }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_duration">Duración estimada (min)</Label>
              <Input
                id="estimated_duration"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: e.target.value }))}
                placeholder="60"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Añadir etiqueta"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Añadir
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.title.trim() || isUpdatingTask}>
              {isUpdatingTask ? 'Actualizando...' : 'Actualizar Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
