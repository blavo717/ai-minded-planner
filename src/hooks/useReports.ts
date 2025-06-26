
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { generateSimpleReport, SimpleReport } from '@/utils/reportUtils';

export const useReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<SimpleReport[]>([]);

  const generateWeeklyReport = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const report = await generateSimpleReport(user.id, 'weekly');
      setReportHistory(prev => [report, ...prev]);
      toast({
        title: "Reporte semanal generado",
        description: `Reporte del ${report.period.start.toLocaleDateString()} al ${report.period.end.toLocaleDateString()}`,
      });
    } catch (error) {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte semanal. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMonthlyReport = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const report = await generateSimpleReport(user.id, 'monthly');
      setReportHistory(prev => [report, ...prev]);
      toast({
        title: "Reporte mensual generado",
        description: `Reporte del ${report.period.start.toLocaleDateString()} al ${report.period.end.toLocaleDateString()}`,
      });
    } catch (error) {
      toast({
        title: "Error al generar reporte",
        description: "No se pudo generar el reporte mensual. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportHistory = () => {
    return {
      data: reportHistory,
      isLoading: false,
      error: null
    };
  };

  return {
    getReportHistory,
    generateWeeklyReport,
    generateMonthlyReport,
    isGenerating,
  };
};
