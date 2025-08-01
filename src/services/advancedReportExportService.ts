import { PDFReportService } from './pdfReportService';
import { IntelligentAnalyticsService } from './intelligentAnalyticsService';
import { MonthlyReportData } from '@/types/reportTypes';

/**
 * Servicio avanzado de generación de reportes con múltiples formatos
 * Fase 5: Múltiples formatos de exportación y personalización
 */
export class AdvancedReportExportService {
  private pdfService: PDFReportService;
  
  constructor() {
    this.pdfService = new PDFReportService();
  }
  
  /**
   * Genera múltiples formatos de reporte
   */
  async generateMultiFormatReport(
    userId: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date,
    formats: Array<'pdf-standard' | 'pdf-executive' | 'pdf-detailed' | 'json' | 'csv'> = ['pdf-standard']
  ): Promise<{
    [format: string]: {
      blob: Blob;
      filename: string;
      size: number;
      url?: string;
    }
  }> {
    const results: any = {};
    
    for (const format of formats) {
      try {
        switch (format) {
          case 'pdf-standard':
            results[format] = await this.generateStandardPDF(userId, reportType, startDate, endDate);
            break;
          case 'pdf-executive':
            results[format] = await this.generateExecutivePDF(userId, reportType, startDate, endDate);
            break;
          case 'pdf-detailed':
            results[format] = await this.generateDetailedPDF(userId, reportType, startDate, endDate);
            break;
          case 'json':
            results[format] = await this.generateJSONExport(userId, reportType, startDate, endDate);
            break;
          case 'csv':
            results[format] = await this.generateCSVExport(userId, reportType, startDate, endDate);
            break;
        }
      } catch (error) {
        console.error(`Error generating ${format} format:`, error);
        // Continue with other formats
      }
    }
    
    return results;
  }
  
  /**
   * PDF Estándar - versión completa
   */
  private async generateStandardPDF(
    userId: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ) {
    if (reportType === 'monthly') {
      return await this.pdfService.generateMonthlyReport(userId, startDate, endDate);
    } else {
      return await this.pdfService.generateWeeklyReport(userId, startDate, endDate);
    }
  }
  
  /**
   * PDF Ejecutivo - versión resumida para alta gerencia
   */
  private async generateExecutivePDF(
    userId: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ) {
    // Configurar servicio para reporte ejecutivo
    const executiveService = new PDFReportService({
      title: 'Reporte Ejecutivo',
      primaryColor: '#1a365d', // Azul más formal
      branding: {
        colors: {
          primary: '#1a365d',
          secondary: '#e2e8f0',
          text: '#2d3748',
          background: '#ffffff'
        }
      }
    });
    
    if (reportType === 'monthly') {
      return await executiveService.generateMonthlyReport(userId, startDate, endDate);
    } else {
      return await executiveService.generateWeeklyReport(userId, startDate, endDate);
    }
  }
  
  /**
   * PDF Detallado - versión extendida con análisis profundo
   */
  private async generateDetailedPDF(
    userId: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ) {
    // Para el reporte detallado, usamos la plantilla ultimate
    const detailedService = new PDFReportService({
      title: 'Reporte Detallado de Análisis',
      primaryColor: '#7c3aed', // Púrpura para diferenciación
      branding: {
        colors: {
          primary: '#7c3aed',
          secondary: '#e2e8f0',
          text: '#2d3748',
          background: '#ffffff'
        }
      }
    });
    
    if (reportType === 'monthly') {
      return await detailedService.generateMonthlyReport(userId, startDate, endDate);
    } else {
      return await detailedService.generateWeeklyReport(userId, startDate, endDate);
    }
  }
  
