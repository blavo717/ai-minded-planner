
import { useState } from 'react';
import { useReportHistory } from '@/hooks/reports/useReportHistory';
import { useReportGeneration } from '@/hooks/reports/useReportGeneration';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import PDFReportService from '@/services/pdfReportService';
import { supabase } from '@/integrations/supabase/client';

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPDFGenerating, setIsPDFGenerating] = useState(false);

  const generatePDF = async (reportId: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para generar PDFs",
        variant: "destructive",
      });
      return null;
    }

    setIsPDFGenerating(true);
    
    try {
      // Obtener datos del reporte
      const { data: report, error } = await supabase
        .from('generated_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single();

      if (error || !report) {
        throw new Error('Reporte no encontrado');
      }

      // Crear servicio PDF
      const pdfService = new PDFReportService({
        title: `Reporte ${report.report_type === 'weekly' ? 'Semanal' : 'Mensual'}`,
        period: {
          start: new Date(report.period_start),
          end: new Date(report.period_end),
        },
      });

      console.log('📄 Generando PDF con datos:', {
        reportId: report.id,
        reportType: report.report_type,
        hasData: !!report.report_data,
        metrics: report.metrics
      });

      // Mapear datos para el servicio PDF
      const mappedReportData = {
        id: report.id,
        user_id: report.user_id,
        report_type: report.report_type as 'weekly' | 'monthly',
        period_start: report.period_start,
        period_end: report.period_end,
        report_data: report.report_data,
        metrics: report.metrics as {
          tasksCompleted: number;
          productivity: number;
          timeWorked: number;
          efficiency: number;
        },
        created_at: report.created_at,
        updated_at: report.updated_at
      };

      // Generar y subir PDF
      const pdfResult = await pdfService.generateAndUploadPDF(mappedReportData, user.id);

      // Actualizar registro con URL del PDF
      const { error: updateError } = await supabase
        .from('generated_reports')
        .update({ file_url: pdfResult.uploadUrl })
        .eq('id', reportId);

      if (updateError) {
        console.error('Error updating report with PDF URL:', updateError);
      }

      toast({
        title: "PDF generado exitosamente",
        description: `Reporte ${report.report_type} generado y guardado`,
      });

      return pdfResult.uploadUrl || null;
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error al generar PDF",
        description: "No se pudo generar el reporte PDF. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsPDFGenerating(false);
    }
  };

  const downloadPDF = async (reportId: string): Promise<void> => {
    if (!user) return;

    try {
      const { data: report, error } = await supabase
        .from('generated_reports')
        .select('file_url, report_type, period_start, period_end')
        .eq('id', reportId)
        .eq('user_id', user.id)
        .single();

      if (error || !report?.file_url) {
        throw new Error('PDF no disponible');
      }

      // Abrir PDF en nueva pestaña
      window.open(report.file_url, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error al descargar PDF",
        description: "No se pudo acceder al PDF. Genera uno nuevo.",
        variant: "destructive",
      });
    }
  };

  const regeneratePDF = async (reportId: string): Promise<string | null> => {
    return await generatePDF(reportId);
  };

  return {
    getReportHistory: () => ({
      data: reportHistory,
      isLoading,
      error: null
    }),
    generateReport,
    isGenerating,
    generatePDF,
    downloadPDF,
    regeneratePDF,
    isPDFGenerating,
  };
};
