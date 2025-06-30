
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

  const { data: taskAssignments = [], isLoading: assignmentsLoading, error } = useQuery({
    queryKey: ['task_assignments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('🔍 Fetching task assignments for user:', user.id);
      
      try {
        // Query simplificado - solo seleccionar columnas que existen
        const { data, error } = await supabase
          .from('task_assignments')
          .select('id, task_id, assigned_to, assigned_by, role_in_task, assigned_at, due_date, notes, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching task assignments:', error);
          throw error;
        }

        console.log('✅ Task assignments fetched successfully:', data?.length || 0);
        return data as TaskAssignment[];
      } catch (error) {
        console.error('❌ Task assignments query failed:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    taskAssignments,
    isLoading: assignmentsLoading,
    error,
  };
};
