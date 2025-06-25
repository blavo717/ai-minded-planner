
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export interface CreateTaskAssignmentData {
  task_id: string;
  assigned_to: string;
  role_in_task: 'responsible' | 'reviewer' | 'contributor' | 'observer';
  due_date?: string;
  notes?: string;
}

export const useTaskAssignments = () => {
  const { user } = useAuth();

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

  return {
    taskAssignments,
    isLoading: assignmentsLoading,
  };
};
