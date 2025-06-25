import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  project_id?: string;
  user_id: string;
  estimated_duration?: number;
  actual_duration?: number;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  timezone?: string;
  role?: 'project_manager' | 'engineer' | 'coordinator' | 'specialist' | 'admin';
  skills?: string[];
  phone?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  assigned_to: string;
  assigned_by: string;
  role_in_task: 'responsible' | 'reviewer' | 'contributor' | 'observer';
  assigned_at: string;
  due_date?: string;
  notes?: string;
  created_at: string;
}

export interface ExternalContact {
  id: string;
  user_id: string;
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  country?: string;
  contact_type: 'contractor' | 'supplier' | 'authority' | 'consultant' | 'other';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: string;
  estimated_duration?: number;
  tags?: string[];
}

export interface UpdateTaskData {
  id: string;
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  project_id?: string;
  estimated_duration?: number;
  actual_duration?: number;
  tags?: string[];
  completed_at?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectData {
  id: string;
  name?: string;
  description?: string;
  color?: string;
}

export interface CreateTaskAssignmentData {
  task_id: string;
  assigned_to: string;
  role_in_task: 'responsible' | 'reviewer' | 'contributor' | 'observer';
  due_date?: string;
  notes?: string;
}

export interface CreateExternalContactData {
  name: string;
  company?: string;
  role?: string;
  email?: string;
  phone?: string;
  country?: string;
  contact_type: 'contractor' | 'supplier' | 'authority' | 'consultant' | 'other';
  notes?: string;
}

export const useTasks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading, error: tasksError } = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Project[];
    },
    enabled: !!user,
  });

  // Nuevas queries para profiles, task assignments y external contacts
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: taskAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['task_assignments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('task_assignments')
        .select(`
          *,
          assigned_to_profile:assigned_to(id, full_name, email, role),
          assigned_by_profile:assigned_by(id, full_name, email, role),
          task:task_id(id, title, status, priority)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaskAssignment[];
    },
    enabled: !!user,
  });

  const { data: externalContacts = [], isLoading: contactsLoading } = useQuery({
    queryKey: ['external_contacts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('external_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as ExternalContact[];
    },
    enabled: !!user,
  });

  // Task mutations
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: CreateTaskData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          status: taskData.status || 'pending',
          priority: taskData.priority || 'medium',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: UpdateTaskData) => {
      const { id, ...updateData } = taskData;
      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Tarea actualizada",
        description: "La tarea se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Project mutations
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          user_id: user.id,
          color: projectData.color || '#3B82F6',
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
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar proyecto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Nuevas mutaciones para task assignments
  const createTaskAssignmentMutation = useMutation({
    mutationFn: async (assignmentData: CreateTaskAssignmentData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('task_assignments')
        .insert({
          ...assignmentData,
          assigned_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_assignments', user?.id] });
      toast({
        title: "Asignación creada",
        description: "La tarea se ha asignado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al asignar tarea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('task_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task_assignments', user?.id] });
      toast({
        title: "Asignación eliminada",
        description: "La asignación se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar asignación",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Nuevas mutaciones para external contacts
  const createExternalContactMutation = useMutation({
    mutationFn: async (contactData: CreateExternalContactData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('external_contacts')
        .insert({
          ...contactData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external_contacts', user?.id] });
      toast({
        title: "Contacto creado",
        description: "El contacto externo se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al crear contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateExternalContactMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateExternalContactData>) => {
      const { data, error } = await supabase
        .from('external_contacts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external_contacts', user?.id] });
      toast({
        title: "Contacto actualizado",
        description: "El contacto se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteExternalContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('external_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external_contacts', user?.id] });
      toast({
        title: "Contacto eliminado",
        description: "El contacto se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar contacto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tasks,
    projects,
    profiles,
    taskAssignments,
    externalContacts,
    isLoading: tasksLoading || projectsLoading || profilesLoading || assignmentsLoading || contactsLoading,
    error: tasksError || projectsError,
    
    // Task operations
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreatingTask: createTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending,
    
    // Project operations
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreatingProject: createProjectMutation.isPending,
    isUpdatingProject: updateProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,

    // Task assignment operations
    createTaskAssignment: createTaskAssignmentMutation.mutate,
    deleteTaskAssignment: deleteTaskAssignmentMutation.mutate,
    isCreatingTaskAssignment: createTaskAssignmentMutation.isPending,
    isDeletingTaskAssignment: deleteTaskAssignmentMutation.isPending,

    // External contact operations
    createExternalContact: createExternalContactMutation.mutate,
    updateExternalContact: updateExternalContactMutation.mutate,
    deleteExternalContact: deleteExternalContactMutation.mutate,
    isCreatingExternalContact: createExternalContactMutation.isPending,
    isUpdatingExternalContact: updateExternalContactMutation.isPending,
    isDeletingExternalContact: deleteExternalContactMutation.isPending,
  };
};
