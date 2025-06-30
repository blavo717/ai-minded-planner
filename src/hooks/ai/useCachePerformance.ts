
import { useState, useEffect, useCallback } from 'react';
import { conversationCache } from './services/conversationCache';
import { messageHistoryService } from './services/messageHistoryService';

interface CachePerformanceMetrics {
  conversationCache: {
    hitRate: number;
    totalEntries: number;
    totalMessages: number;
    memoryUsage: number;
    avgConversationSize: number;
  };
  historyCache: {
    size: number;
    users: string[];
  };
  overallPerformance: {
    combinedHitRate: number;
    totalMemoryUsage: number;
    cacheEfficiency: number;
  };
}

export const useCachePerformance = (monitoringInterval: number = 30000) => {
  const [metrics, setMetrics] = useState<CachePerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const updateMetrics = useCallback(() => {
    try {
      const conversationStats = conversationCache.getStats();
      const { history: historyStats } = messageHistoryService.getCacheStats();

      const combinedHitRate = conversationStats.hitRate;
      const totalMemoryUsage = conversationStats.memoryUsage;
      const cacheEfficiency = conversationStats.hitRate > 0 ? 
        (conversationStats.hitRate / 100) * (conversationStats.totalMessages / Math.max(conversationStats.totalEntries, 1)) : 0;

      const newMetrics: CachePerformanceMetrics = {
        conversationCache: {
          hitRate: conversationStats.hitRate,
          totalEntries: conversationStats.totalEntries,
          totalMessages: conversationStats.totalMessages,
          memoryUsage: conversationStats.memoryUsage,
          avgConversationSize: conversationStats.avgConversationSize,
        },
        historyCache: {
          size: historyStats.size,
          users: historyStats.users,
        },
        overallPerformance: {
          combinedHitRate,
          totalMemoryUsage,
          cacheEfficiency,
        },
      };

      setMetrics(newMetrics);
      
      console.log('📊 Cache Performance Update:', {
        hitRate: `${combinedHitRate.toFixed(1)}%`,
        memoryUsage: `${totalMemoryUsage}KB`,
        efficiency: `${(cacheEfficiency * 100).toFixed(1)}%`,
        conversations: conversationStats.totalEntries,
        messages: conversationStats.totalMessages,
      });

    } catch (error) {
      console.error('❌ Error updating cache metrics:', error);
    }
  }, []);

  const startMonitoring = useCallback(() => {
    if (!isMonitoring) {
      setIsMonitoring(true);
      updateMetrics(); // Actualización inicial
      console.log('🔍 Iniciando monitoreo de cache performance...');
    }
  }, [isMonitoring, updateMetrics]);

  const stopMonitoring = useCallback(() => {
    if (isMonitoring) {
      setIsMonitoring(false);
      console.log('⏹️ Deteniendo monitoreo de cache performance...');
    }
  }, [isMonitoring]);

  const clearAllCaches = useCallback(() => {
    conversationCache.clear();
    messageHistoryService.clearCache();
    updateMetrics();
    console.log('🧹 Todos los caches limpiados');
  }, [updateMetrics]);

  const getPopularConversations = useCallback(() => {
    return conversationCache.getPopularConversations(10);
  }, []);

  // Efecto para monitoreo automático
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateMetrics, monitoringInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, monitoringInterval, updateMetrics]);

  // Inicializar métricas al montar
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMetrics,
    clearAllCaches,
    getPopularConversations,
  };
};