  /**
   * Exportación JSON - datos estructurados
   */
  private async generateJSONExport(
    userId: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ) {
    const comprehensiveService = new (await import('./comprehensiveReportDataService')).ComprehensiveReportDataService(userId);
    const data = await comprehensiveService.generateComprehensiveReport(reportType);
    
    // Agregar análisis inteligente si es mensual
    let enrichedData = data;
    if (reportType === 'monthly' && data) {
      const monthlyData: MonthlyReportData = {
        period_start: startDate.toISOString(),
        period_end: endDate.toISOString(),
        metrics: {
          tasksCompleted: data.periodData?.tasksCompleted || 0,
          tasksCreated: data.periodData?.tasksCreated || 0,
          timeWorked: data.periodData?.timeWorked || 0,
          productivity: data.periodData?.avgProductivity || 0,
          completionRate: data.insights?.completionRate || 0,
          averageTaskDuration: data.insights?.avgTaskDuration || 0,
          projectsActive: data.currentState?.activeProjects || 0,
          projectsCompleted: 0,
        },
        tasks: data.tasks || [],
        projects: (data.projects || []).map(project => ({
          id: project.id || '',
          name: project.name || '',
          status: project.status || 'activo',
          progress: project.progress || 0,
          tasksTotal: project.totalTasks || 0,
          tasksCompleted: project.completedTasks || 0,
        })),
        weeklyBreakdown: [],
        trends: {
          productivityTrend: 'stable',
          timeEfficiency: 0,
          improvements: [],
        },
      };
      
      // Crear objeto extendido con análisis inteligente
      const extendedData = {
        ...data,
        intelligentAnalysis: {
          insights: IntelligentAnalyticsService.generateIntelligentInsights(monthlyData),
          recommendations: IntelligentAnalyticsService.generateSmartRecommendations(monthlyData),
          alerts: IntelligentAnalyticsService.generateIntelligentAlerts(monthlyData),
          predictiveAnalysis: IntelligentAnalyticsService.generatePredictiveAnalysis(monthlyData),
          workPatterns: IntelligentAnalyticsService.analyzeWorkPatterns(monthlyData)
        }
      };
      
      enrichedData = extendedData;
    }
    
    const jsonString = JSON.stringify(enrichedData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const filename = `reporte-${reportType}-${startDate.toISOString().split('T')[0]}.json`;
    
    return {
      blob,
      filename,
      size: blob.size
    };
  }
  
  /**
   * Exportación CSV - datos tabulares
   */
  private async generateCSVExport(
    userId: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ) {
    const comprehensiveService = new (await import('./comprehensiveReportDataService')).ComprehensiveReportDataService(userId);
    const data = await comprehensiveService.generateComprehensiveReport(reportType);
    
    // Crear CSV con las tareas principales
    const tasks = data?.tasks || [];
    const csvHeaders = [
      'ID',
      'Título',
      'Estado',
      'Prioridad',
      'Proyecto',
      'Fecha Creación',
      'Fecha Completado',
      'Duración (min)'
    ];
    
    const csvRows = tasks.map(task => [
      task.id || '',
      `"${(task.title || '').replace(/"/g, '""')}"`, // Escape quotes
      task.status || '',
      task.priority || '',
      `"${(task.project_name || '').replace(/"/g, '""')}"`,
      task.created_at || '',
      task.completed_at || '',
      task.actual_duration || ''
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `tareas-${reportType}-${startDate.toISOString().split('T')[0]}.csv`;
    
    return {
      blob,
      filename,
      size: blob.size
    };
  }
  
  /**
   * Personalización de plantillas por usuario
   */
  async saveUserTemplate(
    userId: string,
    templateName: string,
    config: {
      colors?: { primary: string; secondary: string; accent: string };
      fonts?: { body: string; heading: string };
      layout?: { sections: string[]; metrics: string[] };
      branding?: { logo?: string; companyName?: string };
    }
  ): Promise<void> {
    // Guardar en localStorage por ahora, posteriormente en Supabase
    const templates = JSON.parse(localStorage.getItem(`user-templates-${userId}`) || '{}');
    templates[templateName] = {
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`user-templates-${userId}`, JSON.stringify(templates));
  }
  
  /**
   * Cargar plantillas del usuario
   */
  async getUserTemplates(userId: string): Promise<{ [templateName: string]: any }> {
    return JSON.parse(localStorage.getItem(`user-templates-${userId}`) || '{}');
  }
  
  /**
   * Aplicar plantilla personalizada
   */
  async generateWithCustomTemplate(
    userId: string,
    templateName: string,
    reportType: 'weekly' | 'monthly',
    startDate: Date,
    endDate: Date
  ) {
    const templates = await this.getUserTemplates(userId);
    const template = templates[templateName];
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found for user ${userId}`);
    }
    
    const customService = new PDFReportService({
      title: template.branding?.companyName || 'Reporte Personalizado',
      primaryColor: template.colors?.primary || '#3182ce',
      branding: {
        logo: template.branding?.logo,
        colors: {
          primary: template.colors?.primary || '#3182ce',
          secondary: template.colors?.secondary || '#e2e8f0',
          text: '#2d3748',
          background: '#ffffff'
        }
      }
    });
    
    if (reportType === 'monthly') {
      return await customService.generateMonthlyReport(userId, startDate, endDate);
    } else {
      return await customService.generateWeeklyReport(userId, startDate, endDate);
    }
  }
}