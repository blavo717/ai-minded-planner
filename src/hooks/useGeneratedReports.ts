
import { useReportHistory } from '@/hooks/reports/useReportHistory';
import { useReportGeneration } from '@/hooks/reports/useReportGeneration';

export interface GeneratedReport {
  id: string;
  user_id: string;
  report_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  report_data: any;
  metrics: {
    tasksCompleted: number;
    productivity: number;
    timeWorked: number;
    efficiency: number;
  };
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export const useGeneratedReports = () => {
  const { data: reportHistory, isLoading } = useReportHistory();
  const { generateReport, isGenerating } = useReportGeneration();

  return {
    getReportHistory: () => ({
      data: reportHistory,
      isLoading,
      error: null
    }),
    generateReport,
    isGenerating,
  };
};
