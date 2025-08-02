
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GeneratedReport } from '@/hooks/useGeneratedReports';

export const useReportHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['generated-reports', user?.id],
    queryFn: async (): Promise<GeneratedReport[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(report => ({
        ...report,
        report_type: report.report_type as 'weekly' | 'monthly',
        metrics: report.metrics as GeneratedReport['metrics']
      })) as GeneratedReport[];
    },
    enabled: !!user,
  });
};
