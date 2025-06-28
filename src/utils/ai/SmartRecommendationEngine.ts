
import { AdvancedContext, ContextualRecommendation } from './AdvancedContextEngine';
import { AIInsight } from '@/types/ai-insights';
import { Task } from '@/hooks/useTasks';
import { PatternAnalysisResult } from '@/types/ai-patterns';

export interface SmartRecommendationConfig {
  enablePersonalization: boolean;
  enableLearning: boolean;
  adaptationRate: number; // 0-1
  diversityFactor: number; // 0-1
  maxRecommendations: number;
  minConfidenceThreshold: number;
}

export interface ActionableRecommendation extends ContextualRecommendation {
  priority: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'immediate' | 'short_term' | 'long_term';
  prerequisites: string[];
  dependencies: string[];
  successMetrics: string[];
  followUpActions: string[];
}

export interface RecommendationFeedback {
  recommendationId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  wasImplemented: boolean;
  implementationNotes?: string;
  perceivedValue: 'low' | 'medium' | 'high';
  improvementSuggestions?: string;
  timestamp: Date;
}

export class SmartRecommendationEngine {
  private config: SmartRecommendationConfig;
  private feedbackHistory: RecommendationFeedback[] = [];
  private userPreferences: Record<string, any> = {};

  constructor(config: Partial<SmartRecommendationConfig> = {}) {
    this.config = {
      enablePersonalization: true,
      enableLearning: true,
      adaptationRate: 0.1,
      diversityFactor: 0.3,
      maxRecommendations: 8,
      minConfidenceThreshold: 0.6,
      ...config,
    };
  }

  /**
   * Genera recomendaciones inteligentes y accionables
   */
  public async generateSmartRecommendations(
    advancedContext: AdvancedContext,
    currentTasks: Task[],
    patterns: PatternAnalysisResult,
    insights: AIInsight[],
    userFeedback: RecommendationFeedback[] = []
  ): Promise<ActionableRecommendation[]> {
    // Actualizar historial de feedback
    this.updateFeedbackHistory(userFeedback);
    
    // Generar recomendaciones base
    const baseRecommendations = this.generateBaseRecommendations(
      advancedContext,
      currentTasks,
      patterns,
      insights
    );
    
    // Personalizar basado en feedback previo
    const personalizedRecommendations = this.personalizeRecommendations(baseRecommendations);
    
    // Priorizar y filtrar
    const prioritizedRecommendations = this.prioritizeRecommendations(
      personalizedRecommendations,
      advancedContext
    );
    
    // Añadir diversidad
    const diversifiedRecommendations = this.addDiversity(prioritizedRecommendations);
    
    // Limitar cantidad
    return diversifiedRecommendations.slice(0, this.config.maxRecommendations);
  }

  private generateBaseRecommendations(
    context: AdvancedContext,
    tasks: Task[],
    patterns: PatternAnalysisResult,
    insights: AIInsight[]
  ): ActionableRecommendation[] {
    const recommendations: ActionableRecommendation[] = [];

    // Recomendaciones basadas en eficiencia del flujo de trabajo
    if (context.workflowEfficiency.overallScore < 0.7) {
      recommendations.push(this.createWorkflowOptimizationRecommendation(context));
    }

    // Recomendaciones basadas en horas de productividad
    if (context.userBehaviorProfile.peakProductivityHours.length > 0) {
      recommendations.push(this.createPeakHoursRecommendation(context));
    }

    // Recomendaciones basadas en cuellos de botella
    context.workflowEfficiency.bottlenecks.forEach(bottleneck => {
      if (bottleneck.severity > 0.5) {
        recommendations.push(this.createBottleneckRecommendation(bottleneck, context));
      }
    });

    // Recomendaciones basadas en patrones de procrastinación
    if (context.userBehaviorProfile.procrastinationPatterns.length > 0) {
      recommendations.push(this.createProcrastinationRecommendation(context));
    }

    // Recomendaciones basadas en insights críticos
    const criticalInsights = insights.filter(i => i.priority === 1 && i.category === 'critical');
    criticalInsights.forEach(insight => {
      recommendations.push(this.createInsightBasedRecommendation(insight, context));
    });

    // Recomendaciones basadas en tareas vencidas
    const overdueTasks = tasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    );
    if (overdueTasks.length > 2) {
      recommendations.push(this.createOverdueTasksRecommendation(overdueTasks, context));
    }

