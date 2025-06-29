
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdvancedContextEngine } from '@/utils/ai/AdvancedContextEngine';
import { AIContext } from '@/types/ai-context-advanced';

export const useAIContext = () => {
  const [currentContext, setCurrentContext] = useState<AIContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  // CORREGIDO: useRef para evitar regeneración constante
  const contextEngineRef = useRef<AdvancedContextEngine | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  
  const { user } = useAuth();

  // CORREGIDO: Inicializar ContextEngine solo una vez
  useEffect(() => {
    if (user?.id && !contextEngineRef.current) {
      console.log('🔧 Inicializando AdvancedContextEngine...');
      contextEngineRef.current = new AdvancedContextEngine();
    }
  }, [user?.id]); // Solo depende de user?.id

  // CORREGIDO: refreshContext memoizado para evitar regeneración
  const refreshContext = useCallback(async () => {
    if (!user?.id || !contextEngineRef.current || isRefreshingRef.current) {
      return;
    }

    // Evitar múltiples refreshes simultáneos
    isRefreshingRef.current = true;
    
    try {
      console.log('🔄 Refrescando contexto AI...');
      setIsLoading(true);
      
      const newContext = await contextEngineRef.current.generateContext(user.id);
      
      setCurrentContext(newContext);
      setLastRefresh(new Date());
      
      console.log('✅ Contexto AI actualizado:', {
        userTasks: newContext.userInfo?.pendingTasks,
        userProjects: newContext.userInfo?.hasActiveProjects,
        contextQuality: newContext.contextQuality?.score
      });
      
    } catch (error) {
      console.error('❌ Error refrescando contexto:', error);
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [user?.id]); // Solo depende de user?.id

  // CORREGIDO: Cargar contexto inicial solo una vez
  useEffect(() => {
    if (user?.id && !currentContext && !isLoading && !isRefreshingRef.current) {
      console.log('🚀 Cargando contexto inicial...');
      refreshContext();
    }
  }, [user?.id, currentContext, isLoading, refreshContext]);

  // CORREGIDO: Auto-refresh con cleanup adecuado
  useEffect(() => {
    if (!user?.id || !currentContext) return;

    // Limpiar timeout previo
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Auto-refresh cada 5 minutos
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Auto-refresh de contexto...');
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
    isLoading,
    lastRefresh,
    refreshContext, // Esta función ahora está memoizada
    contextAvailable: !!currentContext,
    contextQuality: currentContext?.contextQuality?.score || 0,
  };
};
