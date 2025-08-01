import { MonthlyReportData, TaskData, ProjectData } from '@/types/reportTypes';

/**
 * Servicio de análisis inteligente para generar insights automáticos
 * Fase 4: Contenido Inteligente y Analytics
 */
export class IntelligentAnalyticsService {
  
  /**
   * Genera insights automáticos basados en datos del reporte
   */
  static generateIntelligentInsights(data: MonthlyReportData): string[] {
    const insights: string[] = [];
    
    // Análisis de productividad
    const completionRate = data.metrics?.completionRate || 0;
    const tasksCompleted = data.metrics?.tasksCompleted || 0;
    const timeWorked = data.metrics?.timeWorked || 0;
    
    // Insight de rendimiento general
    if (completionRate > 0.8) {
      insights.push("🎯 Excelente tasa de completación: mantienes un rendimiento superior al 80%");
    } else if (completionRate > 0.6) {
      insights.push("✅ Buena tasa de completación: hay oportunidades para optimizar al 80%+");
    } else {
      insights.push("⚠️ Tasa de completación mejorable: considera revisar la planificación de tareas");
    }
    
    // Análisis de volumen de trabajo
    const avgTasksPerDay = tasksCompleted / 30;
    if (avgTasksPerDay > 5) {
      insights.push("🚀 Alto volumen de trabajo: procesaste más de 5 tareas diarias en promedio");
    } else if (avgTasksPerDay > 3) {
      insights.push("⚖️ Volumen equilibrado: mantienes un ritmo sostenible de trabajo");
    } else {
      insights.push("📈 Oportunidad de crecimiento: podrías incrementar el volumen de tareas");
    }
    
    // Análisis temporal
    const hoursWorked = timeWorked / 60;
    if (hoursWorked > 160) { // Más de 5.3h/día
      insights.push("⏰ Intensa dedicación: inviertes significativo tiempo en las tareas");
    } else if (hoursWorked > 120) { // 4h/día
      insights.push("⏳ Tiempo balanceado: mantienes una dedicación consistente");
    } else {
      insights.push("🎯 Eficiencia enfocada: logras resultados con tiempo optimizado");
    }
    
    // Análisis de proyectos
    const activeProjects = data.projects?.filter(p => p.status === 'activo').length || 0;
    if (activeProjects > 5) {
      insights.push("🎪 Multitarea avanzada: gestionas múltiples proyectos simultáneamente");
    } else if (activeProjects > 2) {
      insights.push("🎯 Enfoque diversificado: balanceas bien múltiples proyectos");
    } else {
      insights.push("🔍 Enfoque concentrado: priorizas calidad sobre cantidad de proyectos");
    }
    
    return insights.slice(0, 4); // Máximo 4 insights
  }
  
  /**
   * Genera recomendaciones inteligentes basadas en patrones
   */
  static generateSmartRecommendations(data: MonthlyReportData): string[] {
    const recommendations: string[] = [];
    
    const completionRate = data.metrics?.completionRate || 0;
    const productivity = data.metrics?.productivity || 0;
    const tasksCompleted = data.metrics?.tasksCompleted || 0;
    
    // Recomendaciones de productividad
    if (completionRate < 0.7) {
      recommendations.push("📋 Implementa bloques de tiempo dedicados para mejorar la tasa de completación");
      recommendations.push("🎯 Revisa el tamaño de las tareas - divide las grandes en subtareas más manejables");
    }
    
    if (productivity < 0.6) {
      recommendations.push("⚡ Identifica y elimina las interrupciones durante las horas de mayor productividad");
      recommendations.push("🔄 Establece rutinas de trabajo que optimicen tu energía natural");
    }
    
    if (tasksCompleted < 30) { // Menos de 1 por día
      recommendations.push("📈 Considera establecer metas diarias específicas para incrementar el volumen");
      recommendations.push("🎲 Utiliza técnicas como Pomodoro para mantener momentum constante");
    }
    
    // Recomendaciones de balance
    const weeklyVariation = this.calculateWeeklyVariation(data.weeklyBreakdown);
    if (weeklyVariation > 0.5) {
      recommendations.push("⚖️ Busca distribuir la carga de trabajo más uniformemente entre semanas");
    }
    
    // Recomendaciones de proyectos
    const projectsWithLowProgress = data.projects?.filter(p => p.progress < 30).length || 0;
    if (projectsWithLowProgress > 2) {
      recommendations.push("🎯 Revisa proyectos con bajo progreso - considera re-priorizar o reestructurar");
    }
    
    return recommendations.slice(0, 4); // Máximo 4 recomendaciones
  }
  
  /**
   * Análisis predictivo simple basado en tendencias
   */
  static generatePredictiveAnalysis(data: MonthlyReportData): {
    trend: 'ascending' | 'descending' | 'stable';
    prediction: string;
    confidence: number;
  } {
    const weeklyData = data.weeklyBreakdown || [];
    
    if (weeklyData.length < 2) {
      return {
        trend: 'stable',
        prediction: 'Datos insuficientes para análisis predictivo',
        confidence: 0
      };
    }
    
    // Calcular tendencia simple
    const firstHalf = weeklyData.slice(0, 2).reduce((sum, week) => sum + (week.tasksCompleted || 0), 0);
    const secondHalf = weeklyData.slice(2, 4).reduce((sum, week) => sum + (week.tasksCompleted || 0), 0);
    
    const trendDirection = secondHalf > firstHalf ? 'ascending' : 
                          secondHalf < firstHalf ? 'descending' : 'stable';
    
    const changePercent = Math.abs((secondHalf - firstHalf) / firstHalf * 100);
    
    let prediction = '';
    let confidence = Math.min(80, changePercent * 2); // Máximo 80% de confianza
    
    switch (trendDirection) {
      case 'ascending':
        prediction = `Tendencia positiva: se proyecta un incremento del ${changePercent.toFixed(1)}% en productividad`;
        break;
      case 'descending':
        prediction = `Tendencia descendente: se sugiere reforzar estrategias para revertir la disminución del ${changePercent.toFixed(1)}%`;
        break;
      case 'stable':
        prediction = 'Tendencia estable: mantén las estrategias actuales para consistencia';
        confidence = 60;
        break;
    }
    
    return { trend: trendDirection, prediction, confidence };
  }
  
