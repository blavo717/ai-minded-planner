
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useContextualData } from './useContextualData';
import { AIContext } from '@/types/ai-context-advanced';

export const useAIContext = () => {
  const [currentContext, setCurrentContext] = useState<AIContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // CORREGIDO: useRef para evitar regeneración constante
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  
  const { user } = useAuth();

  // NUEVO: Usar useContextualData para obtener datos reales de Supabase
  const {
    context: realContext,
    analysis,
    isLoading: isContextLoading,
    lastUpdate,
    dataQuality,
    recommendations,
    updateContextualData,
    hasHighQualityData,
  } = useContextualData({
    enableAnalysis: true,
    refreshInterval: 60000, // 1 minuto
    priorityThreshold: 50,
    maxDataPoints: 50,
  });

  // CORREGIDO: refreshContext memoizado que usa datos reales
  const refreshContext = useCallback(async () => {
    if (!user?.id || isRefreshingRef.current) {
      return;
    }

    // Evitar múltiples refreshes simultáneos
    isRefreshingRef.current = true;
    
    try {
      console.log('🔄 Refrescando contexto AI con datos reales...');
      setIsLoading(true);
      
      // Actualizar datos contextuales reales
      await updateContextualData();
      
    } catch (error) {
      console.error('❌ Error refrescando contexto:', error);
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [user?.id, updateContextualData]);

  // NUEVO: Mapear el contexto real al formato AIContext
  useEffect(() => {
    if (realContext && !isContextLoading) {
      const mappedContext: AIContext = {
        userInfo: {
          pendingTasks: realContext.userInfo?.pendingTasks || 0,
          hasActiveProjects: realContext.userInfo?.hasActiveProjects || false,
          currentFocusArea: realContext.userInfo?.currentFocusArea || 'productivity'
        },
        currentSession: {
          timeOfDay: realContext.currentSession?.timeOfDay || 'morning',
          workingHours: realContext.currentSession?.isWeekend === false,
          productivity: realContext.productivity?.completionRate || 0
        },
        contextQuality: {
          score: dataQuality / 100,
          completeness: hasHighQualityData ? 0.9 : 0.5,
          freshness: lastUpdate ? 0.8 : 0.3
        },
        insights: analysis?.insights || [],
        suggestions: recommendations.map(rec => ({
          id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'task' as const,
          title: rec,
          description: rec,
          priority: 50,
          estimatedTime: 15,
          benefits: []
        })) || [],
        trends: analysis?.trends || [],
        metrics: {
          contextProcessingTime: 0,
          analysisAccuracy: dataQuality / 100,
          recommendationRelevance: hasHighQualityData ? 0.8 : 0.5,
          cacheEfficiency: 0.75
        }
      };

      setCurrentContext(mappedContext);
      setLastRefresh(new Date());

      console.log('✅ Contexto AI actualizado con datos REALES:', {
        userTasks: mappedContext.userInfo?.pendingTasks,
        userProjects: mappedContext.userInfo?.hasActiveProjects,
        contextQuality: mappedContext.contextQuality?.score,
        dataSource: 'SUPABASE_REAL_DATA',
        hasRealTasks: realContext.recentTasks?.length > 0,
        hasRealProjects: realContext.recentProjects?.length > 0,
        totalRecommendations: recommendations.length
      });
    }
  }, [realContext, isContextLoading, dataQuality, hasHighQualityData, lastUpdate, recommendations, analysis]);

  // CORREGIDO: Auto-refresh con cleanup adecuado
  useEffect(() => {
    if (!user?.id || !currentContext) return;

    // Limpiar timeout previo
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Auto-refresh cada 5 minutos
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-refresh de contexto con datos reales...');
      refreshContext();
    }, 5 * 60 * 1000);

    // Cleanup al desmontar
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
    };
  }, [user?.id, currentContext, refreshContext]);

  // CORREGIDO: Cleanup general al desmontar
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      isRefreshingRef.current = false;
    };
  }, []);

  return {
    currentContext,
    isLoading: isLoading || isContextLoading,
    lastRefresh: lastRefresh || lastUpdate,
    refreshContext,
    contextAvailable: !!currentContext && hasHighQualityData,
    contextQuality: currentContext?.contextQuality?.score || 0,
    
    // NUEVO: Información adicional sobre la calidad de datos reales
    dataSource: 'SUPABASE',
    hasRealData: hasHighQualityData,
    realDataQuality: dataQuality,
  };
};
