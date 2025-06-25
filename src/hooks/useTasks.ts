
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export const useTasks = () => {
  const { user } = useAuth();

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

  return {
    tasks,
    projects,
    isLoading: tasksLoading || projectsLoading,
    error: tasksError || projectsError,
  };
};