    return recommendations;
  }

  private createWorkflowOptimizationRecommendation(context: AdvancedContext): ActionableRecommendation {
    return {
      id: `workflow-optimization-${Date.now()}`,
      type: 'workflow_improvement',
      title: 'Optimización integral del flujo de trabajo',
      description: 'Tu eficiencia está por debajo del óptimo. Implementa estas mejoras para aumentar tu productividad.',
      impact: 'high',
      effort: 'medium',
      confidence: 0.85,
      basedOnPatterns: ['workflow-efficiency'],
      actionItems: [
        'Implementar bloques de tiempo para tipos de tareas similares',
        'Establecer rituales de inicio y fin de sesiones de trabajo',
        'Crear plantillas para tareas recurrentes',
        'Configurar notificaciones inteligentes para evitar interrupciones'
      ],
      estimatedTimeToImplement: 120,
      expectedResults: [
        'Aumento del 20-30% en productividad general',
        'Reducción del 40% en tiempo perdido entre tareas',
        'Mayor sensación de control y organización'
      ],
      createdAt: new Date(),
      priority: 1,
      urgency: 'high',
      category: 'short_term',
      prerequisites: [
        'Revisar las herramientas de gestión actuales',
        'Identificar las 3 tareas más frecuentes'
      ],
      dependencies: [],
      successMetrics: [
        'Eficiencia general >75%',
        'Reducción en tiempo de cambio entre tareas',
        'Aumento en tareas completadas por día'
      ],
      followUpActions: [
        'Revisar progreso semanalmente',
        'Ajustar bloques de tiempo según resultados',
        'Documentar mejores prácticas identificadas'
      ]
    };
  }

  private createPeakHoursRecommendation(context: AdvancedContext): ActionableRecommendation {
    const peakHour = context.userBehaviorProfile.peakProductivityHours[0];
    
    return {
      id: `peak-hours-optimization-${Date.now()}`,
      type: 'time_management',
      title: 'Maximizar horas de máxima productividad',
      description: `Protege y optimiza tu horario de ${peakHour}:00-${peakHour + 2}:00 para trabajo de alto valor.`,
      impact: 'high',
      effort: 'low',
      confidence: 0.9,
      basedOnPatterns: ['temporal-productivity'],
      actionItems: [
        `Bloquear ${peakHour}:00-${peakHour + 2}:00 en calendario como "Trabajo Profundo"`,
        'Preparar todas las herramientas necesarias antes de la hora pico',
        'Configurar modo "No molestar" durante este período',
        'Planificar las tareas más complejas para este horario'
      ],
      estimatedTimeToImplement: 30,
      expectedResults: [
        'Completar tareas complejas 50% más rápido',
        'Mejor calidad en el trabajo realizado',
        'Reducción significativa en fatiga mental'
      ],
      createdAt: new Date(),
      priority: 2,
      urgency: 'medium',
      category: 'immediate',
      prerequisites: [
        'Identificar tareas que requieren concentración profunda',
        'Configurar espacio de trabajo sin distracciones'
      ],
      dependencies: [],
      successMetrics: [
        'Uso consistente de las horas pico >80% de los días',
        'Aumento en productividad durante esas horas',
        'Reducción en interrupciones'
      ],
      followUpActions: [
        'Monitorear energía y concentración durante el horario',
        'Ajustar duración según resultados',
        'Identificar factores que mejoran el rendimiento'
      ]
    };
  }

  private createBottleneckRecommendation(
    bottleneck: any, 
    context: AdvancedContext
  ): ActionableRecommendation {
    return {
      id: `bottleneck-resolution-${Date.now()}`,
      type: 'workflow_improvement',
      title: `Resolver cuello de botella: ${bottleneck.area}`,
      description: `Se ha identificado un cuello de botella significativo en ${bottleneck.area} que está limitando tu productividad.`,
      impact: 'medium',
      effort: 'medium',
      confidence: 0.75,
      basedOnPatterns: ['bottleneck-analysis'],
      actionItems: bottleneck.suggestions,
      estimatedTimeToImplement: 90,
      expectedResults: [
        `Resolución del bloqueo en ${bottleneck.area}`,
        'Flujo de trabajo más suave',
        'Reducción en frustración y estrés'
      ],
      createdAt: new Date(),
      priority: Math.ceil(bottleneck.severity * 3),
      urgency: bottleneck.severity > 0.8 ? 'high' : 'medium',
      category: 'short_term',
      prerequisites: [
        'Analizar casos específicos del problema',
        'Identificar recursos disponibles para la solución'
      ],
      dependencies: [],
      successMetrics: [
        'Reducción en tiempo de resolución del problema',
        'Menor frecuencia de ocurrencia',
        'Mejora en satisfacción general'
      ],
      followUpActions: [
        'Monitorear la efectividad de las soluciones',
        'Documentar lecciones aprendidas',
        'Aplicar soluciones similares a otros problemas'
      ]
    };
  }

  private createProcrastinationRecommendation(context: AdvancedContext): ActionableRecommendation {
    const mainTrigger = context.userBehaviorProfile.procrastinationPatterns[0];
    
    return {
      id: `procrastination-management-${Date.now()}`,
      type: 'productivity_boost',
      title: 'Estrategia anti-procrastinación personalizada',
      description: `Se ha detectado procrastinación frecuente ante "${mainTrigger.trigger}". Implementa estas estrategias específicas.`,
      impact: 'medium',
      effort: 'low',
      confidence: 0.8,
      basedOnPatterns: ['procrastination-patterns'],
      actionItems: [
        'Aplicar la técnica Pomodoro para tareas difíciles',
        'Dividir tareas complejas en micro-tareas de 15 minutos',
        'Crear un ritual de "arranque" para superar la resistencia inicial',
        'Establecer recompensas inmediatas tras completar tareas difíciles'
      ],
      estimatedTimeToImplement: 45,
      expectedResults: [
        'Reducción del 50% en procrastinación',
        'Inicio más rápido de tareas difíciles',
        'Mayor confianza para abordar desafíos'
      ],
      createdAt: new Date(),
      priority: 2,
      urgency: 'medium',
      category: 'immediate',
      prerequisites: [
        'Identificar el patrón específico de procrastinación',
        'Seleccionar las técnicas más adecuadas al estilo personal'
      ],
      dependencies: [],
      successMetrics: [
        'Tiempo de inicio de tareas <5 minutos',
        'Reducción en tareas pospuestas',
        'Aumento en sensación de logro'
      ],
      followUpActions: [
        'Experimentar con diferentes técnicas',
        'Ajustar estrategias según efectividad',
        'Crear lista personal de técnicas efectivas'
      ]
    };
  }

  private createInsightBasedRecommendation(
    insight: AIInsight,
    context: AdvancedContext
  ): ActionableRecommendation {
    return {
      id: `insight-action-${insight.id}`,
      type: 'task_optimization',
      title: `Acción requerida: ${insight.title}`,
      description: insight.description,
      impact: insight.priority === 1 ? 'high' : 'medium',
      effort: 'low',
      confidence: insight.confidence,
      basedOnPatterns: [insight.id],
      actionItems: insight.actions?.map(a => a.label) || ['Revisar y tomar acción'],
      estimatedTimeToImplement: 30,
      expectedResults: [
        'Resolución del problema identificado',
        'Prevención de problemas futuros similares'
      ],
      createdAt: new Date(),
      priority: insight.priority,
      urgency: insight.category === 'critical' ? 'critical' : 'medium',
      category: 'immediate',
      prerequisites: [],
      dependencies: [],
      successMetrics: [
        'Resolución del problema específico',
        'Mejora en el área identificada'
      ],
      followUpActions: [
        'Monitorear el área de mejora',
        'Aplicar aprendizajes a situaciones similares'
      ]
    };
  }

  private createOverdueTasksRecommendation(
    overdueTasks: Task[],
    context: AdvancedContext
  ): ActionableRecommendation {
    return {
      id: `overdue-management-${Date.now()}`,
      type: 'task_optimization',
      title: 'Plan de recuperación para tareas vencidas',
      description: `Tienes ${overdueTasks.length} tareas vencidas. Es crítico abordar esta situación para recuperar el control.`,
      impact: 'high',
      effort: 'high',
      confidence: 0.9,
      basedOnPatterns: ['overdue-analysis'],
      actionItems: [
        'Revisar todas las tareas vencidas y evaluar su relevancia actual',
        'Renegociar fechas límite donde sea posible',
        'Priorizar las 3 tareas más críticas para completar hoy',
        'Delegar o eliminar tareas que ya no son relevantes',
        'Implementar sistema de alertas preventivas'
      ],
      estimatedTimeToImplement: 180,
      expectedResults: [
        'Reducción a <3 tareas vencidas en 1 semana',
        'Sistema preventivo implementado',
        'Reducción del estrés relacionado con fechas límite'
      ],
      createdAt: new Date(),
      priority: 1,
      urgency: 'critical',
      category: 'immediate',
      prerequisites: [
        'Bloquear 3 horas para sesión de reorganización',
        'Contactar stakeholders para renegociar fechas'
      ],
      dependencies: [],
      successMetrics: [
        'Número de tareas vencidas <3',
        'Tiempo promedio de retraso <2 días',
        'Implementación de sistema preventivo'
      ],
      followUpActions: [
        'Revisión semanal de fechas próximas',
        'Calibrar estimaciones de tiempo',
        'Mejorar proceso de planificación'
      ]
    };
  }

  private personalizeRecommendations(
    recommendations: ActionableRecommendation[]
  ): ActionableRecommendation[] {
    if (!this.config.enablePersonalization) return recommendations;

    return recommendations.map(rec => {
      // Ajustar basado en feedback previo
      const similarFeedback = this.feedbackHistory.filter(f => 
        f.recommendationId.includes(rec.type)
      );

      if (similarFeedback.length > 0) {
        const avgRating = similarFeedback.reduce((sum, f) => sum + f.rating, 0) / similarFeedback.length;
        const implementationRate = similarFeedback.filter(f => f.wasImplemented).length / similarFeedback.length;

        // Ajustar confianza basado en historial
        rec.confidence = rec.confidence * (0.7 + 0.3 * (avgRating / 5));
        
        // Ajustar prioridad basado en implementación previa
        if (implementationRate > 0.7) {
          rec.priority = Math.max(1, rec.priority - 1);
        }
      }

      return rec;
    });
  }

  private prioritizeRecommendations(
    recommendations: ActionableRecommendation[],
    context: AdvancedContext
  ): ActionableRecommendation[] {
    return recommendations
      .filter(rec => rec.confidence >= this.config.minConfidenceThreshold)
      .sort((a, b) => {
        // Ordenar por urgencia primero
        const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        
        // Luego por impacto vs esfuerzo
        const getImpactEffortScore = (rec: ActionableRecommendation) => {
          const impactScore = rec.impact === 'high' ? 3 : rec.impact === 'medium' ? 2 : 1;
          const effortPenalty = rec.effort === 'high' ? 3 : rec.effort === 'medium' ? 2 : 1;
          return (impactScore / effortPenalty) * rec.confidence;
        };

        return getImpactEffortScore(b) - getImpactEffortScore(a);
      });
  }

  private addDiversity(recommendations: ActionableRecommendation[]): ActionableRecommendation[] {
    if (this.config.diversityFactor === 0) return recommendations;

    const diversified: ActionableRecommendation[] = [];
    const typeCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};

    for (const rec of recommendations) {
      const typeFreq = typeCount[rec.type] || 0;
      const categoryFreq = categoryCount[rec.category] || 0;
      
      // Calcular penalización por diversidad
      const diversityPenalty = (typeFreq + categoryFreq) * this.config.diversityFactor;
      
      if (diversityPenalty < 2 || diversified.length < 3) {
        diversified.push(rec);
        typeCount[rec.type] = typeFreq + 1;
        categoryCount[rec.category] = categoryFreq + 1;
      }
    }

    return diversified;
  }

  private updateFeedbackHistory(feedback: RecommendationFeedback[]): void {
    this.feedbackHistory.push(...feedback);
    
    // Mantener solo feedback de los últimos 90 días
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    this.feedbackHistory = this.feedbackHistory.filter(
      f => f.timestamp > ninetyDaysAgo
    );
  }

  /**
   * Registra feedback del usuario sobre una recomendación
   */
  public recordFeedback(feedback: RecommendationFeedback): void {
    this.feedbackHistory.push(feedback);
    
    if (this.config.enableLearning) {
      this.adaptBasedOnFeedback(feedback);
    }
  }

  private adaptBasedOnFeedback(feedback: RecommendationFeedback): void {
    // Implementar lógica de aprendizaje adaptativo
    const adaptationFactor = this.config.adaptationRate;
    
    // Ajustar preferencias del usuario basado en feedback
    if (!this.userPreferences[feedback.recommendationId]) {
      this.userPreferences[feedback.recommendationId] = {
        effectivenessScore: feedback.rating / 5,
        implementationLikelihood: feedback.wasImplemented ? 1 : 0,
        perceivedValueScore: feedback.perceivedValue === 'high' ? 1 : 
                           feedback.perceivedValue === 'medium' ? 0.5 : 0
      };
    } else {
      const current = this.userPreferences[feedback.recommendationId];
      current.effectivenessScore += adaptationFactor * ((feedback.rating / 5) - current.effectivenessScore);
      current.implementationLikelihood += adaptationFactor * ((feedback.wasImplemented ? 1 : 0) - current.implementationLikelihood);
      current.perceivedValueScore += adaptationFactor * (
        (feedback.perceivedValue === 'high' ? 1 : feedback.perceivedValue === 'medium' ? 0.5 : 0) - 
        current.perceivedValueScore
      );
    }
  }

  /**
   * Obtiene estadísticas de efectividad de recomendaciones
   */
  public getEffectivenessStats(): {
    totalRecommendations: number;
    implementationRate: number;
    averageRating: number;
    topPerformingTypes: string[];
  } {
    const total = this.feedbackHistory.length;
    const implemented = this.feedbackHistory.filter(f => f.wasImplemented).length;
    const totalRating = this.feedbackHistory.reduce((sum, f) => sum + f.rating, 0);
    
    const typePerformance: Record<string, { count: number; avgRating: number; implRate: number }> = {};
    
    this.feedbackHistory.forEach(f => {
      const type = f.recommendationId.split('-')[0];
      if (!typePerformance[type]) {
        typePerformance[type] = { count: 0, avgRating: 0, implRate: 0 };
      }
      typePerformance[type].count++;
      typePerformance[type].avgRating += f.rating;
      if (f.wasImplemented) typePerformance[type].implRate++;
    });
    
    Object.values(typePerformance).forEach(perf => {
      perf.avgRating /= perf.count;
      perf.implRate /= perf.count;
    });
    
    const topTypes = Object.entries(typePerformance)
      .sort(([,a], [,b]) => (b.avgRating * b.implRate) - (a.avgRating * a.implRate))
      .slice(0, 3)
      .map(([type]) => type);

    return {
      totalRecommendations: total,
      implementationRate: total > 0 ? implemented / total : 0,
      averageRating: total > 0 ? totalRating / total : 0,
      topPerformingTypes: topTypes
    };
  }
}

// Instancia por defecto
export const defaultSmartRecommendationEngine = new SmartRecommendationEngine();
