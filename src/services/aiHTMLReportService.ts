/**
 * SUBTAREA 1: AIHTMLReportService
 * Servicio que utiliza LLM para generar reportes HTML profesionales
 */

import { useLLMService } from '@/hooks/useLLMService';
import { ComprehensiveReportData } from './comprehensiveReportDataService';
import { formatReportDataForAI } from '@/utils/dataFormatter';
import { getReportPrompt } from '@/prompts/reportPrompts';

export interface AIReportConfiguration {
  type: 'weekly' | 'monthly';
  includeCharts?: boolean;
  includeInsights?: boolean;
  colorScheme?: 'blue' | 'green' | 'purple' | 'corporate';
  detailLevel?: 'summary' | 'detailed' | 'comprehensive';
}

export interface AIHTMLReportResponse {
  htmlContent: string;
  success: boolean;
  error?: string;
  metadata?: {
    generationTime: number;
    modelUsed: string;
    tokensUsed: number;
  };
}

export class AIHTMLReportService {
  private llmService: ReturnType<typeof useLLMService>;

  constructor(llmService: ReturnType<typeof useLLMService>) {
    this.llmService = llmService;
  }

  /**
   * Genera un reporte HTML usando IA
   */
  async generateHTMLReport(
    data: ComprehensiveReportData, 
    config: AIReportConfiguration
  ): Promise<AIHTMLReportResponse> {
    const startTime = Date.now();

    try {
      console.log('🤖 Iniciando generación de reporte HTML con IA:', {
        tipo: config.type,
        periodo: `${data.period.start} - ${data.period.end}`,
        configuracion: config
      });

      // Validar que tenemos configuración LLM activa
      if (!this.llmService.hasActiveConfiguration) {
        throw new Error('No hay configuración LLM activa. Configure su API key primero.');
      }

      // Formatear datos para la IA
      const formattedData = formatReportDataForAI(data);
      
      // Obtener el prompt especializado
      const systemPrompt = getReportPrompt(config.type, config);
      
      // Crear prompt del usuario con los datos
      const userPrompt = this.buildUserPrompt(formattedData, config);

      console.log('📝 Enviando solicitud a LLM:', {
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        modelo: this.llmService.activeModel
      });

      // Hacer solicitud al LLM
      const llmResponse = await this.llmService.makeLLMRequest({
        systemPrompt,
        userPrompt,
        functionName: 'generate-html-report',
        temperature: 0.3, // Menor temperatura para mayor consistencia
        maxTokens: 8000
      });

      const generationTime = Date.now() - startTime;

      console.log('✅ Reporte HTML generado exitosamente:', {
        tiempoGeneracion: `${generationTime}ms`,
        contenidoLength: llmResponse.content.length,
        modelo: llmResponse.model_used,
        tokens: llmResponse.tokens_used
      });

      // Validar que el contenido sea HTML válido
      if (!this.validateHTMLContent(llmResponse.content)) {
        throw new Error('El contenido generado no es HTML válido');
      }

      return {
        htmlContent: llmResponse.content,
        success: true,
        metadata: {
          generationTime,
          modelUsed: llmResponse.model_used || 'unknown',
          tokensUsed: llmResponse.tokens_used || 0
        }
      };

    } catch (error: any) {
      console.error('❌ Error generando reporte HTML:', error);
      
      return {
        htmlContent: '',
        success: false,
        error: error.message || 'Error desconocido al generar reporte',
        metadata: {
          generationTime: Date.now() - startTime,
          modelUsed: 'error',
          tokensUsed: 0
        }
      };
    }
  }

  /**
   * Construye el prompt del usuario con los datos formateados
   */
  private buildUserPrompt(formattedData: any, config: AIReportConfiguration): string {
    return `
Por favor genera un reporte HTML profesional con los siguientes datos:

**CONFIGURACIÓN DEL REPORTE:**
- Tipo: ${config.type === 'weekly' ? 'Semanal' : 'Mensual'}
- Esquema de colores: ${config.colorScheme || 'blue'}
- Nivel de detalle: ${config.detailLevel || 'detailed'}
- Incluir gráficos: ${config.includeCharts ? 'Sí' : 'No'}
- Incluir insights: ${config.includeInsights ? 'Sí' : 'No'}

**DATOS DEL PERÍODO:**
${JSON.stringify(formattedData, null, 2)}

IMPORTANTE: 
- El HTML debe ser completamente autónomo (CSS inline)
- Usar colores HSL apropiados para el esquema seleccionado
- Incluir gráficos usando Chart.js CDN si está habilitado
- El diseño debe ser responsive y profesional
- Agregar insights inteligentes basados en los datos
- Incluir llamadas a acción y recomendaciones
`;
  }

  /**
   * Valida que el contenido generado sea HTML válido
   */
  private validateHTMLContent(content: string): boolean {
    try {
      // Verificaciones básicas
      if (!content || content.length < 100) return false;
      if (!content.includes('<html') && !content.includes('<div')) return false;
      if (!content.includes('</') && !content.includes('/>')) return false;
      
      // Verificar que tenga estructura mínima
      const hasValidStructure = 
        content.includes('<') && 
        content.includes('>') &&
        (content.includes('<html') || content.includes('<div') || content.includes('<section'));

      return hasValidStructure;
    } catch (error) {
      console.error('Error validando HTML:', error);
      return false;
    }
  }

  /**
   * Genera reporte de fallback si falla la IA
   */
  generateFallbackHTML(data: ComprehensiveReportData): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte ${data.period.type === 'weekly' ? 'Semanal' : 'Mensual'}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .task-list { margin-top: 20px; }
        .task { padding: 10px; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Reporte ${data.period.type === 'weekly' ? 'Semanal' : 'Mensual'}</h1>
        <p>Del ${new Date(data.period.start).toLocaleDateString()} al ${new Date(data.period.end).toLocaleDateString()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric">
            <h3>Tareas Completadas</h3>
            <p>${data.periodData.tasksCompleted}</p>
        </div>
        <div class="metric">
            <h3>Tiempo Trabajado</h3>
            <p>${Math.round(data.periodData.timeWorked / 60)}h</p>
        </div>
        <div class="metric">
            <h3>Productividad</h3>
            <p>${data.periodData.avgProductivity.toFixed(1)}/5</p>
        </div>
    </div>
    
    <div class="task-list">
        <h2>Tareas del Período</h2>
        ${data.tasks?.slice(0, 10).map(task => `
            <div class="task">
                <strong>${task.title}</strong> - ${task.status}
                ${task.project_name ? `<br><small>Proyecto: ${task.project_name}</small>` : ''}
            </div>
        `).join('') || '<p>No hay tareas para mostrar</p>'}
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h3>Nota</h3>
        <p>Este es un reporte básico generado automáticamente. Para reportes más detallados, configure su integración con IA.</p>
    </div>
</body>
</html>`;
  }
}