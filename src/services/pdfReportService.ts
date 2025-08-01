import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { pdf } from '@react-pdf/renderer';
import { MonthlyReportTemplate } from '@/components/PDF/MonthlyReportTemplate';
import { EnhancedMonthlyReportTemplate } from '@/components/PDF/EnhancedMonthlyReportTemplate';
import { WeeklyReportTemplate } from '@/components/PDF/WeeklyReportTemplate';
import { ComprehensiveReportDataService } from './comprehensiveReportDataService';
import { MonthlyReportData, PDFGenerationResult, TaskData } from '@/types/reportTypes';

const supabaseUrl = 'https://vkylcjrwhasymfjtqgqf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreWxjanJ3aGFzeW1manRxZ3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDQwODIsImV4cCI6MjA2NjQyMDA4Mn0.JA4rbfSqVuHjUz1z-92jyJjAWLiBlm7S-PFZ7FjM3u0';
const supabase = createClient(supabaseUrl, supabaseKey);

export interface PDFReportConfig {
  title: string;
  period: { start: Date; end: Date };
  primaryColor?: string;
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

export interface ReportData {
  id: string;
  user_id: string;
  report_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  metrics: {
    tasksCompleted: number;
    tasksCreated?: number;
    productivity: number;
    timeWorked: number;
    efficiency: number;
    completionRate?: number;
  };
  report_data: any;
}

class PDFReportService {
  private config: PDFReportConfig;
  private comprehensiveService: ComprehensiveReportDataService;

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
    // El servicio comprehensivo se inicializa en cada método con el userId correcto
    this.comprehensiveService = new ComprehensiveReportDataService('');
  }

  async generateMonthlyReport(userId: string, startDate: Date, endDate: Date): Promise<PDFGenerationResult> {
    try {
      console.log('🚀 FASE 5: Iniciando generación de reporte mensual');
      console.log('👤 Usuario:', userId);
      console.log('📅 Período:', { 
        inicio: startDate.toISOString(), 
        fin: endDate.toISOString(),
        días: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      });

      // FASE 5: Crear servicio con userId correcto y obtener datos comprehensivos
      const comprehensiveService = new ComprehensiveReportDataService(userId);
      const comprehensiveData = await comprehensiveService.generateComprehensiveReport('monthly');

      console.log('📊 FASE 5: Validación de datos comprehensivos:', {
        datosExisten: !!comprehensiveData,
        proyectos: comprehensiveData?.projects?.length || 0,
        sesiones: comprehensiveData?.sessions?.length || 0,
        tareasConsolidadas: comprehensiveData?.tasks?.length || 0,
        datosDelPeríodo: !!comprehensiveData?.periodData,
        estadoActual: !!comprehensiveData?.currentState,
        insights: !!comprehensiveData?.insights
      });

      // FASE 4: Mapeo de datos usando tipos unificados
      const monthlyData: MonthlyReportData = {
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        metrics: {
          tasksCompleted: comprehensiveData?.periodData?.tasksCompleted || 0,
          tasksCreated: comprehensiveData?.periodData?.tasksCreated || 0,
          timeWorked: comprehensiveData?.periodData?.timeWorked || 0,
          productivity: comprehensiveData?.periodData?.avgProductivity || 0,
          completionRate: comprehensiveData?.insights?.completionRate || 0,
          averageTaskDuration: comprehensiveData?.insights?.avgTaskDuration || 0,
          projectsActive: comprehensiveData?.currentState?.activeProjects || 0,
          projectsCompleted: comprehensiveData?.projects?.filter(p => p.status === 'completed').length || 0,
        },
        // CRÍTICO: Usar tareas consolidadas directamente del service
        tasks: comprehensiveData?.tasks || this.extractTasksFromProjects(comprehensiveData?.projects || []),
        projects: comprehensiveData?.projects?.map(project => ({
          id: project.id,
          name: project.name,
          status: project.status,
          progress: project.progress,
          tasksTotal: project.totalTasks,
          tasksCompleted: project.completedTasks,
        })) || [],
        weeklyBreakdown: [], // TODO: Implementar si necesario
        trends: {
          productivityTrend: comprehensiveData?.insights?.trends?.productivityTrend === 'increasing' ? 'up' :
                           comprehensiveData?.insights?.trends?.productivityTrend === 'decreasing' ? 'down' : 'stable',
          timeEfficiency: comprehensiveData?.insights?.efficiency || 0,
          improvements: [], // TODO: Implementar si necesario
        },
      };

      console.log('🔄 FASE 5: Datos finales mapeados:', {
        tareas: monthlyData.tasks?.length || 0,
        proyectos: monthlyData.projects?.length || 0,
        métricas: monthlyData.metrics,
        período: `${monthlyData.period_start} - ${monthlyData.period_end}`,
        validación: {
          tasksSonArray: Array.isArray(monthlyData.tasks),
          projectsSonArray: Array.isArray(monthlyData.projects),
          méticasCompletas: Object.keys(monthlyData.metrics).length
        }
      });

      // FASE 6: Generar PDF con plantilla profesional mejorada
      console.log('🎯 FASE 6: Iniciando generación de PDF profesional...');
      const pdfElement = React.createElement(EnhancedMonthlyReportTemplate, {
        data: monthlyData,
        brandConfig: { 
          companyName: this.config.title,
          primaryColor: this.config.primaryColor,
          colors: this.config.branding.colors
        }
      });
      const blob = await pdf(pdfElement as any).toBlob();
      
      const filename = `reporte-mensual-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.pdf`;
      
      console.log('✅ FASE 6: PDF generado exitosamente:', {
        archivo: filename,
        tamaño: `${(blob.size / 1024).toFixed(2)} KB`
      });

      return {
        blob,
        filename,
        size: blob.size,
      };
    } catch (error) {
      console.error('❌ FASE 6: Error generando reporte mensual:', error);
      throw error;
    }
  }

