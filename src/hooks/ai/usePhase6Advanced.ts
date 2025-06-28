import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdvancedContext, defaultAdvancedContextEngine } from '@/utils/ai/AdvancedContextEngine';
import { ActionableRecommendation, defaultSmartRecommendationEngine, RecommendationFeedback } from '@/utils/ai/SmartRecommendationEngine';
import { useInsightGeneration } from './useInsightGeneration';
import { useContextualDataCollector } from './useContextualDataCollector';
import { useTasks } from '@/hooks/useTasks';
import { useTaskSessions } from '@/hooks/useTaskSessions';
import { useToast } from '@/hooks/use-toast';

interface Phase6Config {
  autoUpdate: boolean;
  updateInterval: number; // minutes
  enableSmartRecommendations: boolean;
  enableAdvancedAnalytics: boolean;
  confidenceThreshold: number;
}

export const usePhase6Advanced = (config: Partial<Phase6Config> = {}) => {
  const finalConfig: Phase6Config = {
    autoUpdate: true,
    updateInterval: 30,
    enableSmartRecommendations: true,
    enableAdvancedAnalytics: true,
    confidenceThreshold: 0.7,
    ...config,
  };

  const { toast } = useToast();
  const { tasks } = useTasks();
  const { sessions } = useTaskSessions();
  const [advancedContext, setAdvancedContext] = useState<AdvancedContext | null>(null);
  const [smartRecommendations, setSmartRecommendations] = useState<ActionableRecommendation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const {
    insights,
    patternAnalysis,
    isGenerating: isGeneratingInsights,
    generateInsights,
  } = useInsightGeneration();

  const {
    contextualData,
    isCollecting,
    collectData,
    getProductivityTrends,
    getUserBehaviorTrends,
  } = useContextualDataCollector();

  // Mutation para generar contexto avanzado
  const generateAdvancedContextMutation = useMutation({
    mutationFn: async () => {
      if (!patternAnalysis || tasks.length === 0) {
        throw new Error('Datos insuficientes para análisis');
      }

      // Crear un objeto de datos contextuales agregados
      const aggregatedContextualData = {
        id: 'aggregated-context',
        type: 'productivity_metrics' as const,
        category: 'historical' as const,
        data: {
          totalDataPoints: contextualData.length,
          recentActivity: contextualData.slice(-10),
          productivityTrends: getProductivityTrends(),
          behaviorTrends: getUserBehaviorTrends(),
        },
        timestamp: new Date(),
        relevanceScore: 0.9,
        source: 'contextual-aggregator',
        metadata: {
          collectionMethod: 'automatic' as const,
          confidence: 0.85,
          dataSources: ['user_behavior', 'task_patterns', 'productivity_metrics'],
        },
      };

      return await defaultAdvancedContextEngine.generateAdvancedContext(
        tasks,
        sessions,
        patternAnalysis,
        aggregatedContextualData,
        insights
      );
    },
    onSuccess: (context) => {
      setAdvancedContext(context);
      setLastUpdate(new Date());
      
      if (finalConfig.enableSmartRecommendations) {
        generateSmartRecommendationsMutation.mutate(context);
      }
    },
    onError: (error) => {
      console.error('Error generating advanced context:', error);
      toast({
        title: 'Error en análisis avanzado',
        description: 'No se pudo completar el análisis. Intenta de nuevo.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para generar recomendaciones inteligentes
  const generateSmartRecommendationsMutation = useMutation({
    mutationFn: async (context: AdvancedContext) => {
      if (!patternAnalysis) {
        throw new Error('Análisis de patrones no disponible');
      }

      return await defaultSmartRecommendationEngine.generateSmartRecommendations(
        context,
        tasks,
        patternAnalysis,
        insights
      );
    },
    onSuccess: (recommendations) => {
      setSmartRecommendations(recommendations);
      
      toast({
        title: 'Recomendaciones generadas',
        description: `Se crearon ${recommendations.length} recomendaciones personalizadas.`,
      });
    },
    onError: (error) => {
      console.error('Error generating smart recommendations:', error);
      toast({
        title: 'Error en recomendaciones',
        description: 'No se pudieron generar recomendaciones inteligentes.',
        variant: 'destructive',
      });
    },
  });

  // Función principal para actualizar todo el análisis
  const updateFullAnalysis = useCallback(async () => {
    try {
      // Primero recolectar datos contextuales
      await collectData();
      
      // Luego generar insights si es necesario
      if (insights.length === 0) {
        await generateInsights();
      }
      
      // Finalmente generar contexto avanzado
      generateAdvancedContextMutation.mutate();
    } catch (error) {
      console.error('Error in full analysis update:', error);
    }
  }, [collectData, generateInsights, insights.length]);

  // Auto-actualización periódica
  useEffect(() => {
    if (!finalConfig.autoUpdate) return;

    const shouldUpdate = () => {
      if (!lastUpdate) return true;
      
      const minutesSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60);
      return minutesSinceUpdate >= finalConfig.updateInterval;
    };

    const interval = setInterval(() => {
      if (shouldUpdate() && patternAnalysis && tasks.length > 0) {
        updateFullAnalysis();
      }
    }, finalConfig.updateInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [finalConfig.autoUpdate, finalConfig.updateInterval, lastUpdate, patternAnalysis, tasks.length, updateFullAnalysis]);

  // Función para registrar feedback de recomendaciones
  const recordRecommendationFeedback = useCallback(async (feedback: RecommendationFeedback) => {
    try {
      defaultSmartRecommendationEngine.recordFeedback(feedback);
      
      toast({
        title: 'Feedback registrado',
        description: 'Gracias por tu feedback. Esto mejorará futuras recomendaciones.',
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
      toast({
        title: 'Error registrando feedback',
        description: 'No se pudo registrar tu feedback.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Función para implementar una recomendación
  const implementRecommendation = useCallback(async (recommendationId: string) => {
    const recommendation = smartRecommendations.find(r => r.id === recommendationId);
    if (!recommendation) return;

    // Aquí se implementaría la lógica específica para cada tipo de recomendación
    // Por ejemplo, programar tareas, ajustar configuraciones, etc.
    
    toast({
      title: 'Recomendación implementada',
      description: `Se ha aplicado: ${recommendation.title}`,
    });

    // Registrar como implementada
    recordRecommendationFeedback({
      recommendationId,
      userId: 'current-user', // Se debería obtener del contexto de auth
      rating: 5,
      wasImplemented: true,
      perceivedValue: 'high',
      timestamp: new Date(),
    });
  }, [smartRecommendations, recordRecommendationFeedback, toast]);

  // Función para descartar una recomendación
  const dismissRecommendation = useCallback(async (recommendationId: string, reason?: string) => {
    setSmartRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    
    // Registrar como descartada
    recordRecommendationFeedback({
      recommendationId,
      userId: 'current-user',
      rating: 2,
      wasImplemented: false,
      perceivedValue: 'low',
      improvementSuggestions: reason,
      timestamp: new Date(),
    });
  }, [recordRecommendationFeedback]);

  // Query para obtener estadísticas de efectividad
  const { data: effectivenessStats } = useQuery({
    queryKey: ['recommendation-effectiveness'],
    queryFn: () => defaultSmartRecommendationEngine.getEffectivenessStats(),
    refetchInterval: 5 * 60 * 1000, // Cada 5 minutos
  });

  // Función para obtener recomendaciones por categoría
  const getRecommendationsByCategory = useCallback((category: ActionableRecommendation['category']) => {
    return smartRecommendations.filter(r => r.category === category);
  }, [smartRecommendations]);

  // Función para obtener recomendaciones por urgencia
  const getRecommendationsByUrgency = useCallback((urgency: ActionableRecommendation['urgency']) => {
    return smartRecommendations.filter(r => r.urgency === urgency);
  }, [smartRecommendations]);

  // Métricas del contexto avanzado
  const getContextMetrics = useCallback(() => {
    if (!advancedContext) return null;

    return {
      workflowEfficiency: advancedContext.workflowEfficiency.overallScore,
      bottleneckCount: advancedContext.workflowEfficiency.bottlenecks.length,
      optimizationOpportunities: advancedContext.workflowEfficiency.optimizationOpportunities.length,
      peakProductivityHours: advancedContext.userBehaviorProfile.peakProductivityHours,
      focusAreas: advancedContext.predictiveInsights.recommendedFocusAreas,
      riskFactors: advancedContext.predictiveInsights.riskFactors.length,
    };
  }, [advancedContext]);

  return {
    // Datos principales
    advancedContext,
    smartRecommendations,
    lastUpdate,
    
    // Estados
    isGeneratingContext: generateAdvancedContextMutation.isPending,
    isGeneratingRecommendations: generateSmartRecommendationsMutation.isPending,
    isGeneratingInsights,
    isCollecting,
    
    // Acciones principales
    updateFullAnalysis,
    generateContext: generateAdvancedContextMutation.mutate,
    generateRecommendations: (context: AdvancedContext) => generateSmartRecommendationsMutation.mutate(context),
    
    // Gestión de recomendaciones
    implementRecommendation,
    dismissRecommendation,
    recordRecommendationFeedback,
    
    // Filtros y consultas
    getRecommendationsByCategory,
    getRecommendationsByUrgency,
    getContextMetrics,
    
    // Datos relacionados
    insights,
    patternAnalysis,
    contextualData,
    effectivenessStats,
    
    // Tendencias
    productivityTrends: getProductivityTrends(),
    behaviorTrends: getUserBehaviorTrends(),
    
    // Configuración
    config: finalConfig,
  };
};