  /**
   * Genera alertas inteligentes basadas en umbrales
   */
  static generateIntelligentAlerts(data: MonthlyReportData): Array<{
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
  }> {
    const alerts = [];
    
    const completionRate = data.metrics?.completionRate || 0;
    const productivity = data.metrics?.productivity || 0;
    
    // Alertas de rendimiento
    if (completionRate > 0.9) {
      alerts.push({
        type: 'success' as const,
        title: '🏆 Rendimiento Excepcional',
        message: 'Tasa de completación superior al 90% - ¡Excelente trabajo!'
      });
    } else if (completionRate < 0.5) {
      alerts.push({
        type: 'danger' as const,
        title: '⚠️ Alerta de Rendimiento',
        message: 'Tasa de completación por debajo del 50% - requiere atención inmediata'
      });
    }
    
    // Alertas de productividad
    if (productivity > 0.8) {
      alerts.push({
        type: 'success' as const,
        title: '⚡ Alta Productividad',
        message: 'Nivel de productividad excepcional mantenido durante el período'
      });
    } else if (productivity < 0.4) {
      alerts.push({
        type: 'warning' as const,
        title: '📉 Productividad Baja',
        message: 'Se recomienda revisar métodos de trabajo y eliminar obstáculos'
      });
    }
    
    // Alertas de balance
    const weeklyVariation = this.calculateWeeklyVariation(data.weeklyBreakdown);
    if (weeklyVariation > 0.6) {
      alerts.push({
        type: 'info' as const,
        title: '⚖️ Variabilidad Semanal',
        message: 'Gran variación entre semanas - considera nivelar la carga de trabajo'
      });
    }
    
    return alerts.slice(0, 3); // Máximo 3 alertas
  }
  
  /**
   * Calcula el coeficiente de variación semanal
   */
  private static calculateWeeklyVariation(weeklyData: any[]): number {
    if (!weeklyData || weeklyData.length < 2) return 0;
    
    const values = weeklyData.map(week => week.tasksCompleted || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return mean > 0 ? stdDev / mean : 0;
  }
  
  /**
   * Análisis de patrones de trabajo
   */
  static analyzeWorkPatterns(data: MonthlyReportData): {
    peakPerformancePattern: string;
    workloadDistribution: string;
    efficiencyScore: number;
    recommendations: string[];
  } {
    const weeklyData = data.weeklyBreakdown || [];
    const productivity = data.metrics?.productivity || 0;
    const completionRate = data.metrics?.completionRate || 0;
    
    // Identificar patrón de rendimiento pico
    const peakWeek = weeklyData.reduce((max, week, index) => 
      (week.tasksCompleted || 0) > (weeklyData[max]?.tasksCompleted || 0) ? index : max, 0
    );
    
    const peakPerformancePattern = peakWeek === 0 ? 'Inicio fuerte' :
                                  peakWeek === weeklyData.length - 1 ? 'Cierre poderoso' :
                                  'Rendimiento intermedio pico';
    
    // Analizar distribución de carga
    const totalTasks = weeklyData.reduce((sum, week) => sum + (week.tasksCompleted || 0), 0);
    const avgTasksPerWeek = totalTasks / weeklyData.length;
    const balancedWeeks = weeklyData.filter(week => 
      Math.abs((week.tasksCompleted || 0) - avgTasksPerWeek) <= avgTasksPerWeek * 0.3
    ).length;
    
    const workloadDistribution = balancedWeeks >= weeklyData.length * 0.75 ? 'Equilibrada' :
                               balancedWeeks >= weeklyData.length * 0.5 ? 'Moderadamente variable' :
                               'Altamente variable';
    
    // Calcular score de eficiencia
    const efficiencyScore = Math.round((productivity * 0.6 + completionRate * 0.4) * 100);
    
    // Generar recomendaciones específicas
    const recommendations = [];
    
    if (peakPerformancePattern === 'Inicio fuerte') {
      recommendations.push('Mantén la energía inicial - programa tareas críticas al comienzo');
    } else if (peakPerformancePattern === 'Cierre poderoso') {
      recommendations.push('Aprovecha tu momentum final - usa deadlines como motivación');
    }
    
    if (workloadDistribution === 'Altamente variable') {
      recommendations.push('Implementa técnicas de planificación para distribuir mejor la carga');
    }
    
    if (efficiencyScore < 70) {
      recommendations.push('Enfócate en optimizar procesos para mejorar la eficiencia general');
    }
    
    return {
      peakPerformancePattern,
      workloadDistribution,
      efficiencyScore,
      recommendations: recommendations.slice(0, 3)
    };
  }
}