
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { CreateProjectData, UpdateProjectData } from './useProjects';

export const useProjectMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          color: projectData.color || '#3B82F6',
          priority: projectData.priority || 'medium',
          progress: projectData.progress || 0,
          budget_used: 0,
          actual_hours: 0,
          custom_fields: projectData.custom_fields || {},
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (projectData: UpdateProjectData) => {
      const { id, ...updateData } = projectData;
      
      // Si hay un cambio de estado, registrar el timestamp
      if (updateData.status) {
        updateData.last_status_change = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Registrar en el historial si es necesario
      if (user) {
        await supabase
          .from('project_history')
          .insert({
            project_id: id,
            user_id: user.id,
            change_type: 'update',
            new_values: updateData,
            notes: updateData.change_reason || 'Proyecto actualizado',
          });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Proyecto actualizado",
        description: "El proyecto se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      console.log('=== INICIANDO ELIMINACIÓN DEL PROYECTO ===', projectId);
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // 1. Verificar que el proyecto pertenece al usuario
      console.log('Paso 1: Verificando permisos del proyecto...');
      const { data: project, error: projectCheckError } = await supabase
        .from('projects')
        .select('id, user_id, name')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectCheckError || !project) {
        console.error('Error al verificar proyecto:', projectCheckError);
        throw new Error('Proyecto no encontrado o sin permisos');
      }
      
      console.log(`Proyecto verificado: "${project.name}"`);

      // 2. Obtener todas las tareas del proyecto organizadas por jerarquía
      console.log('Paso 2: Obteniendo todas las tareas del proyecto...');
      const { data: allTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, parent_task_id, title, task_level')
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error al obtener tareas:', fetchError);
        throw fetchError;
      }

      if (!allTasks || allTasks.length === 0) {
        console.log('No hay tareas asociadas al proyecto');
        // Si no hay tareas, solo eliminar el proyecto
        const { error: projectDeleteError } = await supabase
          .from('projects')
          .delete()
          .eq('id', projectId)
          .eq('user_id', user.id);

        if (projectDeleteError) throw projectDeleteError;
        console.log('Proyecto eliminado exitosamente (sin tareas)');
        return;
      }

      const taskIds = allTasks.map(task => task.id);
      console.log(`Total de tareas encontradas: ${allTasks.length}`);

      // Separar tareas por jerarquía para eliminación ordenada
      const subtasks = allTasks.filter(task => task.parent_task_id !== null);
      const parentTasks = allTasks.filter(task => task.parent_task_id === null);
      
      console.log(`- Subtareas: ${subtasks.length}`);
      console.log(`- Tareas principales: ${parentTasks.length}`);

      // 3. Eliminar dependencias de tareas
      console.log('Paso 3: Eliminando dependencias de tareas...');
      
      // Eliminar dependencias donde task_id está en nuestra lista
      const { error: deps1Error } = await supabase
        .from('task_dependencies')
        .delete()
        .in('task_id', taskIds);

      if (deps1Error) {
        console.error('Error al eliminar dependencias (task_id):', deps1Error);
        throw deps1Error;
      }

      // Eliminar dependencias donde depends_on_task_id está en nuestra lista
      const { error: deps2Error } = await supabase
        .from('task_dependencies')
        .delete()
        .in('depends_on_task_id', taskIds);

      if (deps2Error) {
        console.error('Error al eliminar dependencias (depends_on):', deps2Error);
        throw deps2Error;
      }

      console.log('Dependencias eliminadas exitosamente');

      // 4. Eliminar registros relacionados (asignaciones, sesiones, etc.)
      console.log('Paso 4: Eliminando registros relacionados...');

      // Eliminar asignaciones
      const { error: assignmentsError } = await supabase
        .from('task_assignments')
        .delete()
        .in('task_id', taskIds);

      if (assignmentsError) {
        console.error('Error al eliminar asignaciones:', assignmentsError);
        throw assignmentsError;
      }

      // Eliminar sesiones
      const { error: sessionsError } = await supabase
        .from('task_sessions')
        .delete()
        .in('task_id', taskIds);

      if (sessionsError) {
        console.error('Error al eliminar sesiones:', sessionsError);
        throw sessionsError;
      }

      // Eliminar monitoreo AI
      const { error: monitoringError } = await supabase
        .from('ai_task_monitoring')
        .delete()
        .in('task_id', taskIds);

      if (monitoringError) {
        console.error('Error al eliminar monitoreo AI:', monitoringError);
        throw monitoringError;
      }

      // Eliminar recordatorios
      const { error: remindersError } = await supabase
        .from('smart_reminders')
        .delete()
        .in('task_id', taskIds);

      if (remindersError) {
        console.error('Error al eliminar recordatorios:', remindersError);
        throw remindersError;
      }

      console.log('Registros relacionados eliminados exitosamente');

      // 5. CRÍTICO: Eliminar tareas respetando la jerarquía (subtareas primero)
      console.log('Paso 5: Eliminando tareas en orden jerárquico...');

      if (subtasks.length > 0) {
        console.log(`Eliminando ${subtasks.length} subtareas...`);
        const subtaskIds = subtasks.map(task => task.id);
        
        const { error: subtasksError } = await supabase
          .from('tasks')
          .delete()
          .in('id', subtaskIds)
          .eq('user_id', user.id);

        if (subtasksError) {
          console.error('Error al eliminar subtareas:', subtasksError);
          throw subtasksError;
        }
        console.log('Subtareas eliminadas exitosamente');
      }

      if (parentTasks.length > 0) {
        console.log(`Eliminando ${parentTasks.length} tareas principales...`);
        const parentTaskIds = parentTasks.map(task => task.id);
        
        const { error: parentTasksError } = await supabase
          .from('tasks')
          .delete()
          .in('id', parentTaskIds)
          .eq('user_id', user.id);

        if (parentTasksError) {
          console.error('Error al eliminar tareas principales:', parentTasksError);
          throw parentTasksError;
        }
        console.log('Tareas principales eliminadas exitosamente');
      }

      // 6. Eliminar historial del proyecto
      console.log('Paso 6: Eliminando historial del proyecto...');
      const { error: historyError } = await supabase
        .from('project_history')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id);

      if (historyError) {
        console.error('Error al eliminar historial:', historyError);
        throw historyError;
      }
      console.log('Historial eliminado exitosamente');

      // 7. Finalmente eliminar el proyecto
      console.log('Paso 7: Eliminando el proyecto...');
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (projectError) {
        console.error('Error al eliminar proyecto:', projectError);
        throw projectError;
      }

      console.log('=== PROYECTO ELIMINADO EXITOSAMENTE ===');
      console.log(`Resumen: Eliminado proyecto "${project.name}" con ${allTasks.length} tareas asociadas`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto y todas sus tareas asociadas se han eliminado exitosamente.",
      });
    },
    onError: (error) => {
      console.error('=== ERROR EN LA ELIMINACIÓN DEL PROYECTO ===');
      console.error('Error completo:', error);
      toast({
        title: "Error al eliminar proyecto",
        description: `Error: ${error.message}. Revisa la consola para más detalles.`,
        variant: "destructive",
      });
    },
  });

  return {
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
  };
};
