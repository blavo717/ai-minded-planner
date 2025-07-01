
import { TaskContext } from '@/utils/taskContext';
import { TaskAISummary } from '@/services/taskAIService';

/**
 * Procesador ultra-conciso para análisis directo sin errores
 */
export class ConciseTaskProcessor {
  
  static processResponse(text: string, context: TaskContext): TaskAISummary {
    console.log('🎯 Procesando respuesta concisa');
    
    const cleanedText = this.cleanText(text);
    const sections = this.extractSections(cleanedText);
    const taskTitle = context.mainTask.title;
    const progress = context.completionStatus.overallProgress;
    
    return {
      statusSummary: this.buildConciseStatus(sections.estado, taskTitle, progress),
      nextSteps: this.buildConciseSteps(sections.proximo),
      riskLevel: this.extractRiskLevel(sections.riesgo),
      insights: this.buildConciseInsight(cleanedText, context)
    };
  }
  
  /**
   * Limpia texto de backticks problemáticos
   */
  static cleanText(text: string): string {
    return text
      .replace(/```/g, '') // Eliminar backticks triples
      .replace(/`/g, '') // Eliminar backticks simples
      .replace(/\n\s*\n/g, '\n') // Limpiar saltos múltiples
      .trim();
  }
  
  static extractSections(text: string) {
    const sections = {
      estado: '',
      proximo: '',
      riesgo: ''
    };
    
    // Buscar secciones por patrones flexibles
    const estadoMatch = text.match(/(?:estado|situación|status)[:\s]*([^\n]*)/i);
    const proximoMatch = text.match(/(?:próximo|pasos|acciones|next)[:\s]*([^\n]*)/i);
    const riesgoMatch = text.match(/(?:riesgo|peligro|problema|risk)[:\s]*([^\n]*)/i);
    
    sections.estado = estadoMatch?.[1]?.trim() || '';
    sections.proximo = proximoMatch?.[1]?.trim() || '';
    sections.riesgo = riesgoMatch?.[1]?.trim() || '';
    
    return sections;
  }
  
  static buildConciseStatus(estadoText: string, taskTitle: string, progress: number): string {
    if (estadoText && estadoText.length > 10) {
      return `"${taskTitle}" ${estadoText} (${progress}%)`;
    }
    
    // Fallback basado en progreso real
    if (progress >= 80) return `"${taskTitle}" casi terminada (${progress}%)`;
    if (progress >= 40) return `"${taskTitle}" en buen progreso (${progress}%)`;
    if (progress >= 10) return `"${taskTitle}" desarrollo inicial (${progress}%)`;
    return `"${taskTitle}" apenas iniciada (${progress}%)`;
  }
  
  static buildConciseSteps(proximoText: string): string {
    if (proximoText && proximoText.length > 10) {
      return proximoText.length > 100 ? proximoText.substring(0, 100) + '...' : proximoText;
    }
    
    return 'Revisar próximas subtareas específicas y continuar desarrollo';
  }
  
  static extractRiskLevel(riesgoText: string): 'low' | 'medium' | 'high' {
    const lowerText = riesgoText.toLowerCase();
    
    if (lowerText.includes('alto') || lowerText.includes('crítico') || lowerText.includes('urgente') || lowerText.includes('high')) {
      return 'high';
    }
    if (lowerText.includes('medio') || lowerText.includes('cuidado') || lowerText.includes('atención') || lowerText.includes('medium')) {
      return 'medium';
    }
    return 'low';
  }
  
  static buildConciseInsight(text: string, context: TaskContext): string | undefined {
    const daysSinceActivity = this.getDaysSinceLastActivity(context);
    const daysSinceCreated = this.getDaysSinceCreated(context);
    const progress = context.completionStatus.overallProgress;
    
    // Insights basados en datos reales
    if (daysSinceActivity > 5) {
      return `Sin actividad por ${daysSinceActivity} días - requiere atención`;
    }
    if (progress < 20 && daysSinceCreated > 7) {
      return 'Progreso lento - revisar bloqueos específicos';
    }
    if (progress > 70) {
      return 'Buen ritmo - mantener momentum actual';
    }
    
    // Si hay texto específico del LLM, usarlo pero limitado
    if (text.length > 50 && text.length < 200) {
      return text.substring(0, 150);
    }
    
    return undefined;
  }
  
  private static getDaysSinceLastActivity(context: TaskContext): number {
    try {
      if (!context.recentLogs || context.recentLogs.length === 0) {
        return this.getDaysSinceCreated(context);
      }
      
      const lastLog = context.recentLogs[0];
      if (!lastLog || !lastLog.created_at) {
        return this.getDaysSinceCreated(context);
      }
      
      const lastActivity = new Date(lastLog.created_at);
      if (isNaN(lastActivity.getTime())) {
        return this.getDaysSinceCreated(context);
      }
      
      const diffMs = new Date().getTime() - lastActivity.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Validar resultado
      if (diffDays < 0 || diffDays > 3650) {
        return this.getDaysSinceCreated(context);
      }
      
      return diffDays;
    } catch (error) {
      console.error('❌ Error calculando días sin actividad:', error);
      return this.getDaysSinceCreated(context);
    }
  }
  
  private static getDaysSinceCreated(context: TaskContext): number {
    try {
      const created = new Date(context.mainTask.created_at);
      if (isNaN(created.getTime())) {
        return 0;
      }
      
      const diffMs = new Date().getTime() - created.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      // Validar resultado
      if (diffDays < 0 || diffDays > 3650) {
        return 0;
      }
      
      return diffDays;
    } catch (error) {
      console.error('❌ Error calculando días desde creación:', error);
      return 0;
    }
  }
}
