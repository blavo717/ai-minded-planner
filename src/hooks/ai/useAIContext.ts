
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGeneralStats } from '@/hooks/analytics/useGeneralStats';
import { useProductivityMetrics } from '@/hooks/analytics/useProductivityMetrics';
import { useWorkPatterns } from '@/hooks/analytics/useWorkPatterns';
import { SmartPromptContext } from '@/types/ai-prompts';
import { AIContextConfig, ExtendedAIContext } from '@/types/ai-context';
import { DEFAULT_AI_CONTEXT_CONFIG } from '@/utils/ai/contextConfig';
import {
  generateUserContext,
  generateSessionContext,
  generateRecentActivity,
  generateProductivityContext,
  generateWorkPatternsContext,
} from '@/utils/ai/contextGenerators';
import { getRecentTasks, getRecentProjects } from '@/utils/ai/dataHelpers';

export const useAIContext = (config: AIContextConfig = {}) => {
  const { user } = useAuth();
  const { mainTasks } = useTasks();
  const { projects } = useProjects();
  const { data: generalStats } = useGeneralStats();
  const { data: productivityMetrics } = useProductivityMetrics('week');
  const { data: workPatterns } = useWorkPatterns('week');

  const finalConfig = { ...DEFAULT_AI_CONTEXT_CONFIG, ...config };
  
  const [contextCache, setContextCache] = useState<ExtendedAIContext | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  // Generar contexto completo
  const generateFullContext = useCallback((): ExtendedAIContext => {
    const baseContext: SmartPromptContext = {
      userInfo: generateUserContext(user, generalStats),
      currentSession: generateSessionContext(),
      recentActivity: generateRecentActivity(mainTasks),
    };

    return {
      ...baseContext,
      productivity: generateProductivityContext(
        productivityMetrics, 
        finalConfig.includeProductivityMetrics || false
      ),
      workPatterns: generateWorkPatternsContext(
        workPatterns, 
        finalConfig.includeWorkPatterns || false
      ),
      recentTasks: getRecentTasks(mainTasks, finalConfig.maxRecentTasks || 10),
      recentProjects: getRecentProjects(projects, finalConfig.maxRecentProjects || 5),
    };
  }, [
    user,
    generalStats,
    mainTasks,
    productivityMetrics,
    workPatterns,
    projects,
    finalConfig.includeProductivityMetrics,
    finalConfig.includeWorkPatterns,
    finalConfig.maxRecentTasks,
    finalConfig.maxRecentProjects,
  ]);

  // Actualizar contexto
  const updateContext = useCallback(async () => {
    setIsUpdating(true);
    try {
      const newContext = generateFullContext();
      setContextCache(newContext);
      setLastUpdateTime(new Date());
    } catch (error) {
      console.error('Error updating AI context:', error);
    } finally {
      setIsUpdating(false);
    }
  }, [generateFullContext]);

  // Forzar actualización del contexto
  const refreshContext = useCallback(() => {
    updateContext();
  }, [updateContext]);

  // Verificar si el contexto necesita actualización
  const needsUpdate = useMemo(() => {
    if (!contextCache) return true;
    
    const timeSinceUpdate = new Date().getTime() - lastUpdateTime.getTime();
    const updateInterval = finalConfig.contextRefreshInterval! * 1000;
    
    return timeSinceUpdate > updateInterval;
  }, [contextCache, lastUpdateTime, finalConfig.contextRefreshInterval]);

  // Obtener contexto optimizado (con cache)
  const getOptimizedContext = useCallback((): ExtendedAIContext => {
    if (needsUpdate || !contextCache) {
      // Si necesita actualización, generar contexto fresco
      return generateFullContext();
    }
    
    // Usar contexto en cache pero actualizar información temporal
    return {
      ...contextCache,
      currentSession: generateSessionContext(),
    };
  }, [needsUpdate, contextCache, generateFullContext]);

  // Auto-actualización periódica
  useEffect(() => {
    if (!finalConfig.enableRealtimeUpdates) return;

    const interval = setInterval(() => {
      if (needsUpdate) {
        updateContext();
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [finalConfig.enableRealtimeUpdates, needsUpdate, updateContext]);

  // Actualización inicial
  useEffect(() => {
    updateContext();
  }, [user?.id]); // Solo cuando cambie el usuario

  // Detectar cambios en datos relevantes
  useEffect(() => {
    if (finalConfig.enableRealtimeUpdates) {
      updateContext();
    }
  }, [mainTasks.length, projects.length, generalStats, updateContext, finalConfig.enableRealtimeUpdates]);

  // API para componentes externos
  return {
    // Contexto actual
    currentContext: getOptimizedContext(),
    
    // Estado de actualización
    isUpdating,
    lastUpdateTime,
    
    // Controles manuales
    refreshContext,
    
    // Información de configuración
    config: finalConfig,
    
    // Utilidades de contexto
    getBaseContext: () => ({
      userInfo: generateUserContext(user, generalStats),
      currentSession: generateSessionContext(),
      recentActivity: generateRecentActivity(mainTasks),
    }),
    
    // Verificaciones de estado
    hasActiveContext: !!contextCache,
    needsUpdate,
    
    // Contexto simplificado para prompts básicos
    getSimpleContext: (): SmartPromptContext => ({
      userInfo: generateUserContext(user, generalStats),
      currentSession: generateSessionContext(),
      recentActivity: generateRecentActivity(mainTasks),
    }),
  };
};

// Hook simplificado para casos básicos
export const useSimpleAIContext = (): SmartPromptContext => {
  const { getSimpleContext } = useAIContext({ 
    enableRealtimeUpdates: false,
    includeProductivityMetrics: false,
    includeWorkPatterns: false,
  });
  
  return getSimpleContext();
};
