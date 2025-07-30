import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { supabase } from '@/integrations/supabase/client';

export interface PDFReportConfig {
  title: string;
  period: { start: Date; end: Date };
  branding: { 
    logo?: string; 
    colors: { 
      primary: string; 
      secondary: string;
      text: string;
      background: string;
    } 
  };
}

export interface PDFGenerationResult {
  blob: Blob;
  filename: string;
  size: number;
  uploadUrl?: string;
}

export interface ReportData {
  id: string;
  user_id: string;
  report_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  metrics: {
    tasksCompleted: number;
    productivity: number;
    timeWorked: number;
    efficiency: number;
  };
  report_data: any;
}

// Estilos base para PDFs
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a365d',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 15,
    color: '#2d3748',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    marginBottom: 10,
    color: '#4a5568',
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f7fafc',
    borderRadius: 5,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#718096',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#a0aec0',
  },
});

class PDFReportService {
  private config: PDFReportConfig;

  constructor(config?: Partial<PDFReportConfig>) {
    this.config = {
      title: 'Reporte de Productividad',
      period: { start: new Date(), end: new Date() },
      branding: {
        colors: {
          primary: '#3182ce',
          secondary: '#e2e8f0',
          text: '#2d3748',
          background: '#ffffff',
        }
      },
      ...config,
    };
  }

  // Crear documento PDF básico
  private createBasicDocument(reportData: ReportData) {
    const formatDate = (date: string) => new Date(date).toLocaleDateString('es-ES');
    
    return React.createElement(Document, null,
      React.createElement(Page, { size: "A4", style: styles.page },
        // Header
        React.createElement(View, null,
          React.createElement(Text, { style: styles.header },
            `${this.config.title} - ${reportData.report_type === 'weekly' ? 'Semanal' : 'Mensual'}`
          ),
          React.createElement(Text, { style: styles.text },
            `Período: ${formatDate(reportData.period_start)} - ${formatDate(reportData.period_end)}`
          ),
          React.createElement(Text, { style: styles.text },
            `Generado el: ${new Date().toLocaleDateString('es-ES')}`
          )
        ),

        // Métricas principales
        React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.subheader }, "Métricas Principales"),
          
          React.createElement(View, { style: styles.metricRow },
            React.createElement(Text, { style: styles.metricLabel }, "Tareas Completadas:"),
            React.createElement(Text, { style: styles.metricValue }, reportData.metrics.tasksCompleted.toString())
          ),
          
          React.createElement(View, { style: styles.metricRow },
            React.createElement(Text, { style: styles.metricLabel }, "Productividad Promedio:"),
            React.createElement(Text, { style: styles.metricValue }, `${reportData.metrics.productivity.toFixed(1)}/5`)
          ),
          
          React.createElement(View, { style: styles.metricRow },
            React.createElement(Text, { style: styles.metricLabel }, "Tiempo Trabajado:"),
            React.createElement(Text, { style: styles.metricValue }, `${Math.round(reportData.metrics.timeWorked / 60)}h`)
          ),
          
          React.createElement(View, { style: styles.metricRow },
            React.createElement(Text, { style: styles.metricLabel }, "Eficiencia:"),
            React.createElement(Text, { style: styles.metricValue }, `${reportData.metrics.efficiency.toFixed(1)}%`)
          )
        ),

        // Insights
        reportData.report_data?.insights && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.subheader }, "Insights"),
          ...(reportData.report_data.insights as string[]).map((insight: string, index: number) =>
            React.createElement(Text, { key: index, style: styles.text }, `• ${insight}`)
          )
        ),

        // Recomendaciones
        reportData.report_data?.recommendations && React.createElement(View, { style: styles.section },
          React.createElement(Text, { style: styles.subheader }, "Recomendaciones"),
          ...(reportData.report_data.recommendations as string[]).map((rec: string, index: number) =>
            React.createElement(Text, { key: index, style: styles.text }, `• ${rec}`)
          )
        ),

        // Footer
        React.createElement(Text, { style: styles.footer },
          "Reporte generado automáticamente por el Sistema de Gestión de Tareas"
        )
      )
    );
  }

  // Generar PDF semanal
  async generateWeeklyPDF(reportData: ReportData): Promise<PDFGenerationResult> {
    try {
      const document = this.createBasicDocument(reportData);
      const blob = await pdf(document).toBlob();
      
      const filename = `reporte-semanal-${reportData.period_start}-${reportData.period_end}.pdf`;
      
      return {
        blob,
        filename,
        size: blob.size,
      };
    } catch (error) {
      console.error('Error generating weekly PDF:', error);
      throw new Error('Failed to generate weekly PDF report');
    }
  }

  // Generar PDF mensual
  async generateMonthlyPDF(reportData: ReportData): Promise<PDFGenerationResult> {
    try {
      const document = this.createBasicDocument(reportData);
      const blob = await pdf(document).toBlob();
      
      const filename = `reporte-mensual-${reportData.period_start}-${reportData.period_end}.pdf`;
      
      return {
        blob,
        filename,
        size: blob.size,
      };
    } catch (error) {
      console.error('Error generating monthly PDF:', error);
      throw new Error('Failed to generate monthly PDF report');
    }
  }

  // Subir PDF a Supabase Storage
  async uploadPDFToStorage(blob: Blob, filename: string, userId: string): Promise<string> {
    try {
      const filePath = `${userId}/${filename}`;
      
      const { data, error } = await supabase.storage
        .from('reports-pdf')
        .upload(filePath, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading PDF to storage:', error);
        throw new Error(`Failed to upload PDF: ${error.message}`);
      }

      // Obtener URL pública del archivo
      const { data: urlData } = supabase.storage
        .from('reports-pdf')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadPDFToStorage:', error);
      throw error;
    }
  }

  // Método principal para generar y subir PDF
  async generateAndUploadPDF(
    reportData: ReportData, 
    userId: string
  ): Promise<PDFGenerationResult> {
    try {
      let pdfResult: PDFGenerationResult;

      if (reportData.report_type === 'weekly') {
        pdfResult = await this.generateWeeklyPDF(reportData);
      } else {
        pdfResult = await this.generateMonthlyPDF(reportData);
      }

      // Subir a Storage
      const uploadUrl = await this.uploadPDFToStorage(
        pdfResult.blob, 
        pdfResult.filename, 
        userId
      );

      return {
        ...pdfResult,
        uploadUrl,
      };
    } catch (error) {
      console.error('Error in generateAndUploadPDF:', error);
      throw error;
    }
  }

  // Descargar PDF directamente
  async downloadPDF(blob: Blob, filename: string): Promise<void> {
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw new Error('Failed to download PDF');
    }
  }
}

export default PDFReportService;