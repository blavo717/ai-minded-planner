
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContextualData } from './useContextualData';
import { ContextAnalyzer, ContextAnalysis } from '@/utils/ai/ContextAnalyzer';
import { ContextPrioritizer, PrioritizedContext } from '@/utils/ai/ContextPrioritizer';
import { contextCache } from '@/utils/ai/ContextCache';
import { ExtendedAIContext } from '@/types/ai-context';

export interface AdvancedContextConfig {
  enableCache?: boolean;
  enablePrioritization?: boolean;
  enableRealtimeAnalysis?: boolean;
  cacheTimeout?: number;
  analysisInterval?: number;
}

export interface AdvancedContextState {
  context: PrioritizedContext | null;
  analysis: ContextAnalysis | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  lastUpdate: Date | null;
  cacheStats: any;
  recommendations: string[];
  focusArea: string;
  nextActions: string[];
}

const DEFAULT_CONFIG: AdvancedContextConfig = {
  enableCache: true,
  enablePrioritization: true,
  enableRealtimeAnalysis: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  analysisInterval: 2 * 60 * 1000, // 2 minutos
};

export const useAdvancedContext = (config: AdvancedContextConfig = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { user } = useAuth();
  const contextualData = useContextualData({
    enableAnalysis: true,
    refreshInterval: finalConfig.analysisInterval,
    maxDataPoints: 50,
  });

  const [state, setState] = useState<AdvancedContextState>({
    context: null,
    analysis: null,
    isLoading: true,
    isAnalyzing: false,
    lastUpdate: null,
    cacheStats: null,
    recommendations: [],
    focusArea: 'tasks',
    nextActions: [],
  });

  // Procesar contexto avanzado
  const processAdvancedContext = useCallback(async () => {
    if (!contextualData.context || !user?.id) return;

    setState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      let context: PrioritizedContext;
      let analysis: ContextAnalysis;

      // Intentar obtener del cache si está habilitado
      if (finalConfig.enableCache) {
        const cached = contextCache.get(user.id, 'advanced');
        
        if (cached && !contextCache.hasChanged(user.id, contextualData.context, 'advanced')) {
          context = cached.context as PrioritizedContext;
          analysis = cached.analysis!;
        } else {
          // Generar nuevo contexto
          analysis = ContextAnalyzer.analyzeSituation(contextualData.context);
          
          if (finalConfig.enablePrioritization) {
            context = ContextPrioritizer.prioritizeContext(
              contextualData.context,
              analysis
            );
          } else {
            context = {
              ...contextualData.context,
              prioritizedTasks: [],
              prioritizedProjects: [],
              focusRecommendations: [],
              timeAllocation: { tasks: 40, projects: 30, planning: 20, review: 10 },
            };
          }

          // Guardar en cache
          contextCache.set(user.id, context, analysis, 'advanced', finalConfig.cacheTimeout);
        }
      } else {
        // Sin cache
        analysis = ContextAnalyzer.analyzeSituation(contextualData.context);
        
        if (finalConfig.enablePrioritization) {
          context = ContextPrioritizer.prioritizeContext(
            contextualData.context,
            analysis
          );
        } else {
          context = {
            ...contextualData.context,
            prioritizedTasks: [],
            prioritizedProjects: [],
            focusRecommendations: [],
            timeAllocation: { tasks: 40, projects: 30, planning: 20, review: 10 },
          };
        }
      }

      // Generar recomendaciones y próximas acciones
      const recommendations = generateSmartRecommendations(context, analysis);
      const nextActions = generateNextActions(context, analysis);

      setState({
        context,
        analysis,
        isLoading: false,
        isAnalyzing: false,
        lastUpdate: new Date(),
        cacheStats: finalConfig.enableCache ? contextCache.getStats() : null,
        recommendations,
        focusArea: analysis.focusArea,
        nextActions,
      });
    } catch (error) {
      console.error('Error processing advanced context:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAnalyzing: false,
      }));
    }
  }, [contextualData.context, user?.id, finalConfig]);

  // Generar recomendaciones inteligentes
  const generateSmartRecommendations = useCallback((
    context: PrioritizedContext,
    analysis: ContextAnalysis
  ): string[] => {
    const recommendations: string[] = [];

    // Agregar recomendaciones del análisis
    recommendations.push(...analysis.recommendedActions);

    // Agregar recomendaciones de foco
    recommendations.push(...context.focusRecommendations);

    // Recomendaciones basadas en contexto temporal
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 11 && context.prioritizedTasks.length > 0) {
      recommendations.push('Hora ideal para tareas complejas - aprovecha tu pico de energía');
    }

    if (context.currentSession.isWeekend && analysis.urgencyScore < 50) {
      recommendations.push('Fin de semana - perfecto para planificar la semana que viene');
    }

    return Array.from(new Set(recommendations)).slice(0, 6);
  }, []);

  // Generar próximas acciones
  const generateNextActions = useCallback((
    context: PrioritizedContext,
    analysis: ContextAnalysis
  ): string[] => {
    const actions: string[] = [];

    // Top 3 tareas priorizadas
    const topTasks = context.prioritizedTasks.slice(0, 3);
    topTasks.forEach((task, index) => {
      actions.push(`${index + 1}. ${task.title} (${task.priority})`);
    });

    // Acción de proyecto si aplica
    if (context.prioritizedProjects.length > 0 && analysis.focusArea === 'projects') {
      const topProject = context.prioritizedProjects[0];
      actions.push(`Avanzar proyecto: ${topProject.name} (${topProject.progress}%)`);
    }

    // Acción basada en análisis
    if (analysis.urgencyScore > 80) {
      actions.unshift('🚨 Atender tareas urgentes primero');
    } else if (analysis.workloadLevel === 'light') {
      actions.push('💡 Considera tiempo para mejoras de proceso');
    }

    return actions.slice(0, 5);
  }, []);

  // Forzar actualización
  const forceRefresh = useCallback(() => {
    if (user?.id && finalConfig.enableCache) {
      contextCache.invalidate(user.id, 'advanced');
    }
    contextualData.updateContextualData();
  }, [user?.id, finalConfig.enableCache, contextualData.updateContextualData]);

  // Obtener recomendaciones para un momento específico
  const getTimeBasedRecommendations = useCallback((targetHour?: number) => {
    if (!state.context) return [];

    const hour = targetHour || new Date().getHours();
    const recommendations: string[] = [];

    // Recomendaciones basadas en patrones de trabajo
    if (state.context.workPatterns?.mostProductiveHours.includes(hour)) {
      recommendations.push('Hora de máxima productividad - ideal para tareas complejas');
      
      const complexTasks = state.context.prioritizedTasks
        .filter(task => task.priority === 'high' || task.priority === 'urgent')
        .slice(0, 2);
      
      if (complexTasks.length > 0) {
        recommendations.push(`Tareas sugeridas: ${complexTasks.map(t => t.title).join(', ')}`);
      }
    } else if (hour >= 14 && hour <= 16) {
      recommendations.push('Hora de menor energía - ideal para tareas administrativas');
    } else if (hour >= 17 && hour <= 19) {
      recommendations.push('Final del día - tiempo de revisión y planificación');
    }

    return recommendations;
  }, [state.context]);

  // Efectos
  useEffect(() => {
    if (contextualData.context && !contextualData.isLoading) {
      processAdvancedContext();
    }
  }, [contextualData.context, contextualData.isLoading, processAdvancedContext]);

  // Auto-actualización en tiempo real
  useEffect(() => {
    if (!finalConfig.enableRealtimeAnalysis) return;

    const interval = setInterval(() => {
      if (!state.isAnalyzing && contextualData.context) {
        processAdvancedContext();
      }
    }, finalConfig.analysisInterval);

    return () => clearInterval(interval);
  }, [finalConfig.enableRealtimeAnalysis, finalConfig.analysisInterval, state.isAnalyzing, processAdvancedContext]);

  return {
    // Estado principal
    ...state,
    
    // Controles
    forceRefresh,
    
    // Utilidades
    getTimeBasedRecommendations,
    hasHighQualityContext: contextualData.hasHighQualityData,
    needsMoreData: contextualData.needsMoreData,
    
    // Información de configuración
    config: finalConfig,
    
    // Estadísticas de rendimiento
    performanceStats: {
      cacheHitRate: state.cacheStats?.hitRate || 0,
      avgProcessingTime: 0, // Se podría implementar
      dataQuality: contextualData.dataQuality,
    },
  };
};