  async generateWeeklyReport(userId: string, startDate: Date, endDate: Date): Promise<PDFGenerationResult> {
    try {
      console.log('🚀 Iniciando generación de reporte semanal para usuario:', userId);

      const comprehensiveService = new ComprehensiveReportDataService(userId);
      const comprehensiveData = await comprehensiveService.generateComprehensiveReport('weekly');

      // Map comprehensive data to weekly format
      const weeklyData = {
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        metrics: {
          tasksCompleted: comprehensiveData?.periodData?.tasksCompleted || 0,
          tasksCreated: comprehensiveData?.periodData?.tasksCreated || 0,
          timeWorked: comprehensiveData?.periodData?.timeWorked || 0,
          productivity: comprehensiveData?.periodData?.avgProductivity || 0,
          completionRate: comprehensiveData?.insights?.completionRate || 0,
          averageTaskDuration: comprehensiveData?.insights?.avgTaskDuration || 0,
        },
        tasks: comprehensiveData?.tasks || [],
        insights: {
          mostProductiveDay: comprehensiveData?.insights?.mostProductiveProject || 'Lunes',
          mostProductiveHour: '10:00 AM',
          commonTags: [],
          recommendations: [],
        },
      };

      const pdfElement = React.createElement(WeeklyReportTemplate, {
        data: weeklyData,
        brandConfig: { companyName: this.config.title }
      });
      const blob = await pdf(pdfElement as any).toBlob();
      const filename = `reporte-semanal-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.pdf`;
      
      return {
        blob,
        filename,
        size: blob.size,
      };
    } catch (error) {
      console.error('Error generando reporte semanal:', error);
      throw error;
    }
  }

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

      const { data: urlData } = supabase.storage
        .from('reports-pdf')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error in uploadPDFToStorage:', error);
      throw error;
    }
  }

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

  // FASE 5: Método auxiliar mejorado con logging detallado
  private extractTasksFromProjects(projects: any[]): TaskData[] {
    console.log('🔧 FASE 5: extractTasksFromProjects iniciado');
    
    if (!Array.isArray(projects)) {
      console.warn('⚠️ extractTasksFromProjects: projects no es un array válido, recibido:', typeof projects);
      return [];
    }

    const extractedTasks: TaskData[] = [];
    
    projects.forEach((project, index) => {
      console.log(`🔍 Procesando proyecto ${index + 1}/${projects.length}:`, {
        id: project?.id,
        nombre: project?.name,
        tieneTareas: !!project?.tasks,
        cantidadTareas: Array.isArray(project?.tasks) ? project.tasks.length : 'No es array'
      });

      if (project?.tasks && Array.isArray(project.tasks)) {
        project.tasks.forEach((task: any, taskIndex: number) => {
          const taskData: TaskData = {
            id: task.id || `generated-${Date.now()}-${taskIndex}`,
            title: task.title || 'Sin título',
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            project_name: project.name || 'Sin proyecto',
            completed_at: task.completed_at || undefined,
            actual_duration: task.actual_duration || undefined,
            description: task.description || undefined,
            due_date: task.due_date || undefined,
            created_at: task.created_at || undefined,
          };
          
          extractedTasks.push(taskData);
        });
      }
    });

    console.log(`✅ FASE 5: extractTasksFromProjects completado:`, {
      proyectosProcesados: projects.length,
      tareasExtraídas: extractedTasks.length,
      muestraTareas: extractedTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title }))
    });
    
    return extractedTasks;
  }

  // FASE 6: Método para generar y subir PDF (requerido por useGeneratedReports)
  async generateAndUploadPDF(
    reportType: 'weekly' | 'monthly',
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<PDFGenerationResult & { uploadUrl: string }> {
    try {
      console.log('🚀 FASE 6: generateAndUploadPDF iniciado:', { reportType, userId });

      let result: PDFGenerationResult;
      
      if (reportType === 'monthly') {
        result = await this.generateMonthlyReport(userId, startDate, endDate);
      } else {
        result = await this.generateWeeklyReport(userId, startDate, endDate);
      }

      console.log('📤 FASE 6: Subiendo PDF a storage...');
      const uploadUrl = await this.uploadPDFToStorage(result.blob, result.filename, userId);
      
      console.log('✅ FASE 6: PDF generado y subido exitosamente:', {
        archivo: result.filename,
        url: uploadUrl
      });

      return {
        ...result,
        uploadUrl
      };
    } catch (error) {
      console.error('❌ FASE 6: Error en generateAndUploadPDF:', error);
      throw error;
    }
  }
}

export { PDFReportService };
export default PDFReportService;