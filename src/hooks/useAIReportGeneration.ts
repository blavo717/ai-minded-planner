/**
 * SUBTAREA 5: Hook para integración completa del sistema de reportes IA
 * Conecta todos los servicios y maneja el estado de generación
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLLMService } from '@/hooks/useLLMService';
import { AIHTMLReportService, AIReportConfiguration, AIHTMLReportResponse } from '@/services/aiHTMLReportService';
import { ComprehensiveReportDataService } from '@/services/comprehensiveReportDataService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIReportGenerationState {
  isGenerating: boolean;
  lastGeneratedReport: AIHTMLReportResponse | null;
  error: string | null;
}

export const useAIReportGeneration = () => {
  const { user } = useAuth();
  const llmService = useLLMService();
  const { hasActiveConfiguration, activeModel } = llmService;
  const { toast } = useToast();

  // Estado del hook
  const [state, setState] = useState<AIReportGenerationState>({
    isGenerating: false,
    lastGeneratedReport: null,
    error: null
  });

  // Instancias de servicios
  const [aiReportService] = useState(() => new AIHTMLReportService(llmService));

  /**
   * Genera un reporte HTML usando IA
   */
  const generateAIReport = useCallback(async (config: AIReportConfiguration): Promise<AIHTMLReportResponse> => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null
    }));

    try {
      console.log('🚀 Iniciando generación de reporte IA:', {
        userId: user.id,
        config,
        hasLLMConfig: hasActiveConfiguration,
        activeModel
      });

      // 1. Generar datos comprehensivos
      const dataService = new ComprehensiveReportDataService(user.id);
      const reportData = await dataService.generateComprehensiveReport(config.type);

      console.log('📊 Datos comprehensivos generados:', {
        periodo: `${reportData.period.start} - ${reportData.period.end}`,
        proyectos: reportData.projects.length,
        tareas: reportData.tasks?.length || 0,
        sesiones: reportData.sessions.length
      });

      // 2. Generar reporte HTML con IA
      const result = await aiReportService.generateHTMLReport(reportData, config);

      if (result.success) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          lastGeneratedReport: result
        }));

        console.log('✅ Reporte IA generado exitosamente:', {
          tamaño: result.htmlContent.length,
          tiempo: result.metadata?.generationTime,
          modelo: result.metadata?.modelUsed
        });
      } else {
        // Si falla la IA, generar reporte de fallback
        console.warn('⚠️ IA falló, generando reporte de fallback...');
        
        const fallbackHTML = aiReportService.generateFallbackHTML(reportData);
        const fallbackResult: AIHTMLReportResponse = {
          htmlContent: fallbackHTML,
          success: true,
          metadata: {
            generationTime: Date.now() - Date.now(),
            modelUsed: 'fallback',
            tokensUsed: 0
          }
        };

        setState(prev => ({
          ...prev,
          isGenerating: false,
          lastGeneratedReport: fallbackResult
        }));

        toast({
          title: "Reporte generado con template básico",
          description: "La IA no está disponible, se generó un reporte con plantilla estándar.",
          variant: "default",
        });

        return fallbackResult;
      }

      return result;

    } catch (error: any) {
      console.error('❌ Error en generación de reporte IA:', error);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message
      }));

      throw error;
    }
  }, [user, hasActiveConfiguration, activeModel, aiReportService, toast]);

  /**
   * Guarda el reporte generado en el historial
   */
  const saveReportToHistory = useCallback(async (
    report: AIHTMLReportResponse, 
    type: 'weekly' | 'monthly'
  ): Promise<void> => {
    if (!user || !report.htmlContent) {
      throw new Error('No hay reporte para guardar');
    }

    try {
      console.log('💾 Guardando reporte en historial:', {
        userId: user.id,
        type,
        size: report.htmlContent.length
      });

      // Calcular período
      const now = new Date();
      const isWeekly = type === 'weekly';
      
      const periodStart = isWeekly 
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        : new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
      const periodEnd = isWeekly
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        : new Date(now.getFullYear(), now.getMonth(), 0);

      // Preparar datos para la base de datos
      const reportData = {
        user_id: user.id,
        report_type: type,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        generation_type: 'ai',
        report_data: {
          htmlContent: report.htmlContent,
          generationType: 'ai',
          metadata: report.metadata
        },
        metrics: {
          tasksCompleted: 0, // Estos se extraerían del reporte si fuera necesario
          productivity: 0,
          timeWorked: 0,
          efficiency: 0
        }
      };

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('generated_reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        console.error('Error guardando reporte:', error);
        throw new Error('Error al guardar en base de datos');
      }

      console.log('✅ Reporte guardado exitosamente:', data.id);

    } catch (error: any) {
      console.error('❌ Error guardando reporte:', error);
      throw error;
    }
  }, [user]);

  /**
   * Regenera el último reporte con nueva configuración
   */
  const regenerateReport = useCallback(async (newConfig?: Partial<AIReportConfiguration>): Promise<AIHTMLReportResponse> => {
    if (!state.lastGeneratedReport) {
      throw new Error('No hay reporte previo para regenerar');
    }

    const config: AIReportConfiguration = {
      type: 'monthly',
      includeCharts: true,
      includeInsights: true,
      colorScheme: 'blue',
      detailLevel: 'detailed',
      ...newConfig
    };

    return generateAIReport(config);
  }, [state.lastGeneratedReport, generateAIReport]);

  /**
   * Limpia el estado del hook
   */
  const clearState = useCallback(() => {
    setState({
      isGenerating: false,
      lastGeneratedReport: null,
      error: null
    });
  }, []);

  /**
   * Exporta el reporte a PDF (funcionalidad futura)
   */
  const exportToPDF = useCallback(async (report: AIHTMLReportResponse): Promise<string> => {
    // TODO: Implementar conversión HTML a PDF
    // Por ahora retornamos el HTML como blob URL
    const blob = new Blob([report.htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, []);

  return {
    // Estado
    isGenerating: state.isGenerating,
    hasActiveConfiguration, // Usar directamente del useLLMService
    lastGeneratedReport: state.lastGeneratedReport,
    error: state.error,
    activeModel,

    // Acciones principales
    generateAIReport,
    saveReportToHistory,
    regenerateReport,
    clearState,
    exportToPDF,

    // Información adicional
    canGenerate: !!user && hasActiveConfiguration,
    reportService: aiReportService
  };
};