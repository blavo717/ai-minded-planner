
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectMutations } from '@/hooks/useProjectMutations';
import { Project } from '@/hooks/useProjects';
import { CheckCircle, Archive, Pause, Play } from 'lucide-react';

const statusSchema = z.object({
  status: z.enum(['active', 'completed', 'archived', 'on_hold']),
  completion_notes: z.string().optional(),
});

type StatusFormData = z.infer<typeof statusSchema>;

interface ProjectStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const statusOptions = [
  { value: 'active', label: 'Activo', icon: Play, description: 'Proyecto en desarrollo' },
  { value: 'completed', label: 'Completado', icon: CheckCircle, description: 'Proyecto finalizado exitosamente' },
  { value: 'on_hold', label: 'En pausa', icon: Pause, description: 'Proyecto pausado temporalmente' },
  { value: 'archived', label: 'Archivado', icon: Archive, description: 'Proyecto archivado' },
];

const ProjectStatusModal = ({ isOpen, onClose, project }: ProjectStatusModalProps) => {
  const { updateProject, isUpdatingProject } = useProjectMutations();

  const form = useForm<StatusFormData>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: project?.status || 'active',
      completion_notes: project?.completion_notes || '',
    },
  });

  React.useEffect(() => {
    if (project) {
      form.reset({
        status: project.status || 'active',
        completion_notes: project.completion_notes || '',
      });
    }
  }, [project, form]);

  const onSubmit = (data: StatusFormData) => {
    if (!project) return;

    const updateData: any = {
      id: project.id,
      status: data.status,
      completion_notes: data.completion_notes,
    };

    // Set completion/archive timestamps based on status
    if (data.status === 'completed' && project.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (data.status !== 'completed') {
      updateData.completed_at = null;
    }

    if (data.status === 'archived' && project.status !== 'archived') {
      updateData.archived_at = new Date().toISOString();
    } else if (data.status !== 'archived') {
      updateData.archived_at = null;
    }

    updateProject(updateData);
    onClose();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Proyecto</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado del Proyecto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {option.description}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="completion_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas sobre el cambio de estado (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdatingProject}>
                {isUpdatingProject ? 'Actualizando...' : 'Actualizar Estado'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectStatusModal;
